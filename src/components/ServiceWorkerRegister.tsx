"use client";

import { useEffect } from "react";

// Registers the service worker once on load so the app is installable and can
// receive web push. Safe no-op where service workers aren't supported.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration can fail in unsupported/incognito contexts — ignore.
      });
    }
  }, []);
  return null;
}
