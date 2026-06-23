"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") ?? "").toString().trim();
  const body = (formData.get("body") ?? "").toString().trim();
  if (!title || !body) return;
  const supabase = createServiceClient();
  // Publish immediately if the box was checked.
  await supabase.from("announcements").insert({
    title,
    body,
    published: formData.get("published") === "on",
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/updates");
}

export async function setPublished(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") ?? "").toString();
  const published = formData.get("published") === "true";
  const supabase = createServiceClient();
  await supabase.from("announcements").update({ published }).eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/updates");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") ?? "").toString();
  const supabase = createServiceClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/updates");
}
