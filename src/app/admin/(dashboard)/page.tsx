import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function getOverview() {
  const supabase = createServiceClient();
  const [parties, guests, events, attendance, items] = await Promise.all([
    supabase.from("parties").select("id", { count: "exact", head: true }),
    supabase.from("guests").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id, name, display_order").order("display_order"),
    supabase.from("event_attendance").select("event_id, attending").eq("attending", true),
    supabase.from("registry_items").select("id, status, held_until"),
  ]);

  const attendingByEvent = new Map<string, number>();
  for (const row of attendance.data ?? []) {
    attendingByEvent.set(row.event_id, (attendingByEvent.get(row.event_id) ?? 0) + 1);
  }

  // Count by the item's *effective* status (a planning hold past its expiry no
  // longer counts), matching the public registry.
  const now = Date.now();
  const itemRows = items.data ?? [];
  const planning = itemRows.filter(
    (i) => i.status === "planning" && i.held_until != null && new Date(i.held_until).getTime() > now
  ).length;
  const purchased = itemRows.filter((i) => i.status === "purchased").length;

  return {
    parties: parties.count ?? 0,
    guests: guests.count ?? 0,
    events: events.data ?? [],
    attendingByEvent,
    items: itemRows,
    planning,
    purchased,
  };
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-white/60 p-5">
      <p className="font-display text-3xl font-semibold text-maroon">{value}</p>
      <p className="mt-1 text-sm text-foreground/60">{label}</p>
    </div>
  );
}

export default async function AdminOverview() {
  const o = await getOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon">Overview</h1>
        <p className="mt-1 text-sm text-foreground/60">
          A snapshot of RSVPs and the registry.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Parties" value={o.parties} />
        <Stat label="Total guests" value={o.guests} />
        <Stat label="Registry: planning" value={o.planning} />
        <Stat label="Registry: purchased" value={o.purchased} />
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
          Attendance by event
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {o.events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-gold/25 bg-white/60 p-5">
              <p className="font-display text-2xl font-semibold text-maroon">
                {o.attendingByEvent.get(e.id) ?? 0}
              </p>
              <p className="mt-1 text-sm text-foreground/60">attending {e.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/rsvps" className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark">
          View all RSVPs
        </Link>
        <Link href="/admin/registry" className="rounded-full border border-maroon/30 px-5 py-2 text-sm font-medium text-maroon hover:bg-maroon/5">
          Manage registry
        </Link>
      </div>
    </div>
  );
}
