import Link from "next/link";
import Image from "next/image";
import Countdown from "@/components/Countdown";
import { getEvents } from "@/lib/getEvents";
import StreamVideo from "@/components/StreamVideo";
import EventCard from "@/components/EventCard";

export default async function WeddingPage() {
  const events = await getEvents();
  // Filter for just the wedding event
  const weddingEvent = events.find((event) =>
    event.name.toLowerCase().includes("wedding")
  );

  return (
    <>
      {/* Photo Hero with Dark Scrim */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/home/hero.jpg"
            alt="Anurag & Thanmai"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center sm:py-28">
          <p className="text-sm uppercase tracking-[0.3em] text-white/90 drop-shadow-sm">
            We&apos;re getting married
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-white drop-shadow-md sm:text-7xl">
            Anurag <span className="text-marigold">&amp;</span> Thanmai
          </h1>
          <p className="mt-4 text-lg text-white/90 drop-shadow-sm sm:text-xl">
            August 22, 2026 &middot; Cumming, Georgia
          </p>

          <div className="mt-10">
            <Countdown />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/rsvp"
              className="rounded-full bg-maroon px-7 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-maroon-dark"
            >
              RSVP
            </Link>
            <Link
              href="#event-details"
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              View Details
            </Link>
          </div>
        </div>
      </section>

      {/* The Celebration — Single Event Full Detail */}
      <section id="event-details" className="mx-auto max-w-4xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-semibold text-maroon">
            The Celebration
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

      {/* Ambient Video Band */}
      <section className="w-full bg-cream">
        <StreamVideo
          videoId="ambient-video-id"
          autoplay
          loop
          muted
          className="h-64 sm:h-96"
        />
      </section>

      {/* Photo / Video Gallery */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-semibold text-maroon">
            Gallery
          </h2>
          <p className="mt-2 text-foreground/65">
            Moments we want to share with you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 shadow-sm">
            <Image src="/home/gallery-1.jpg" alt="Gallery photo 1" fill className="object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 shadow-sm">
            <StreamVideo videoId="gallery-video-1" controls muted={false} className="h-full w-full" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 shadow-sm">
            <Image src="/home/gallery-2.jpg" alt="Gallery photo 2" fill className="object-cover" />
          </div>
          {/* Add more gallery items as needed */}
        </div>
      </section>
    </>
  );
}
