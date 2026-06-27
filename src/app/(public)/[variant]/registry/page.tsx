import { notFound } from "next/navigation";
import Image from "next/image";
import { registryEnabled } from "@/lib/features";
import { getVariantConfig } from "@/lib/variants";

export const dynamic = "force-dynamic";

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const config = getVariantConfig(variant);

  if (!config.showRegistry || !registryEnabled()) {
    notFound();
  }

  // Real registry link placeholder
  const registryUrl = "https://www.zola.com/registry/example";

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 text-center">
      <div className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Registry</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-maroon sm:text-5xl">
          Our Gift Registry
        </h1>
        <p className="mt-4 text-foreground/65 max-w-xl mx-auto">
          Your presence at our wedding is the greatest gift of all. If it is your
          wish to bless us with a gift, we would greatly appreciate a contribution
          to our newlywed fund or a gift from our registry.
        </p>
      </div>

      <a
        href={registryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-white border border-gold/30 p-8 shadow-sm transition-all hover:border-maroon/40 hover:shadow-md"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Placeholder for Zola logo or similar */}
          <div className="h-12 w-32 bg-stone-100 flex items-center justify-center rounded text-sm text-stone-400 font-mono">
            Zola Registry
          </div>
          <div className="flex items-center gap-2 text-maroon font-medium group-hover:text-maroon-dark">
            View Registry 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
