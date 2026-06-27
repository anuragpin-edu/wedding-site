import Link from "next/link";
import Countdown from "@/components/Countdown";
import { getEvents } from "@/lib/getEvents";
import EventCard from "@/components/EventCard";
import { listHomeMedia } from "@/lib/getMedia";
import HeroSlideshow from "@/components/HeroSlideshow";

export const dynamic = "force-dynamic";

export default async function WeddingPage() {
  const events = await getEvents();
  // Filter for just the wedding event
  const weddingEvent = events.find((event) =>
    event.name.toLowerCase().includes("wedding")
  );

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
          <div className="flex h-full w-full items-center justify-center bg-stone-900 text-stone-500">
            No media found. Please upload to Cloudflare R2.
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
            <Link
              href="#event-details"
              className="rounded-full border border-maroon/30 bg-transparent px-8 py-3.5 text-sm font-medium text-maroon transition-all hover:bg-maroon/5 hover:border-maroon/50"
            >
              View Details
            </Link>
          </div>
        </div>
      </section>

      {/* 3. The Celebration — Single Event Full Detail */}
      <section id="event-details" className="mx-auto max-w-4xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-semibold text-maroon">
            Wedding Event
          </h2>
          <p className="mt-2 text-foreground/65">
            We can&apos;t wait to celebrate with you.
          </p>
        </div>

        {!weddingEvent ? (
          <p className="text-center text-foreground/60">
            Event details are coming soon.
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <EventCard event={weddingEvent} />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
