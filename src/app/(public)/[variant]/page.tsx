import Link from "next/link";
import Countdown from "@/components/Countdown";
import { getEvents, formatEventDate, formatEventTime } from "@/lib/getEvents";
import { listHomeMedia } from "@/lib/getMedia";
import HeroSlideshow from "@/components/HeroSlideshow";
import EventCard from "@/components/EventCard";
import TraditionAccent from "@/components/TraditionAccent";
import { getVariantConfig, filterEventsForVariant } from "@/lib/variants";

export const dynamic = "force-dynamic";

export default async function VariantHomePage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const config = getVariantConfig(variant);

  const allEvents = await getEvents();
  const events = filterEventsForVariant(allEvents, config);
  const mediaList = await listHomeMedia();

  // Combine all media into a single array
  const allMedia = [
    ...mediaList.images.map((url) => ({ url, type: "image" as const })),
    ...mediaList.videos.map((url) => ({ url, type: "video" as const })),
  ];

  // Shuffle media
  const shuffled = allMedia.sort(() => Math.random() - 0.5);

  const resolvePath = (path: string) => {
    return config.basePath === "/" ? path : `${config.basePath}${path}`;
  };

  const isSingleEvent = events.length === 1;

  return (
    <>
      {/* 1. We Are Getting Married (Reveal with Tradition Accent & Countdown) */}
      <section className="relative z-40 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5">
          {/* Subtle Pelli Pathrika Accent */}
          <div className="mb-6 w-24 sm:w-32 text-gold">
            <TraditionAccent />
          </div>
          
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/70">
            We&apos;re getting married
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-maroon sm:text-7xl">
            Anurag <span className="text-marigold">&amp;</span> Thanmai
          </h1>
          <p className="mt-4 text-lg text-foreground/80 sm:text-xl">
            August 22, 2026 &middot; Cumming, Georgia
          </p>

          <div className="mt-12">
            <Countdown />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={resolvePath("/rsvp")}
              className="rounded-full bg-maroon px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-maroon-dark hover:scale-105"
            >
              RSVP
            </Link>
            <Link
              href={isSingleEvent ? "#event-details" : resolvePath("/events")}
              className="rounded-full border border-maroon/30 bg-transparent px-8 py-3.5 text-sm font-medium text-maroon transition-all hover:bg-maroon/5 hover:border-maroon/50"
            >
              {isSingleEvent ? "View Details" : "View Events"}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Our Gallery (Slideshow Gallery) */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5 mb-10 text-center">
          <h2 className="font-display text-4xl font-semibold text-maroon">
            Our Gallery
          </h2>
          <p className="mt-2 text-foreground/65">
            Moments we cherish.
          </p>
        </div>
        
        <div className="mx-auto max-w-6xl px-5">
          <div className="relative h-[65vh] sm:h-[75vh] w-full rounded-2xl overflow-hidden shadow-lg border border-gold/20">
            {shuffled.length > 0 ? (
              <HeroSlideshow media={shuffled} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-stone-900 text-stone-500 gap-4 p-8">
                <p className="text-xl">No media found. Please upload to Cloudflare R2.</p>
                {/* @ts-ignore */}
                {mediaList.error && <p className="text-red-400 font-mono text-sm">{mediaList.error}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. The Celebrations (Event Cards) */}
      <section id="event-details" className="mx-auto max-w-4xl px-5 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-semibold text-maroon">
            {isSingleEvent ? events[0]?.name : "The Celebrations"}
          </h2>
          <p className="mt-2 text-foreground/65">
            {isSingleEvent ? "We can't wait to celebrate with you." : "Join us for our joyful events."}
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-center text-foreground/60">
            Event details are coming soon.
          </p>
        ) : isSingleEvent ? (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <EventCard event={events[0]} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={resolvePath("/events")}
                className="group rounded-2xl border border-gold/25 bg-white/60 p-5 text-center transition-colors hover:border-maroon/40 hover:bg-white shadow-sm"
              >
                <p className="font-display text-xl font-semibold text-maroon">
                  {event.name}
                </p>
                <p className="mt-2 text-sm text-foreground/70">
                  {formatEventDate(event.date)}
                </p>
                <p className="text-sm text-maroon font-medium mt-1">
                  {formatEventTime(event.start_time)}
                </p>
              </Link>
            ))}
          </div>
        )}

        {!isSingleEvent && (
          <div className="mt-12 text-center">
            <Link
              href={resolvePath("/events")}
              className="inline-flex items-center rounded-full bg-maroon px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-maroon-dark"
            >
              View event details &amp; directions &rarr;
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
