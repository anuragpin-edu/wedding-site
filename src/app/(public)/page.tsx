import Link from "next/link";
import Image from "next/image";
import Countdown from "@/components/Countdown";
import { getEvents, formatEventDate, formatEventTime } from "@/lib/getEvents";
import StreamVideo from "@/components/StreamVideo";

export default async function HomePage() {
  const events = await getEvents();

  return (
    <>
      {/* Photo Hero with Dark Scrim */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="home/hero.jpg"
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
              href="/events"
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* Celebrations — compact teaser; full details live on /events */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="mb-10 text-center">
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
                className="group rounded-2xl border border-gold/25 bg-white/60 p-5 text-center transition-colors hover:border-maroon/40 hover:bg-white"
              >
                <p className="font-display text-xl font-semibold text-maroon">
                  {event.name}
                </p>
                <p className="mt-2 text-sm text-foreground/70">
                  {formatEventDate(event.date)}
                </p>
                <p className="text-sm text-maroon">
                  {formatEventTime(event.start_time)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-full bg-maroon px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-maroon-dark"
          >
            View event details &amp; directions →
          </Link>
        </div>
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
            <Image src="home/gallery-1.jpg" alt="Gallery photo 1" fill className="object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 shadow-sm">
            <StreamVideo videoId="gallery-video-1" controls muted={false} className="h-full w-full" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 shadow-sm">
            <Image src="home/gallery-2.jpg" alt="Gallery photo 2" fill className="object-cover" />
          </div>
          {/* Add more gallery items as needed */}
        </div>
      </section>
    </>
  );
}
