import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeEmail, normalizePhone } from "@/lib/rsvp";
import { limitByIp, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

type IncomingGuest = {
  id?: string;
  full_name: string;
  dietary_notes?: string | null;
  is_primary?: boolean;
  attendance: Record<string, boolean>;
};

type Payload = {
  token?: string | null;
  email: string;
  phone: string;
  guests: IncomingGuest[];
  removedGuestIds?: string[];
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create or update an RSVP via self-registration. A party is keyed by the
// primary's email + mobile; submitting again with the same pair updates the
// existing RSVP rather than creating a duplicate.
export async function POST(req: NextRequest) {
  const limit = limitByIp(req, "rsvp-submit", 15, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: Payload & { turnstile_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.turnstile_token, getClientIp(req)))) {
    return NextResponse.json(
      { error: "Spam check failed. Please refresh and try again." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(body.email ?? "");
  const phone = normalizePhone(body.phone ?? "");
  const incoming = (body.guests ?? []).filter(
    (g) => g.full_name && g.full_name.trim().length > 0
  );

  if (!emailRe.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone.length < 7) {
    return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
  }
  if (incoming.length === 0) {
    return NextResponse.json({ error: "Please enter at least your own name." }, { status: 400 });
  }

  const primary = incoming.find((g) => g.is_primary) ?? incoming[0];
  const displayName = primary.full_name.trim();
  const supabase = createServiceClient();

  // --- Resolve the party: token first, then contact, else create new. ---
  let partyId: string | null = null;
  let token: string | null = null;

  if (body.token) {
    const { data } = await supabase
      .from("parties")
      .select("id, invite_code")
      .eq("invite_code", body.token)
      .maybeSingle();
    if (data) {
      partyId = data.id;
      token = data.invite_code;
    }
  }

  if (!partyId) {
    const { data } = await supabase
      .from("parties")
      .select("id, invite_code")
      .eq("contact_email", email)
      .eq("contact_phone", phone)
      .maybeSingle();
    if (data) {
      partyId = data.id;
      token = data.invite_code;
    }
  }

  if (!partyId) {
    token = randomUUID().replace(/-/g, "").slice(0, 16);
    const { data, error } = await supabase
      .from("parties")
      .insert({
        invite_code: token,
        display_name: displayName,
        contact_email: email,
        contact_phone: phone,
      })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: "Could not start your RSVP. Please try again." },
        { status: 500 }
      );
    }
    partyId = data.id;
  } else {
    // Update contact/display on the existing party. A different party may
    // already own this email+phone (unique index) — surface that clearly.
    const { error } = await supabase
      .from("parties")
      .update({ display_name: displayName, contact_email: email, contact_phone: phone })
      .eq("id", partyId);
    if (error) {
      return NextResponse.json(
        {
          error:
            "That email and mobile are already linked to a different RSVP. Use the same details you first registered with.",
        },
        { status: 409 }
      );
    }
  }

  // --- Sync guests. ---
  // A submission WITH a token is an edit of a loaded RSVP, so we reconcile by
  // id. A submission WITHOUT a token is a fresh fill of the form: even if it
  // deduped onto an existing party (same email+mobile), we replace the guest
  // list wholesale so a blind re-entry can't create duplicate people.
  const isEdit = !!body.token;

  if (!isEdit) {
    // Wipe existing members (cascades attendance); submitted guests insert fresh.
    await supabase.from("guests").delete().eq("party_id", partyId);
  }

  const { data: existing } = await supabase
    .from("guests")
    .select("id, is_primary")
    .eq("party_id", partyId);
  const ownIds = new Set((existing ?? []).map((g) => g.id));
  const primaryIds = new Set((existing ?? []).filter((g) => g.is_primary).map((g) => g.id));

  const toRemove = (body.removedGuestIds ?? []).filter(
    (id) => ownIds.has(id) && !primaryIds.has(id)
  );
  if (toRemove.length) {
    await supabase.from("guests").delete().in("id", toRemove);
  }

  const { data: events } = await supabase.from("events").select("id");
  const validEventIds = new Set((events ?? []).map((e) => e.id));

  const resolved: { id: string; attendance: Record<string, boolean> }[] = [];
  for (const g of incoming) {
    const name = g.full_name.trim();
    const notes = g.dietary_notes?.trim() || null;
    const isPrimary = g === primary;

    if (g.id && ownIds.has(g.id)) {
      await supabase
        .from("guests")
        .update({ full_name: name, dietary_notes: notes, is_primary: isPrimary })
        .eq("id", g.id);
      resolved.push({ id: g.id, attendance: g.attendance });
    } else {
      const { data: inserted, error } = await supabase
        .from("guests")
        .insert({
          party_id: partyId,
          full_name: name,
          dietary_notes: notes,
          is_primary: isPrimary,
        })
        .select("id")
        .single();
      if (error || !inserted) {
        return NextResponse.json(
          { error: "Could not save a guest. Please try again." },
          { status: 500 }
        );
      }
      resolved.push({ id: inserted.id, attendance: g.attendance });
    }
  }

  const rows: { guest_id: string; event_id: string; attending: boolean }[] = [];
  for (const r of resolved) {
    for (const [eventId, attending] of Object.entries(r.attendance)) {
      if (validEventIds.has(eventId)) {
        rows.push({ guest_id: r.id, event_id: eventId, attending: !!attending });
      }
    }
  }
  if (rows.length) {
    const { error } = await supabase
      .from("event_attendance")
      .upsert(rows, { onConflict: "guest_id,event_id" });
    if (error) {
      return NextResponse.json(
        { error: "Could not save attendance. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, token, guests: resolved });
}
