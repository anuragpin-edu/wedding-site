import Link from "next/link";
import Countdown from "@/components/Countdown";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/getEvents";

export default async function HomePage() {
  const events = await getEvents();

  return (
    <>
      {/* Hero — placeholder gradient until real photos land in Phase 7 */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-background to-marigold/15" />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center sm:py-28">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">
            We&apos;re getting married
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-maroon sm:text-7xl">
            Anurag <span className="text-marigold">&amp;</span> Thanmai
          </h1>
          <p className="mt-4 text-lg text-foreground/70 sm:text-xl">
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
              href="/#celebrations"
              className="rounded-full border border-maroon/30 px-7 py-3 text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* Events — the single source (the Events nav link scrolls here) */}
      <section id="celebrations" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-16">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
