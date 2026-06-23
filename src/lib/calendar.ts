import type { Event } from "@/types/database";

// Events are in US Eastern. Aug 2026 is EDT (UTC-4).
const TZ_OFFSET = "-04:00";
const DEFAULT_DURATION_HOURS = 3;

// "2026-08-21" + "07:30:00" -> "20260821T113000Z" (UTC stamp for calendars).
function toUtcStamp(date: string, time: string): string {
  const d = new Date(`${date}T${time}${TZ_OFFSET}`);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function startEnd(event: Event) {
  const start = new Date(`${event.date}T${event.start_time}${TZ_OFFSET}`);
  const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 3600 * 1000);
  const endTime = end.toISOString().slice(11, 19); // HH:MM:SS (UTC)
  return {
    startStamp: toUtcStamp(event.date, event.start_time),
    endStamp: end.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
    endTime,
  };
}

function fullLocation(event: Event): string {
  return event.venue ? `${event.venue}, ${event.address}` : event.address;
}

// Google Calendar "add event" URL.
export function googleCalendarUrl(event: Event): string {
  const { startStamp, endStamp } = startEnd(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.name} — Anurag & Thanmai`,
    dates: `${startStamp}/${endStamp}`,
    details: event.description || "We can't wait to celebrate with you!",
    location: fullLocation(event),
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

// .ics file content (Apple Calendar, Outlook, etc.).
export function icsContent(event: Event): string {
  const { startStamp, endStamp } = startEnd(event);
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//bunnymetanu//wedding//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@bunnymetanu.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${esc(`${event.name} — Anurag & Thanmai`)}`,
    `DESCRIPTION:${esc(event.description || "We can't wait to celebrate with you!")}`,
    `LOCATION:${esc(fullLocation(event))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
