"use client";

import { useEffect, useState } from "react";
import {
  isIOS,
  isStandalone,
  pushSupported,
  urlBase64ToUint8Array,
} from "@/lib/pushClient";

type State =
  | "loading"
  | "ios-install" // iOS, not installed — must Add to Home Screen first
  | "unsupported" // browser can't do web push at all
  | "enabled" // subscribed
  | "default" // can enable
  | "denied" // permission blocked
  | "skipped"; // user dismissed for now

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export default function EnableUpdates() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      // iOS only allows web push when installed to the Home Screen.
      if (isIOS() && !isStandalone()) return setState("ios-install");
      if (!pushSupported()) return setState("unsupported");

      if (Notification.permission === "denied") return setState("denied");

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "enabled" : "default");
      } catch {
        setState("default");
      }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "skipped");
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sub.toJSON(), userAgent: navigator.userAgent }),
      });
      if (!res.ok) throw new Error();
      setState("enabled");
    } catch {
      setState("default");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("default");
    } catch {
      // leave as-is
    } finally {
      setBusy(false);
    }
  }

  const card = "rounded-2xl border p-5 text-sm";

  if (state === "loading") return null;

  if (state === "enabled") {
    return (
      <div className={`${card} border-sage/40 bg-sage/10`}>
        <p className="font-medium text-foreground">✓ You&apos;re getting updates</p>
        <p className="mt-1 text-foreground/65">
          We&apos;ll notify you here when we post wedding news.
        </p>
        <button
          onClick={disable}
          disabled={busy}
          className="mt-3 text-xs text-maroon/70 underline hover:text-maroon disabled:opacity-60"
        >
          Turn off notifications
        </button>
      </div>
    );
  }

  if (state === "ios-install") {
    return (
      <div className={`${card} border-gold/30 bg-cream/50`}>
        <p className="font-medium text-foreground">Get updates on your iPhone/iPad</p>
        <p className="mt-1 text-foreground/70">
          To receive notifications on iOS, add this site to your Home Screen first:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-foreground/70">
          <li>Tap the <strong>Share</strong> icon (the square with an up arrow) in Safari.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Open the app from your Home Screen, then come back here to enable updates.</li>
        </ol>
        <p className="mt-2 text-xs text-foreground/55">
          You can always read the latest news on this Updates page, with or without notifications.
        </p>
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <div className={`${card} border-gold/30 bg-cream/40`}>
        <p className="text-foreground/70">
          Your browser doesn&apos;t support notifications — no problem! Just check
          this Updates page anytime for the latest news.
        </p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className={`${card} border-marigold/40 bg-marigold/10`}>
        <p className="font-medium text-foreground">Notifications are blocked</p>
        <p className="mt-1 text-foreground/70">
          You&apos;ve blocked notifications for this site, so you may miss updates.
          You can re-enable them in your browser settings — or just check this page
          anytime.
        </p>
      </div>
    );
  }

  if (state === "skipped") {
    return (
      <div className={`${card} border-marigold/40 bg-marigold/10`}>
        <p className="text-foreground/75">
          No worries — you can enable updates later. Just remember to check this
          Updates page so you don&apos;t miss anything!
        </p>
        <button
          onClick={() => setState("default")}
          className="mt-2 text-xs text-maroon underline hover:text-maroon"
        >
          Actually, enable updates
        </button>
      </div>
    );
  }

  // default
  return (
    <div className={`${card} border-gold/30 bg-white/60`}>
      <p className="font-medium text-foreground">Get wedding updates</p>
      <p className="mt-1 text-foreground/70">
        Turn on notifications and we&apos;ll let you know when we post news —
        schedule changes, details, and more.
      </p>
      <div className="mt-3 flex gap-3">
        <button
          onClick={enable}
          disabled={busy}
          className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark disabled:opacity-60"
        >
          {busy ? "Enabling…" : "Enable updates"}
        </button>
        <button
          onClick={() => setState("skipped")}
          className="rounded-full border border-maroon/30 px-5 py-2 text-sm text-maroon hover:bg-maroon/5"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
