"use client";

import { useEffect, useState } from "react";
import { requestNotificationPermission } from "../utils/notification";
import DashboardPage from "./dashboard/page";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Service worker register
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

    // Notification permission & token
    async function setupFCM() {
      const deviceToken = await requestNotificationPermission();
      if (deviceToken) {
        setToken(deviceToken);

        // Backend NestJS рүү token илгээх
        // await fetch("http://srv654666.hstgr.cloud:4000/api/v1/register", {
        // // await fetch("http://192.168.1.15:4000/api/v1/register", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     token: deviceToken,
        //     title: "title test",
        //     body: "body test",
        //     mobile: "88666515",
        //   }),
        // });
      }
    }

    // setupFCM();
  }, []);
  const router = useRouter();

  // 🔔 Foreground push popup харуулах
  useEffect(() => {
    async function listenForForegroundPush() {
      const { getMessaging, onMessage } = await import("firebase/messaging");
      const { firebaseApp } = await import("../lib/firebase");

      const messaging = getMessaging(firebaseApp);

      onMessage(messaging, (payload) => {
        console.log("🔔 Foreground push received:", payload);

        const { title, body, icon } = payload.notification || {};
        if (Notification.permission === "granted") {
          new Notification(title || "Notification", {
            body: body || "No body",
            icon: icon,
          });
        }
      });
    }
    router.refresh();
    // listenForForegroundPush();
  }, []);

  return (
    <main>
      <DashboardPage />
      {/* <h1 className="text-2xl font-bold">🚀 Firebase Push Test</h1>
      {token ? (
        <p className="text-green-600">Device Token: {token}</p>
      ) : (
        <p>Loading token...</p>
      )} */}
    </main>
  );
}
