import Link from "next/link";
import Countdown from "@/components/Countdown";
import { getEvents, formatEventDate, formatEventTime } from "@/lib/getEvents";
import { listHomeMedia } from "@/lib/getMedia";
import HeroSlideshow from "@/components/HeroSlideshow";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();
  const mediaList = await listHomeMedia();

  // Combine all media into a single array
  const allMedia = [
    ...mediaList.images.map((url) => ({ url, type: "image" as const })),
    ...mediaList.videos.map((url) => ({ url, type: "video" as const })),
  ];

  // Shuffle media
  const shuffled = allMedia.sort(() => Math.random() - 0.5);

  return (
    <>
      {/* 1. Immersive Full-Screen Slideshow Hook */}
      <section className="relative h-screen w-full">
        {shuffled.length > 0 ? (
          <HeroSlideshow media={shuffled} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-stone-900 text-stone-500 gap-4 p-8">
            <p className="text-xl">No media found. Please upload to Cloudflare R2.</p>
            {/* @ts-ignore - rendering debug payload */}
            {mediaList.error && <p className="text-red-400 font-mono text-sm max-w-xl text-center">{mediaList.error}</p>}
            {/* @ts-ignore - rendering debug payload */}
            {mediaList.debug && (
              <pre className="text-xs font-mono text-stone-400 bg-black/50 p-4 rounded text-left">
                {/* @ts-ignore */}
                {JSON.stringify(mediaList.debug, null, 2)}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* 2. The Reveal (Title, Timer, RSVP) */}
      <section className="relative z-40 py-24 text-center sm:py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5">
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
              href="/rsvp"
              className="rounded-full bg-maroon px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-maroon-dark hover:scale-105"
            >
              RSVP
            </Link>
          </div>
        </div>
      </section>

      {/* 3. The Celebrations Teaser */}
      <section className="mx-auto max-w-4xl px-5 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-semibold text-maroon">
            The Celebrations
          </h2>
          <p className="mt-2 text-foreground/65">
            Three events across two joyful days.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-center text-foreground/60">
            Event details are coming soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href="/events"
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

        </section>
    </>
  );
}
