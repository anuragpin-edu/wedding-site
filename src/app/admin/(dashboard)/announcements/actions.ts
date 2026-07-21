"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPushToAll } from "@/lib/push";
import { announcementSchema } from "@/lib/validation/admin";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const raw = {
    title: formData.get("title"),
    body: formData.get("body"),
    published: formData.get("published") === "on",
  };
  const result = announcementSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  const { title, body, published } = result.data;
  
  const supabase = createServiceClient();
  await supabase.from("announcements").insert({ title, body, published });

  // Optionally push to everyone who opted in (only meaningful if published).
  if (published && formData.get("send_push") === "on") {
    await sendPushToAll({ title, body, url: "/updates" });
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/updates");
}

// Send a push for an existing announcement (e.g. published earlier, or to
// re-notify). Independent of the create flow.
export async function pushAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") ?? "").toString();
  const supabase = createServiceClient();
  const { data: a } = await supabase
    .from("announcements")
    .select("title, body")
    .eq("id", id)
    .maybeSingle();
  if (a) {
    await sendPushToAll({ title: a.title, body: a.body, url: "/updates" });
  }
  revalidatePath("/admin/announcements");
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
