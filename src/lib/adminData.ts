import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { reconcileExpiredHolds } from "@/lib/registry";
import type { Event, RegistryItem } from "@/types/database";

export type AdminGuest = {
  id: string;
  full_name: string;
  is_primary: boolean;
  dietary_notes: string | null;
  attendance: Record<string, boolean>; // event_id -> attending
};

export type AdminParty = {
  id: string;
  display_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  guests: AdminGuest[];
};

export type RsvpData = {
  events: Event[];
  parties: AdminParty[];
};

// Full RSVP data for the admin views and CSV export.
export async function getAllRsvps(): Promise<RsvpData> {
  const supabase = createServiceClient();
  const [{ data: parties }, { data: guests }, { data: events }, { data: attendance }] =
    await Promise.all([
      supabase.from("parties").select("*").order("created_at", { ascending: true }),
      supabase.from("guests").select("*"),
      supabase.from("events").select("*").order("display_order", { ascending: true }),
      supabase.from("event_attendance").select("guest_id, event_id, attending"),
    ]);

  const attByGuest = new Map<string, Record<string, boolean>>();
  for (const row of attendance ?? []) {
    const m = attByGuest.get(row.guest_id) ?? {};
    m[row.event_id] = row.attending;
    attByGuest.set(row.guest_id, m);
  }

  const guestsByParty = new Map<string, AdminGuest[]>();
  for (const g of guests ?? []) {
    const list = guestsByParty.get(g.party_id) ?? [];
    list.push({
      id: g.id,
      full_name: g.full_name,
      is_primary: g.is_primary,
      dietary_notes: g.dietary_notes,
      attendance: attByGuest.get(g.id) ?? {},
    });
    guestsByParty.set(g.party_id, list);
  }
  // Primary first within each party.
  for (const list of guestsByParty.values()) {
    list.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  }

  return {
    events: events ?? [],
    parties: (parties ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name,
      contact_email: p.contact_email,
      contact_phone: p.contact_phone,
      created_at: p.created_at,
      guests: guestsByParty.get(p.id) ?? [],
    })),
  };
}

export type AdminClaim = {
  claimer_name: string;
  claimer_email: string | null;
  claimer_phone: string | null;
  claimer_message: string | null;
  order_id: string | null;
  status: "planning" | "purchased";
  party_name: string | null;
  claimed_at: string;
};

export type AdminRegistryItem = RegistryItem & {
  // Effective status after applying the 6-hour hold expiry — matches what the
  // public registry shows, so the two views never disagree.
  effective_status: "available" | "planning" | "purchased";
  claim: AdminClaim | null;
};

function holdLive(held_until: string | null): boolean {
  return held_until != null && new Date(held_until).getTime() > Date.now();
}

// Registry items with the active (non-released) claim and its contact details
// for the couple's reference. Contact info is admin-only and never public.
export async function getRegistryAdmin(): Promise<AdminRegistryItem[]> {
  const supabase = createServiceClient();
  await reconcileExpiredHolds();
  const [{ data: items }, { data: claims }, { data: parties }] = await Promise.all([
    supabase
      .from("registry_items")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("registry_claims")
      .select("*")
      .eq("released", false)
      .order("claimed_at", { ascending: false }),
    supabase.from("parties").select("id, display_name"),
  ]);

  const partyName = new Map((parties ?? []).map((p) => [p.id, p.display_name]));
  const claimByItem = new Map<string, AdminClaim>();
  for (const c of claims ?? []) {
    if (!claimByItem.has(c.registry_item_id)) {
      claimByItem.set(c.registry_item_id, {
        claimer_name: c.claimer_name,
        claimer_email: c.claimer_email,
        claimer_phone: c.claimer_phone,
        claimer_message: c.claimer_message,
        order_id: c.order_id,
        status: c.status,
        party_name: c.party_id ? partyName.get(c.party_id) ?? null : null,
        claimed_at: c.claimed_at,
      });
    }
  }

  return (items ?? []).map((it) => {
    // A planning hold that has expired counts as available again — so don't
    // show its (now stale) claim as active.
    let effective: AdminRegistryItem["effective_status"] = "available";
    if (it.status === "purchased") effective = "purchased";
    else if (it.status === "planning" && holdLive(it.held_until)) effective = "planning";

    return {
      ...it,
      effective_status: effective,
      claim: effective === "available" ? null : claimByItem.get(it.id) ?? null,
    };
  });
}
