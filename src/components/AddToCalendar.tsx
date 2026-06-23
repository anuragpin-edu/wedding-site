"use client";

import { useEffect, useRef, useState } from "react";
import type { Event } from "@/types/database";
import { googleCalendarUrl, icsContent } from "@/lib/calendar";
import { CalendarPlusIcon } from "@/components/icons";

export default function AddToCalendar({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the menu on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function downloadIcs() {
    const blob = new Blob([icsContent(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  const itemClass =
    "block w-full px-4 py-2 text-left text-sm text-foreground/80 hover:bg-maroon/5 hover:text-maroon";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-maroon/30 px-3.5 py-1.5 text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
      >
        <CalendarPlusIcon />
        Add to calendar
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gold/30 bg-white shadow-lg">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            Google Calendar
          </a>
          <button type="button" onClick={downloadIcs} className={itemClass}>
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
