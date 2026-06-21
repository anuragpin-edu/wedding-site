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

// Loads a party by invite code along with its members, each member's
// per-event attendance, and the list of events. Returns null if the code
// doesn't match any party. Service-role access — callers must treat the
// invite code itself as the credential.
export async function getPartyByCode(
  inviteCode: string
): Promise<PartyData | null> {
  const supabase = createServiceClient();

  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (!party) return null;

  const [{ data: guests }, { data: events }] = await Promise.all([
    supabase
      .from("guests")
      .select("*")
      .eq("party_id", party.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("events")
      .select("*")
      .order("display_order", { ascending: true }),
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
    events: events ?? [],
    // "Responded" = at least one attendance row exists for the party.
    hasResponded: (attendance ?? []).length > 0,
  };
}
