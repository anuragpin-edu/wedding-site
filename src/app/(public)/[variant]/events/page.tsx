import { notFound } from "next/navigation";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/getEvents";
import { getVariantConfig, filterEventsForVariant } from "@/lib/variants";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const config = getVariantConfig(variant);
  
  const allEvents = await getEvents();
  const events = filterEventsForVariant(allEvents, config);

  // If a variant only has 1 event (or none), the Events page should not exist.
  if (events.length <= 1) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-semibold text-maroon sm:text-5xl">
          The Celebrations
        </h1>
        <p className="mt-4 text-foreground/65">
          We can&apos;t wait to celebrate with you. Here are the details for our events.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
