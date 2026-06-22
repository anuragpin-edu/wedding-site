import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { Event, Guest, Party } from "@/types/database";

export type PartyGuest = Guest & {
  // event_id -> attending
  attendance: Record<string, boolean>;
};

export type PartyData = {
  party: Party;
  guests: PartyGuest[];
  events: Event[];
  hasResponded: boolean;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Keep only digits so "(770) 707-9976" and "7707079976" match.
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function loadEvents() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

async function assemble(party: Party): Promise<PartyData> {
  const supabase = createServiceClient();
  const [{ data: guests }, events] = await Promise.all([
    supabase
      .from("guests")
      .select("*")
      .eq("party_id", party.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
    loadEvents(),
  ]);

  const guestIds = (guests ?? []).map((g) => g.id);
  const { data: attendance } = guestIds.length
    ? await supabase
        .from("event_attendance")
        .select("guest_id, event_id, attending")
        .in("guest_id", guestIds)
    : { data: [] as { guest_id: string; event_id: string; attending: boolean }[] };

  const byGuest = new Map<string, Record<string, boolean>>();
  for (const row of attendance ?? []) {
    const map = byGuest.get(row.guest_id) ?? {};
    map[row.event_id] = row.attending;
    byGuest.set(row.guest_id, map);
  }

  const partyGuests: PartyGuest[] = (guests ?? []).map((g) => ({
    ...g,
    attendance: byGuest.get(g.id) ?? {},
  }));

  return {
    party,
    guests: partyGuests,
    events,
    hasResponded: (attendance ?? []).length > 0,
  };
}

// Load a party by its internal edit token (kept in the guest's browser).
export async function getPartyByToken(token: string): Promise<PartyData | null> {
  const supabase = createServiceClient();
  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("invite_code", token)
    .maybeSingle();
  return party ? assemble(party) : null;
}

// Look up a party by the primary's email + mobile (cross-device retrieval).
// Requires BOTH to match exactly — un-guessable, so no enumeration risk.
export async function getPartyByContact(
  email: string,
  phone: string
): Promise<PartyData | null> {
  const supabase = createServiceClient();
  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("contact_email", normalizeEmail(email))
    .eq("contact_phone", normalizePhone(phone))
    .maybeSingle();
  return party ? assemble(party) : null;
}

// For the first-time RSVP form, which only needs the event list.
export async function getEventsForForm(): Promise<Event[]> {
  return loadEvents();
}
