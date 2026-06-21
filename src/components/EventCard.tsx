import type { Event } from "@/types/database";
import { formatEventDate, formatEventTime, mapsLink } from "@/lib/getEvents";

// A tasteful per-event placeholder banner until real photos land (Phase 7).
const banners: Record<string, string> = {
  Haldi: "from-marigold/80 to-amber-300/70",
  "Sangeeth & Mehendi": "from-maroon/80 to-rose-400/60",
  Wedding: "from-gold/80 to-maroon/70",
};

export default function EventCard({ event }: { event: Event }) {
  const banner = banners[event.name] ?? "from-gold/70 to-maroon/60";

  return (
    <article className="overflow-hidden rounded-2xl border border-gold/25 bg-white/60 shadow-sm">
      <div
        className={`flex h-32 items-center justify-center bg-gradient-to-br ${banner} sm:h-40`}
      >
        <span className="font-display text-3xl font-semibold text-white drop-shadow-sm sm:text-4xl">
          {event.name}
        </span>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-medium text-foreground">
            {formatEventDate(event.date)}
          </p>
          <p className="text-maroon">{formatEventTime(event.start_time)}</p>
        </div>

        {event.description && (
          <p className="text-sm text-foreground/70">{event.description}</p>
        )}

        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-foreground/55">Venue</dt>
            <dd className="text-foreground/85">{event.venue}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-foreground/55">Address</dt>
            <dd>
              <a
                href={mapsLink(event.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-maroon underline decoration-gold/40 underline-offset-2 hover:decoration-maroon"
              >
                {event.address}
              </a>
            </dd>
          </div>
          {event.dress_code && (
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-foreground/55">Dress</dt>
              <dd className="text-foreground/85">{event.dress_code}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
