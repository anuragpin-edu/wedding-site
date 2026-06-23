import type { Metadata } from "next";
import RegistryGrid from "@/components/RegistryGrid";
import { getRegistryItems } from "@/lib/registry";
import { getSetting, SHIPPING_ADDRESS } from "@/lib/settings";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Gift Registry — Anurag & Thanmai",
  description:
    "Our gift registry. Browse, buy from your favorite store, and claim a gift so others know it's taken.",
};

// Always reflect the latest claim state.
export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const [items, shippingAddress] = await Promise.all([
    getRegistryItems(),
    getSetting(SHIPPING_ADDRESS),
  ]);

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

      {shippingAddress && (
        <div className="mx-auto mb-10 max-w-md rounded-2xl border border-gold/30 bg-cream/40 p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-gold">Ship gifts to</p>
          <p className="mt-2 whitespace-pre-wrap text-foreground/80">{shippingAddress}</p>
          <div className="mt-3 flex justify-center">
            <CopyButton text={shippingAddress} label="Copy address" />
          </div>
        </div>
      )}

      <RegistryGrid items={items} />
    </div>
  );
}
