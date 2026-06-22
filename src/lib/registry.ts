import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { RegistryItem } from "@/types/database";

// A "planning" hold lasts this long before the gift auto-reopens.
export const HOLD_HOURS = 6;

export type RegistryItemView = RegistryItem & {
  // Computed availability after applying hold expiry.
  effective_status: "available" | "planning" | "purchased";
  claimed_by: string | null; // claimer first name, only when taken
};

function isHoldLive(held_until: string | null): boolean {
  return held_until != null && new Date(held_until).getTime() > Date.now();
}

// Loads all registry items in display order, with their *effective* status:
// an item counts as taken only if purchased, or if it has a live (non-expired)
// planning hold. Contact info is never read into the view — only the name.
export async function getRegistryItems(): Promise<RegistryItemView[]> {
  const supabase = createServiceClient();

  const [{ data: items }, { data: claims }] = await Promise.all([
    supabase
      .from("registry_items")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("registry_claims")
      .select("registry_item_id, claimer_name, status, claimed_at, released")
      .eq("released", false)
      .order("claimed_at", { ascending: false }),
  ]);

  // Latest non-released claim per item (claims are newest-first).
  const latestClaim = new Map<
    string,
    { name: string; status: string }
  >();
  for (const c of claims ?? []) {
    if (!latestClaim.has(c.registry_item_id)) {
      latestClaim.set(c.registry_item_id, {
        name: c.claimer_name,
        status: c.status,
      });
    }
  }

  return (items ?? []).map((item) => {
    let effective: RegistryItemView["effective_status"] = "available";
    let claimedBy: string | null = null;

    if (item.status === "purchased") {
      effective = "purchased";
    } else if (item.status === "planning" && isHoldLive(item.held_until)) {
      effective = "planning";
    }

    if (effective !== "available") {
      claimedBy = latestClaim.get(item.id)?.name ?? null;
    }

    return { ...item, effective_status: effective, claimed_by: claimedBy };
  });
}
