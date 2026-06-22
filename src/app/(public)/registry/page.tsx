import type { Metadata } from "next";
import RegistryGrid from "@/components/RegistryGrid";
import { getRegistryItems } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Gift Registry — Anurag & Thanmai",
  description:
    "Our gift registry. Browse, buy from your favorite store, and claim a gift so others know it's taken.",
};

// Always reflect the latest claim state.
export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const items = await getRegistryItems();

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold text-maroon sm:text-5xl">
          Gift Registry
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/65">
          Your presence is the greatest gift — but if you&apos;d like to give
          something, here are a few ideas. Each links out to its store. Once you
          buy (or plan to), claim it here so others know it&apos;s taken.
        </p>
      </div>

      <RegistryGrid items={items} />
    </div>
  );
}
