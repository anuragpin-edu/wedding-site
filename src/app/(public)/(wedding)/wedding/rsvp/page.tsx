import type { Metadata } from "next";
import RsvpClient from "@/components/RsvpClient";
import { getEventsForForm } from "@/lib/rsvp";

export const metadata: Metadata = {
  title: "RSVP",
  description: "Let us know if you'll be joining us.",
};

export const dynamic = "force-dynamic";

export default async function WeddingRsvpPage() {
  const allEvents = await getEventsForForm();
  // Silo the events: only show the main Wedding event for these guests
  const weddingEvents = allEvents.filter(e => e.name === "Wedding");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">You&apos;re invited</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-maroon sm:text-5xl">RSVP</h1>
        <p className="mt-3 text-foreground/65">
          Add yourself and anyone joining you, and let us know if you can make it to our Wedding.
        </p>
      </div>

      <RsvpClient events={weddingEvents} />
    </div>
  );
}
