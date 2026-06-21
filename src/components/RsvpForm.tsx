"use client";

import { useState } from "react";
import type { Event } from "@/types/database";
import type { PartyData, PartyGuest } from "@/lib/rsvp";

type Row = {
  id?: string; // present = existing guest in DB
  full_name: string;
  dietary_notes: string;
  is_primary: boolean;
  attendance: Record<string, boolean>;
};

function toRow(g: PartyGuest): Row {
  return {
    id: g.id,
    full_name: g.full_name,
    dietary_notes: g.dietary_notes ?? "",
    is_primary: g.is_primary,
    attendance: { ...g.attendance },
  };
}

const LS_KEY = (code: string) => `rsvp:${code}`;

export default function RsvpForm({ data }: { data: PartyData }) {
  const { party, events } = data;
  const [rows, setRows] = useState<Row[]>(data.guests.map(toRow));
  const [removedGuestIds, setRemovedGuestIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(data.hasResponded);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function toggleEvent(i: number, eventId: string) {
    setRows((rs) =>
      rs.map((r, idx) =>
        idx === i
          ? { ...r, attendance: { ...r.attendance, [eventId]: !r.attendance[eventId] } }
          : r
      )
    );
  }

  function addGuest() {
    setRows((rs) => [
      ...rs,
      {
        full_name: "",
        dietary_notes: "",
        is_primary: false,
        attendance: Object.fromEntries(events.map((e) => [e.id, true])),
      },
    ]);
  }

  function removeGuest(i: number) {
    setRows((rs) => {
      const row = rs[i];
      if (row.id) setRemovedGuestIds((ids) => [...ids, row.id!]);
      return rs.filter((_, idx) => idx !== i);
    });
  }

  async function submit() {
    // Require a name on every row.
    if (rows.some((r) => r.full_name.trim() === "")) {
      setStatus("error");
      setMessage("Please enter a name for everyone in your party.");
      return;
    }
    setStatus("saving");
    setMessage("");

    try {
      const res = await fetch(`/api/rsvp/${encodeURIComponent(party.invite_code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: rows.map((r) => ({
            id: r.id,
            full_name: r.full_name,
            dietary_notes: r.dietary_notes,
            attendance: r.attendance,
          })),
          removedGuestIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");

      // Convenience cache — DB remains source of truth.
      try {
        localStorage.setItem(
          LS_KEY(party.invite_code),
          JSON.stringify({ invite_code: party.invite_code, submitted: true, at: Date.now() })
        );
      } catch {}

      setStatus("done");
      setSubmitted(true);
      setRemovedGuestIds([]);
      setMessage("Your RSVP has been saved. Thank you!");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      {submitted && status !== "done" && (
        <div className="rounded-lg border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-foreground/80">
          We have your RSVP on file. You can update it below anytime and resubmit.
        </div>
      )}

      <div className="space-y-5">
        {rows.map((row, i) => (
          <div
            key={row.id ?? `new-${i}`}
            className="rounded-2xl border border-gold/25 bg-white/60 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs uppercase tracking-wide text-foreground/55">
                  Name {row.is_primary && <span className="text-gold">(primary)</span>}
                </label>
                <input
                  type="text"
                  value={row.full_name}
                  onChange={(e) => updateRow(i, { full_name: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-gold/30 bg-background px-3 py-2 text-foreground outline-none focus:border-maroon"
                />
              </div>
              {!row.is_primary && (
                <button
                  type="button"
                  onClick={() => removeGuest(i)}
                  className="mt-6 text-sm text-maroon/70 hover:text-maroon"
                  aria-label="Remove this guest"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs uppercase tracking-wide text-foreground/55">
                Dietary notes / allergies (optional)
              </label>
              <input
                type="text"
                value={row.dietary_notes}
                onChange={(e) => updateRow(i, { dietary_notes: e.target.value })}
                placeholder="e.g. vegetarian, nut allergy, kids meal"
                className="w-full rounded-lg border border-gold/30 bg-background px-3 py-2 text-foreground outline-none focus:border-maroon"
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-foreground/55">
                Attending
              </p>
              <div className="flex flex-wrap gap-2">
                {events.map((event: Event) => {
                  const on = !!row.attendance[event.id];
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleEvent(i, event.id)}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
                        (on
                          ? "border-maroon bg-maroon text-white"
                          : "border-gold/40 bg-background text-foreground/70 hover:border-maroon/50")
                      }
                    >
                      {on ? "✓ " : ""}
                      {event.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addGuest}
        className="w-full rounded-xl border border-dashed border-gold/50 py-3 text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
      >
        + Add a family member or guest
      </button>

      {message && (
        <p
          className={
            "text-center text-sm " +
            (status === "error" ? "text-maroon" : "text-sage")
          }
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={status === "saving"}
        className="w-full rounded-full bg-maroon px-7 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {status === "saving"
          ? "Saving…"
          : submitted
            ? "Update RSVP"
            : "Submit RSVP"}
      </button>
    </div>
  );
}
