"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClientEffects() {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("❌ Service Worker registration failed:", err);
        });
    }
  }, []);

  useEffect(() => {
    router.refresh();
  }, [router]);

  return null;
}
