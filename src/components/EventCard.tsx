import type { Event } from "@/types/database";
import { formatEventDate, formatEventTime, mapsLink } from "@/lib/getEvents";
import { MapPinIcon, CalendarIcon, ClockIcon, HangerIcon } from "@/components/icons";
import AddToCalendar from "@/components/AddToCalendar";
import EventArt from "@/components/EventArt";

// A tasteful per-event placeholder banner until real photos land (Phase 7).
const banners: Record<string, string> = {
  Haldi: "from-marigold/80 to-amber-300/70",
  "Sangeeth & Mehendi": "from-maroon/80 to-rose-400/60",
  Wedding: "from-gold/80 to-maroon/70",
};

export default function EventCard({ event }: { event: Event }) {
  const banner = banners[event.name] ?? "from-gold/70 to-maroon/60";

  return (
    <article className="rounded-2xl border border-gold/25 bg-white/60 shadow-sm">
      <div
        className={`flex h-24 flex-col items-center justify-center gap-1.5 bg-gradient-to-br text-white ${banner} rounded-t-2xl sm:h-28`}
      >
        <EventArt name={event.name} className="h-8 w-8 drop-shadow-sm" />
        <span className="font-display text-2xl font-semibold drop-shadow-sm">
          {event.name}
        </span>
      </div>

      <div className="space-y-2.5 p-5 text-center">
        <div className="space-y-1.5">
          <p className="flex items-center justify-center gap-2 font-medium text-foreground">
            <CalendarIcon className="h-4 w-4 text-gold" />
            {formatEventDate(event.date)}
          </p>
          <p className="flex items-center justify-center gap-2 text-maroon">
            <ClockIcon className="h-4 w-4 text-gold" />
            {formatEventTime(event.start_time)}
          </p>
        </div>

        {event.description && (
          <p className="text-sm text-foreground/70">{event.description}</p>
        )}

        <div className="space-y-1 text-sm">
          <p className="text-foreground/85">{event.venue}</p>
          <p className="text-foreground/70">{event.address}</p>
          <a
            href={mapsLink(event.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-maroon underline decoration-gold/40 underline-offset-2 hover:decoration-maroon"
          >
            <MapPinIcon />
            View on Google Maps
          </a>
        </div>

        {event.dress_code && (
          <p className="flex items-center justify-center gap-2 text-sm text-foreground/85">
            <HangerIcon className="h-4 w-4 text-gold" />
            Dress code: <span className="font-medium">{event.dress_code}</span>
          </p>
        )}

        <div className="flex justify-center pt-1">
          <AddToCalendar event={event} />
        </div>
      </div>
    </article>
  );
}
