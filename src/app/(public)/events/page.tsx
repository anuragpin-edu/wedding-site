import type { Metadata } from "next";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/getEvents";

export const metadata: Metadata = {
  title: "Events — Anurag & Thanmai",
  description:
    "Haldi, Sangeeth & Mehendi, and the Wedding — details, times, venues, and dress codes.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold text-maroon sm:text-5xl">
          Our Events
        </h1>
        <p className="mt-3 text-foreground/65">
          We&apos;d be honored to have you join us for each celebration.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-foreground/60">
          Event details are coming soon — check back shortly.
        </p>
      ) : (
        <div className="space-y-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
