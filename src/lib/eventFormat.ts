// Pure, client-safe formatting helpers for events (no server imports), so both
// server components and client components ("use client") can use them.

// All events are in Georgia (US Eastern). On the wedding dates (Aug 21–22,
// 2026) Eastern observes Daylight Time, UTC−4 — same offset the countdown uses.
export const EVENT_TZ_LABEL = "EDT";

// "Friday, August 21, 2026"
export function formatEventDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// "7:30 AM EDT"
export function formatEventTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period} ${EVENT_TZ_LABEL}`;
}

// Google Maps directions link from a plain address.
export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}
