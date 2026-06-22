import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";

// Fetches the wedding events ordered for display. Events are public-read
// under RLS, so the anon-key server client is all we need here.
export async function getEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load events:", error.message);
    return [];
  }
  return data ?? [];
}

// Re-export the client-safe formatters so existing imports keep working.
export {
  formatEventDate,
  formatEventTime,
  mapsLink,
  EVENT_TZ_LABEL,
} from "@/lib/eventFormat";
