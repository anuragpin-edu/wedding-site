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

// "August 21, 2026"
export function formatEventDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// "07:30:00" -> "7:30 AM"
export function formatEventTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

// Google Maps directions link from a plain address.
export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}
