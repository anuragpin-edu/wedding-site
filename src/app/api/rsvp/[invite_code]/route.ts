import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

type IncomingGuest = {
  id?: string;
  full_name: string;
  dietary_notes?: string | null;
  attendance: Record<string, boolean>;
};

type Payload = {
  guests: IncomingGuest[];
  removedGuestIds?: string[];
};

// Submit (or update) an RSVP for a party. The invite_code in the URL is the
// credential: we look up the party, then only ever touch rows that belong to
// it. Guest tables are deny-by-default under RLS — all access is here, via the
// service-role client, after this authorization check.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invite_code: string }> }
) {
  const { invite_code } = await params;
  const supabase = createServiceClient();

  // 1. Resolve the party.
  const { data: party } = await supabase
    .from("parties")
    .select("id")
    .eq("invite_code", invite_code)
    .maybeSingle();

  if (!party) {
    return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });
  }

  // 2. Parse + basic validation.
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const incoming = (body.guests ?? []).filter(
    (g) => g.full_name && g.full_name.trim().length > 0
  );
  if (incoming.length === 0) {
    return NextResponse.json(
      { error: "At least one guest with a name is required." },
      { status: 400 }
    );
  }

  // 3. Establish the set of guest ids and event ids that legitimately belong
  //    to this party / this wedding, so a crafted payload can't reach others.
  const [{ data: existingGuests }, { data: events }] = await Promise.all([
    supabase.from("guests").select("id, is_primary").eq("party_id", party.id),
    supabase.from("events").select("id"),
  ]);

  const ownGuestIds = new Set((existingGuests ?? []).map((g) => g.id));
  const primaryIds = new Set(
    (existingGuests ?? []).filter((g) => g.is_primary).map((g) => g.id)
  );
  const validEventIds = new Set((events ?? []).map((e) => e.id));

  // 4. Remove members the guest deleted (never a primary, never cross-party).
  const toRemove = (body.removedGuestIds ?? []).filter(
    (id) => ownGuestIds.has(id) && !primaryIds.has(id)
  );
  if (toRemove.length) {
    await supabase.from("guests").delete().in("id", toRemove);
  }

  // 5. Upsert each submitted guest and collect their resolved id.
  const resolved: { id: string; attendance: Record<string, boolean> }[] = [];

  for (const g of incoming) {
    const name = g.full_name.trim();
    const notes = g.dietary_notes?.trim() || null;

    if (g.id && ownGuestIds.has(g.id)) {
      await supabase
        .from("guests")
        .update({ full_name: name, dietary_notes: notes })
        .eq("id", g.id);
      resolved.push({ id: g.id, attendance: g.attendance });
    } else {
      const { data: inserted, error } = await supabase
        .from("guests")
        .insert({
          party_id: party.id,
          full_name: name,
          dietary_notes: notes,
          is_primary: false,
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

  // 6. Write per-event attendance (one row per guest per valid event).
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

  return NextResponse.json({ ok: true });
}
