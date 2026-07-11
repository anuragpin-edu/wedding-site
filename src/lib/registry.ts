import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { RegistryItem } from "@/types/database";
import { signMediaUrl } from "@/lib/getMedia";

// A "planning" hold lasts this long before the gift auto-reopens.
export const HOLD_HOURS = 6;

export type RegistryItemView = RegistryItem & {
  // Computed availability after applying hold expiry.
  effective_status: "available" | "planning" | "purchased";
};

function isHoldLive(held_until: string | null): boolean {
  return held_until != null && new Date(held_until).getTime() > Date.now();
}

// Actually free up items whose planning hold has expired: flip them back to
// available in the DB and release their stale claims. Runs whenever the
// registry is loaded (public or admin), so the database — not just the
// displayed status — stays correct after the 6-hour window.
export async function reconcileExpiredHolds(): Promise<void> {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: expired } = await supabase
    .from("registry_items")
    .update({ status: "available", held_until: null })
    .eq("status", "planning")
    .lt("held_until", nowIso)
    .select("id");

  if (expired && expired.length) {
    await supabase
      .from("registry_claims")
      .update({ released: true })
      .in("registry_item_id", expired.map((e) => e.id))
      .eq("status", "planning")
      .eq("released", false);
  }
}

// Loads all registry items in display order, with their *effective* status:
// an item counts as taken only if purchased, or if it has a live (non-expired)
// planning hold. Contact info is never read into the view — only the name.
export async function getRegistryItems(): Promise<RegistryItemView[]> {
  const supabase = createServiceClient();
  await reconcileExpiredHolds();

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

  const signedItems = await Promise.all((items ?? []).map(async (item) => {
    let effective: RegistryItemView["effective_status"] = "available";

    if (item.status === "purchased") {
      effective = "purchased";
    } else if (item.status === "planning" && isHoldLive(item.held_until)) {
      effective = "planning";
    }

    const signedImageUrl = await signMediaUrl(item.image_url);

    return { ...item, image_url: signedImageUrl, effective_status: effective };
  }));

  return signedItems;
}
