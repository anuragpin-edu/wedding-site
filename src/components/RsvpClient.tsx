"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/types/database";
import type { PartyData, PartyGuest } from "@/lib/rsvp";
import { formatEventDate, formatEventTime, mapsLink } from "@/lib/eventFormat";
import { MapPinIcon } from "@/components/icons";
import Turnstile, { turnstileConfigured } from "@/components/Turnstile";

type Person = {
  id?: string;
  full_name: string;
  dietary_notes: string;
  is_primary: boolean;
  attendance: Record<string, boolean>;
};

const LS_KEY = "rsvp:current";

function allYes(events: Event[]): Record<string, boolean> {
  return Object.fromEntries(events.map((e) => [e.id, true]));
}

function toPerson(g: PartyGuest): Person {
  return {
    id: g.id,
    full_name: g.full_name,
    dietary_notes: g.dietary_notes ?? "",
    is_primary: g.is_primary,
    attendance: { ...g.attendance },
  };
}

function saveToken(token: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ invite_code: token, submitted: true }));
  } catch {}
}
function readToken(): string | null {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v ? (JSON.parse(v).invite_code as string) : null;
  } catch {
    return null;
  }
}
function clearToken() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

export default function RsvpClient({ events }: { events: Event[] }) {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [token, setToken] = useState<string | null>(null);
  const [editing, setEditing] = useState(false); // existing RSVP loaded

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState<Person[]>([
    { full_name: "", dietary_notes: "", is_primary: true, attendance: allYes(events) },
  ]);
  const [removedGuestIds, setRemovedGuestIds] = useState<string[]>([]);

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [tsToken, setTsToken] = useState<string | null>(null); // Turnstile

  // Lookup (cross-device) UI
  const [showLookup, setShowLookup] = useState(false);
  const [lkEmail, setLkEmail] = useState("");
  const [lkPhone, setLkPhone] = useState("");
  const [lkError, setLkError] = useState("");
  const [lkBusy, setLkBusy] = useState(false);

  function hydrate(data: PartyData) {
    setToken(data.party.invite_code);
    setEmail(data.party.contact_email ?? "");
    setPhone(data.party.contact_phone ?? "");
    setPeople(data.guests.map(toPerson));
    setEditing(true);
    saveToken(data.party.invite_code);
  }

  // On mount, auto-load a saved RSVP for this browser.
  useEffect(() => {
    const t = readToken();
    if (!t) {
      setPhase("ready");
      return;
    }
    fetch(`/api/rsvp/load?token=${encodeURIComponent(t)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => hydrate(j.data))
      .catch(() => clearToken())
      .finally(() => setPhase("ready"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updatePerson(i: number, patch: Partial<Person>) {
    setPeople((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function toggleEvent(i: number, eventId: string) {
    setPeople((ps) =>
      ps.map((p, idx) =>
        idx === i ? { ...p, attendance: { ...p.attendance, [eventId]: !p.attendance[eventId] } } : p
      )
    );
  }
  function addPerson() {
    setPeople((ps) => [
      ...ps,
      { full_name: "", dietary_notes: "", is_primary: false, attendance: allYes(events) },
    ]);
  }
  function removePerson(i: number) {
    setPeople((ps) => {
      const p = ps[i];
      if (p.id) setRemovedGuestIds((ids) => [...ids, p.id!]);
      return ps.filter((_, idx) => idx !== i);
    });
  }

  async function submit() {
    if (!email.trim() || !phone.trim()) {
      setStatus("error");
      setMessage("Your email and mobile are required.");
      return;
    }
    if (people.some((p) => p.full_name.trim() === "")) {
      setStatus("error");
      setMessage("Please enter a name for everyone in your party.");
      return;
    }
    if (turnstileConfigured && !tsToken) {
      setStatus("error");
      setMessage("Please complete the spam check below.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          phone,
          guests: people,
          removedGuestIds,
          turnstile_token: tsToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setToken(json.token);
      saveToken(json.token);
      setEditing(true);
      setRemovedGuestIds([]);
      setStatus("done");
      setMessage("Your RSVP has been saved. Thank you!");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function doLookup() {
    if (!lkEmail.trim() && !lkPhone.trim()) {
      setLkError("Enter the email or mobile you RSVP'd with.");
      return;
    }
    setLkBusy(true);
    setLkError("");
    try {
      const res = await fetch("/api/rsvp/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lkEmail, phone: lkPhone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found.");
      hydrate(json.data);
      setShowLookup(false);
      setStatus("idle");
      setMessage("");
    } catch (e) {
      setLkError(e instanceof Error ? e.message : "Not found.");
    } finally {
      setLkBusy(false);
    }
  }

  function startFresh() {
    clearToken();
    setToken(null);
    setEditing(false);
    setEmail("");
    setPhone("");
    setPeople([{ full_name: "", dietary_notes: "", is_primary: true, attendance: allYes(events) }]);
    setRemovedGuestIds([]);
    setStatus("idle");
    setMessage("");
  }

  const input =
    "w-full rounded-lg border border-gold/30 bg-background px-3 py-2 text-foreground outline-none focus:border-maroon";

  if (phase === "loading") {
    return <p className="py-16 text-center text-foreground/50">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {editing ? (
        <div className="flex items-center justify-between rounded-lg border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-foreground/80">
          <span>We have your RSVP — edit below and resubmit anytime.</span>
          <button onClick={startFresh} className="shrink-0 text-maroon/70 hover:text-maroon">
            Not you?
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setShowLookup((s) => !s)}
            className="text-sm text-maroon underline decoration-gold/40 underline-offset-2 hover:decoration-maroon"
          >
            Already RSVP&apos;d on another device? Find it
          </button>
          {showLookup && (
            <div className="mx-auto mt-3 max-w-sm space-y-2 rounded-xl border border-gold/25 bg-white/60 p-4 text-left">
              <p className="text-sm text-foreground/70">
                Enter the email or mobile you used to RSVP — either one works.
              </p>
              <input className={input} type="email" placeholder="Email" value={lkEmail} onChange={(e) => setLkEmail(e.target.value)} />
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-foreground/40">
                <span className="h-px flex-1 bg-gold/30" />
                or
                <span className="h-px flex-1 bg-gold/30" />
              </div>
              <input className={input} type="tel" placeholder="Mobile" value={lkPhone} onChange={(e) => setLkPhone(e.target.value)} />
              {lkError && <p className="text-xs text-maroon">{lkError}</p>}
              <button
                onClick={doLookup}
                disabled={lkBusy}
                className="w-full rounded-full bg-maroon px-4 py-2 text-sm font-medium text-white hover:bg-maroon-dark disabled:opacity-60"
              >
                {lkBusy ? "Finding…" : "Find my RSVP"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contact (primary identity) */}
      <div className="rounded-2xl border border-gold/25 bg-white/60 p-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-foreground/55">Your contact details</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={input} type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="tel" placeholder="Mobile *" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <p className="mt-2 text-[11px] text-foreground/50">
          Used only to save and find your RSVP — never shared.
        </p>
      </div>

      {/* People */}
      <div className="space-y-5">
        {people.map((person, i) => (
          <div key={person.id ?? `new-${i}`} className="rounded-2xl border border-gold/25 bg-white/60 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs uppercase tracking-wide text-foreground/55">
                  Name {person.is_primary && <span className="text-gold">(you)</span>}
                </label>
                <input
                  className={input}
                  type="text"
                  placeholder="Full name"
                  value={person.full_name}
                  onChange={(e) => updatePerson(i, { full_name: e.target.value })}
                />
              </div>
              {!person.is_primary && (
                <button onClick={() => removePerson(i)} className="mt-6 text-sm text-maroon/70 hover:text-maroon">
                  Remove
                </button>
              )}
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs uppercase tracking-wide text-foreground/55">
                Dietary notes / allergies (optional)
              </label>
              <input
                className={input}
                type="text"
                placeholder="e.g. vegetarian, nut allergy, kids meal"
                value={person.dietary_notes}
                onChange={(e) => updatePerson(i, { dietary_notes: e.target.value })}
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-foreground/55">
                {person.is_primary
                  ? "Which celebrations will you attend?"
                  : person.full_name.trim()
                    ? `Which celebrations will ${person.full_name.trim().split(/\s+/)[0]} attend?`
                    : "Which celebrations will this guest attend?"}
              </p>
              <div className="space-y-2">
                {events.map((event) => {
                  const on = !!person.attendance[event.id];
                  return (
                    <div
                      key={event.id}
                      role="checkbox"
                      aria-checked={on}
                      tabIndex={0}
                      onClick={() => toggleEvent(i, event.id)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          toggleEvent(i, event.id);
                        }
                      }}
                      className={
                        "cursor-pointer rounded-xl border p-3 transition-colors " +
                        (on
                          ? "border-maroon bg-maroon/5"
                          : "border-gold/30 bg-background hover:border-maroon/40")
                      }
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs " +
                            (on
                              ? "border-maroon bg-maroon text-white"
                              : "border-gold/50 text-transparent")
                          }
                        >
                          ✓
                        </span>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-foreground">{event.name}</p>
                          <p className="text-xs text-foreground/70">
                            {formatEventDate(event.date)} &middot; {formatEventTime(event.start_time)}
                          </p>
                          <p className="text-xs text-foreground/60">
                            {event.venue ? `${event.venue} — ` : ""}
                            {event.address}
                          </p>
                          <a
                            href={mapsLink(event.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 inline-flex items-center gap-1 text-xs text-maroon underline decoration-gold/40 underline-offset-2 hover:decoration-maroon"
                          >
                            <MapPinIcon className="h-3 w-3" />
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addPerson}
        className="w-full rounded-xl border border-dashed border-gold/50 py-3 text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
      >
        + Add a family member or guest
      </button>

      {message && (
        <p className={"text-center text-sm " + (status === "error" ? "text-maroon" : "text-sage")}>
          {message}
        </p>
      )}

      <div className="flex justify-center">
        <Turnstile onToken={setTsToken} />
      </div>

      <button
        onClick={submit}
        disabled={status === "saving"}
        className="w-full rounded-full bg-maroon px-7 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : editing ? "Update RSVP" : "Submit RSVP"}
      </button>
    </div>
  );
}
