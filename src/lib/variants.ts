import type { Event } from "@/types/database";

export type VariantId = "default" | "wedding" | "celebrate" | "invite";

export interface VariantConfig {
  id: VariantId;
  basePath: string;
  showRegistry: boolean;
  eventFilters: string[] | "all";
}

export const SITE_VARIANTS: Record<VariantId, VariantConfig> = {
  default: {
    id: "default",
    basePath: "/",
    showRegistry: true,
    eventFilters: "all",
  },
  wedding: {
    id: "wedding",
    basePath: "/wedding",
    showRegistry: true,
    eventFilters: ["wedding"],
  },
  celebrate: {
    id: "celebrate",
    basePath: "/celebrate",
    showRegistry: false,
    eventFilters: "all",
  },
  invite: {
    id: "invite",
    basePath: "/invite",
    showRegistry: true,
    eventFilters: ["sangeeth", "wedding"],
  },
};

export function getVariantConfig(variant: string | undefined): VariantConfig {
  if (!variant || !(variant in SITE_VARIANTS)) {
    return SITE_VARIANTS.default;
  }
  return SITE_VARIANTS[variant as VariantId];
}

export function filterEventsForVariant(events: Event[], config: VariantConfig): Event[] {
  if (config.eventFilters === "all") {
    return events;
  }
  const filters = config.eventFilters as string[];
  return events.filter((e) =>
    filters.some((keyword) => e.name.toLowerCase().includes(keyword.toLowerCase()))
  );
}
