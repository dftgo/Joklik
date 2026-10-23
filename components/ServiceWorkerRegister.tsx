"use client";

import { useEffect } from "react";

// Registers the minimal (no-cache) service worker so the app is installable as a PWA.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failure does not affect the screen.
      });
    }
  }, []);

  return null;
}
