"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { setSetting, SHIPPING_ADDRESS } from "@/lib/settings";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
}

// The "ship gifts to" address shown on the public registry page.
export async function saveShippingAddress(formData: FormData) {
  await requireAdmin();
  await setSetting(SHIPPING_ADDRESS, (formData.get("shipping_address") ?? "").toString().trim());
  revalidatePath("/admin/registry");
  revalidatePath("/registry");
}

function num(v: FormDataEntryValue | null): number | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createItem(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") ?? "").toString().trim();
  const supabase = createServiceClient();
  await supabase.from("registry_items").insert({
    title,
    description: (formData.get("description") ?? "").toString().trim() || null,
    price: num(formData.get("price")),
    store_url: (formData.get("store_url") ?? "").toString().trim(),
    image_url: (formData.get("image_url") ?? "").toString().trim() || null,
    display_order: num(formData.get("display_order")),
  });
  revalidatePath("/admin/registry");
  revalidatePath("/registry");
  // Confirm to the admin and return them to the items list.
  redirect(`/admin/registry?added=${encodeURIComponent(title)}#items`);
}

export async function updateItem(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") ?? "").toString();
  const supabase = createServiceClient();
  await supabase
    .from("registry_items")
    .update({
      title: (formData.get("title") ?? "").toString().trim(),
      description: (formData.get("description") ?? "").toString().trim() || null,
      price: num(formData.get("price")),
      store_url: (formData.get("store_url") ?? "").toString().trim(),
      image_url: (formData.get("image_url") ?? "").toString().trim() || null,
      display_order: num(formData.get("display_order")),
    })
    .eq("id", id);
  revalidatePath("/admin/registry");
  revalidatePath("/registry");
}

export async function deleteItem(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") ?? "").toString();
  const supabase = createServiceClient();
  await supabase.from("registry_items").delete().eq("id", id);
  revalidatePath("/admin/registry");
  revalidatePath("/registry");
}

// Release a claim: free the item and mark its active claims released (kept for
// history). Use when a hold was a mistake or a guest changed their mind.
export async function releaseClaim(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") ?? "").toString();
  const supabase = createServiceClient();
  await supabase
    .from("registry_claims")
    .update({ released: true })
    .eq("registry_item_id", id)
    .eq("released", false);
  await supabase
    .from("registry_items")
    .update({ status: "available", held_until: null })
    .eq("id", id);
  revalidatePath("/admin/registry");
  revalidatePath("/registry");
}
