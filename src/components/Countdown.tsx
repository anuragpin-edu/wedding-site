"use client";

import { useEffect, useState } from "react";

// Wedding ceremony: August 22, 2026, 11:00 AM Eastern (UTC-4 during DST).
const TARGET = new Date("2026-08-22T11:00:00-04:00").getTime();

function diff() {
  const ms = Math.max(0, TARGET - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export default function Countdown() {
  // Start null so server and first client render match (avoids hydration mismatch).
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: t?.days },
    { label: "Hours", value: t?.hours },
    { label: "Minutes", value: t?.minutes },
    { label: "Seconds", value: t?.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[3.75rem] flex-col items-center rounded-lg border border-gold/25 bg-cream/50 px-2.5 py-2 sm:min-w-[4.5rem] sm:px-4 sm:py-3"
        >
          <span className="font-display text-2xl font-semibold text-maroon tabular-nums sm:text-4xl">
            {u.value === undefined ? "—" : u.value.toString().padStart(2, "0")}
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-widest text-foreground/55 sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
