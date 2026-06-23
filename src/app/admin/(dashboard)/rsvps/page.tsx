import { getAllRsvps } from "@/lib/adminData";

export const dynamic = "force-dynamic";

function attendList(
  attendance: Record<string, boolean>,
  events: { id: string; name: string }[]
) {
  const yes = events.filter((e) => attendance[e.id]).map((e) => e.name);
  return yes.length ? yes.join(", ") : "—";
}

export default async function AdminRsvps() {
  const { events, parties } = await getAllRsvps();
  const totalGuests = parties.reduce((n, p) => n + p.guests.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-maroon">RSVPs</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {parties.length} parties · {totalGuests} guests
          </p>
        </div>
        <a
          href="/admin/rsvps/export"
          className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark"
        >
          Export CSV
        </a>
      </div>

      {parties.length === 0 ? (
        <p className="text-foreground/60">No RSVPs yet.</p>
      ) : (
        <div className="space-y-4">
          {parties.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-gold/25 bg-white/60">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/20 bg-cream/30 px-5 py-3">
                <p className="font-medium text-foreground">{p.display_name}</p>
                <p className="text-sm text-foreground/60">
                  {p.contact_email}
                  {p.contact_phone ? ` · ${p.contact_phone}` : ""}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/55">
                    <th className="px-5 py-2 font-medium">Guest</th>
                    <th className="px-5 py-2 font-medium">Attending</th>
                    <th className="px-5 py-2 font-medium">Dietary notes</th>
                  </tr>
                </thead>
                <tbody>
                  {p.guests.map((g) => (
                    <tr key={g.id} className="border-t border-gold/10">
                      <td className="px-5 py-2">
                        {g.full_name}
                        {g.is_primary && (
                          <span className="ml-2 text-xs text-gold">(primary)</span>
                        )}
                      </td>
                      <td className="px-5 py-2 text-foreground/75">
                        {attendList(g.attendance, events)}
                      </td>
                      <td className="px-5 py-2 text-foreground/75">
                        {g.dietary_notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
