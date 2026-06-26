import type { Event } from "@/types/database";
import { formatEventDate, formatEventTime, mapsLink } from "@/lib/getEvents";
import { MapPinIcon, CalendarIcon, ClockIcon, HangerIcon } from "@/components/icons";
import AddToCalendar from "@/components/AddToCalendar";
import EventArt from "@/components/EventArt";
import Image from "next/image";

// Event banner image filenames mapped to event names.
// These images should be uploaded to the Cloudflare R2 bucket.
const bannerImages: Record<string, string> = {
  Haldi: "events/haldi-banner.jpg",
  "Sangeeth & Mehendi": "events/sangeeth-banner.jpg",
  Wedding: "events/wedding-banner.jpg",
};

export default function EventCard({ event }: { event: Event }) {
  const bannerSrc = bannerImages[event.name] ?? "events/default-banner.jpg";

  return (
    <article className="rounded-2xl border border-gold/25 bg-white/60 shadow-sm relative">
      <div className="relative flex h-24 flex-col items-center justify-center gap-1.5 sm:h-28 text-white overflow-hidden rounded-t-2xl">
        <Image 
          src={bannerSrc}
          alt={event.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover brightness-[0.7] z-0" 
        />
        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5">
          <EventArt name={event.name} className="h-8 w-8 drop-shadow-sm" />
          <span className="font-display text-2xl font-semibold drop-shadow-sm">
            {event.name}
          </span>
        </div>
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
