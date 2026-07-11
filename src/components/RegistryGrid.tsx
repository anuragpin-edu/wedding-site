"use client";

import { useState } from "react";

import type { RegistryItemView } from "@/lib/registry";
import Turnstile, { turnstileConfigured } from "@/components/Turnstile";

function priceLabel(price: number | null) {
  if (price == null) return null;
  return `$${price.toFixed(2)}`;
}

// Pull the most recent invite code the guest used to RSVP on this browser, so
// a claim can be silently linked to their party in the DB. Set by RsvpForm as
// rsvp:<code>. This is invisible to the guest — purely for the couple's view.
function cachedInviteCode(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("rsvp:")) {
        const v = JSON.parse(localStorage.getItem(key) || "{}");
        if (v?.invite_code) return v.invite_code as string;
      }
    }
  } catch {}
  return null;
}

type Contact = { name: string; email: string; phone: string };
type ClaimResult = { status: "planning" | "purchased"; name: string };

// Remember the contact details *this* browser used to place a hold on a
// specific item, so confirming the purchase later doesn't ask for them again.
// Keyed per item — never reused across items or people.
function holdKey(itemId: string) {
  return `registry:hold:${itemId}`;
}
function getHold(itemId: string): Contact | null {
  try {
    const v = localStorage.getItem(holdKey(itemId));
    return v ? (JSON.parse(v) as Contact) : null;
  } catch {
    return null;
  }
}
function setHold(itemId: string, c: Contact) {
  try {
    localStorage.setItem(holdKey(itemId), JSON.stringify(c));
  } catch {}
}
function clearHold(itemId: string) {
  try {
    localStorage.removeItem(holdKey(itemId));
  } catch {}
}

async function postClaim(
  itemId: string,
  intent: "planning" | "purchased",
  c: Contact,
  message: string,
  orderId: string,
  turnstileToken: string | null
): Promise<ClaimResult> {
  const res = await fetch("/api/registry/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      item_id: itemId,
      intent,
      claimer_name: c.name,
      claimer_email: c.email,
      claimer_phone: c.phone,
      claimer_message: message,
      order_id: orderId,
      invite_code: cachedInviteCode(),
      turnstile_token: turnstileToken,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Something went wrong.");
  return { status: json.status, name: json.claimed_by ?? c.name };
}

function ClaimForm({
  itemId,
  onlyPurchased,
  initialContact,
  onClaimed,
}: {
  itemId: string;
  onlyPurchased?: boolean;
  initialContact?: Contact | null;
  onClaimed: (r: ClaimResult) => void;
}) {
  const [name, setName] = useState(initialContact?.name ?? "");
  const [email, setEmail] = useState(initialContact?.email ?? "");
  const [phone, setPhone] = useState(initialContact?.phone ?? "");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [tsToken, setTsToken] = useState<string | null>(null); // Turnstile
  // "choose" shows plan/bought options; "purchase" shows the order-ID step.
  const [mode, setMode] = useState<"choose" | "purchase">(
    onlyPurchased ? "purchase" : "choose"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function contactValid() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are all required.");
      return false;
    }
    return true;
  }

  async function submit(intent: "planning" | "purchased") {
    if (!contactValid()) return;
    if (intent === "purchased" && !orderId.trim()) {
      setError("Please enter your order ID to confirm the purchase.");
      return;
    }
    if (turnstileConfigured && !tsToken) {
      setError("Please complete the spam check below.");
      return;
    }
    setBusy(true);
    setError("");
    const contact = { name: name.trim(), email: email.trim(), phone: phone.trim() };
    try {
      const result = await postClaim(itemId, intent, contact, message, orderId.trim(), tsToken);
      // Remember a hold so confirming it later doesn't re-ask for details;
      // clear it once the purchase is confirmed.
      if (intent === "planning") setHold(itemId, contact);
      else clearHold(itemId);
      onClaimed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  function goToPurchase() {
    if (!contactValid()) return;
    setError("");
    setMode("purchase");
  }

  const input =
    "w-full rounded-lg border border-gold/30 bg-background px-3 py-2 text-sm outline-none focus:border-maroon";

  return (
    <div className="mt-3 space-y-2 border-t border-gold/20 pt-3">
      <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={input} type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Turnstile onToken={setTsToken} />

      {mode === "purchase" ? (
        <>
          {onlyPurchased && initialContact && (
            <p className="text-[11px] text-sage">
              ✓ We filled in your details from your hold — just add your order ID.
            </p>
          )}
          <input
            className={input}
            placeholder="Order ID (from your receipt / confirmation)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <input
            className={input}
            placeholder="Note to the couple (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-xs text-maroon">{error}</p>}
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("purchased")}
            className="w-full rounded-full bg-maroon px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-dark disabled:opacity-60"
          >
            {busy ? "Saving…" : "Confirm purchase"}
          </button>
          {!onlyPurchased && (
            <button
              type="button"
              onClick={() => {
                setMode("choose");
                setError("");
              }}
              className="w-full text-center text-xs text-foreground/55 hover:text-maroon"
            >
              ← Back
            </button>
          )}
        </>
      ) : (
        <>
          <input
            className={input}
            placeholder="Note to the couple (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-xs text-maroon">{error}</p>}
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("planning")}
            className="w-full rounded-full bg-maroon px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-dark disabled:opacity-60"
          >
            {busy ? "Saving…" : "I'm planning to buy this"}
          </button>
          <button
            type="button"
            onClick={goToPurchase}
            className="w-full rounded-full border border-maroon/30 px-4 py-2 text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
          >
            I&apos;ve already bought this
          </button>
          <p className="text-center text-[11px] text-foreground/50">
            A plan holds the gift for 6 hours. Already bought it? Confirming asks
            for your order ID.
          </p>
        </>
      )}
    </div>
  );
}

function Card({ item }: { item: RegistryItemView }) {
  const [status, setStatus] = useState<"available" | "planning" | "purchased">(
    item.effective_status
  );
  const [showForm, setShowForm] = useState(false);

  function handleClaimed(r: ClaimResult) {
    setStatus(r.status);
    setShowForm(false);
  }

  const dimmed = status === "purchased";

  return (
    <article
      className={
        "flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-white/60 " +
        (dimmed ? "opacity-75" : "")
      }
    >

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
          {priceLabel(item.price) && (
            <span className="shrink-0 text-sm text-maroon">{priceLabel(item.price)}</span>
          )}
        </div>

        {item.description && <p className="mt-2 text-sm text-foreground/70">{item.description}</p>}

        <div className="mt-4 flex-1" />

        <a
          href={item.store_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-maroon underline decoration-gold/40 underline-offset-2 hover:decoration-maroon"
        >
          View in store ↗
        </a>

        {status === "purchased" ? (
          <div className="mt-4 rounded-lg border border-sage/40 bg-sage/10 px-3 py-2 text-center text-sm text-foreground/75">
            Purchased ✓
          </div>
        ) : status === "planning" ? (
          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-marigold/40 bg-marigold/10 px-3 py-2 text-center text-sm text-foreground/75">
              On hold
              <span className="block text-[11px] text-foreground/55">
                Soft hold — reopens if not confirmed within 6 hours
              </span>
            </div>
            {showForm ? (
              <ClaimForm
                itemId={item.id}
                onlyPurchased
                initialContact={getHold(item.id)}
                onClaimed={handleClaimed}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full text-center text-xs text-maroon/70 hover:text-maroon"
              >
                I&apos;m the buyer — confirm purchase
              </button>
            )}
          </div>
        ) : showForm ? (
          <ClaimForm itemId={item.id} onClaimed={handleClaimed} />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 w-full rounded-full border border-maroon/30 px-4 py-2 text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
          >
            Claim this gift
          </button>
        )}
      </div>
    </article>
  );
}

/** Gift card card — no claim/hold flow, just a link to purchase. */
function GiftCardCard({ item }: { item: RegistryItemView }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-white/60">
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
        {item.description && <p className="mt-2 text-sm text-foreground/70">{item.description}</p>}
        <div className="mt-4 flex-1" />
        <a
          href={item.store_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-maroon px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-dark"
        >
          Purchase gift card ↗
        </a>
      </div>
    </article>
  );
}

export default function RegistryGrid({ items }: { items: RegistryItemView[] }) {
  const gifts = items.filter((i) => i.category !== "gift_card");
  const giftCards = items.filter((i) => i.category === "gift_card");

  if (items.length === 0) {
    return (
      <p className="text-center text-foreground/60">
        Our registry is being put together — check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {gifts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}

      {giftCards.length > 0 && (
        <div>
          <h2 className="mb-6 font-display text-2xl font-semibold text-maroon">Gift Cards</h2>
          <p className="mb-6 text-sm text-foreground/60">
            Gift cards can be purchased in any amount — no need to claim, just buy and gift!
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {giftCards.map((item) => (
              <GiftCardCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

