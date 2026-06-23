import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export const SHIPPING_ADDRESS = "shipping_address";

export async function getSetting(key: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}
