import type { Event } from "@/types/database";
import { formatEventDate, formatEventTime, mapsLink } from "@/lib/getEvents";
import { MapPinIcon, CalendarIcon, ClockIcon, HangerIcon } from "@/components/icons";
import AddToCalendar from "@/components/AddToCalendar";
import EventArt from "@/components/EventArt";

const gradientBanners: Record<string, string> = {
  Haldi: "from-marigold/80 to-amber-300/70",
  "Sangeeth & Mehendi": "from-maroon/80 to-rose-400/60",
  Wedding: "from-gold/80 to-maroon/70",
};

export default function EventCard({ event }: { event: Event }) {
  const gradient = gradientBanners[event.name] ?? "from-gold/70 to-maroon/60";

  return (
    <article className="rounded-2xl border border-gold/25 bg-white/60 shadow-sm relative flex flex-col h-full overflow-hidden">
      {/* Banner Header (Kept centered for visual impact) */}
      <div className={`relative flex h-32 flex-col items-center justify-center gap-2 sm:h-40 text-white overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <EventArt name={event.name} className="h-10 w-10 drop-shadow-sm opacity-90 sm:h-12 sm:w-12" />
          <span className="font-display text-3xl font-semibold drop-shadow-sm sm:text-4xl tracking-wide">
            {event.name}
          </span>
        </div>
      </div>

      {/* Body Details (Left-aligned for readability and symmetry) */}
      <div className="flex flex-col flex-1 p-6 sm:p-8 space-y-6 text-left">
        
        {/* Date & Time */}
        <div className="space-y-3">
          <p className="flex items-center justify-start gap-3 text-base font-medium text-foreground">
            <CalendarIcon className="h-5 w-5 text-gold flex-shrink-0" />
            {formatEventDate(event.date)}
          </p>
          <p className="flex items-center justify-start gap-3 text-base text-maroon">
            <ClockIcon className="h-5 w-5 text-gold flex-shrink-0" />
            {formatEventTime(event.start_time)}
          </p>
        </div>

        {/* Optional Description */}
        {event.description && (
          <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-gold/40 pl-3">
            {event.description}
          </p>
        )}

        {/* Location Block */}
        <div className="flex items-start gap-3 text-sm text-foreground/80">
          <MapPinIcon className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">{event.venue}</p>
            <p className="leading-snug">{event.address}</p>
            <a
              href={mapsLink(event.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 font-medium text-maroon underline decoration-gold/40 underline-offset-4 hover:decoration-maroon transition-colors"
            >
              View on Google Maps &rarr;
            </a>
          </div>
        </div>

        {/* Dress Code */}
        {event.dress_code && (
          <div className="flex items-center gap-3 text-sm text-foreground/85">
            <HangerIcon className="h-5 w-5 text-gold flex-shrink-0" />
            <p>Dress code: <span className="font-medium text-foreground">{event.dress_code}</span></p>
          </div>
        )}

        {/* Add to Calendar */}
        <div className="pt-2 mt-auto">
          <AddToCalendar event={event} />
        </div>
      </div>
    </article>
  );
}
