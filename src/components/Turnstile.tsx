"use client";

import { useEffect, useRef } from "react";

// Renders a Cloudflare Turnstile widget when NEXT_PUBLIC_TURNSTILE_SITE_KEY is
// set, and reports the token via onToken. Renders nothing (and reports a null
// token) when not configured, so forms work before Turnstile is set up.

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// True when Turnstile is configured — forms use this to require a token.
export const turnstileConfigured = !!SITE_KEY;

export default function Turnstile({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return; // not configured — nothing to render

    function render() {
      if (!ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY!,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
        theme: "light",
      });
    }

    if (window.turnstile) {
      render();
    } else if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      const t = setInterval(() => {
        if (window.turnstile) {
          clearInterval(t);
          render();
        }
      }, 200);
      return () => clearInterval(t);
    }
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="my-2" />;
}
