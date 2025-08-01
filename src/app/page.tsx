"use client";
// pages/index.tsx
import { useEffect, useState } from "react";
import { requestNotificationPermission } from "../utils/notification";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function getTokenAndSend() {
      if (typeof window !== "undefined" && "Notification" in window) {
        // Зөвхөн browser дээр ажиллана
        const deviceToken = await requestNotificationPermission();
        setToken(deviceToken);

        if (deviceToken) {
          // Backend NestJS рүү илгээх
          await fetch("http://localhost:5000/api/v1/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: deviceToken,
              title: "title test",
              body: "body test",
              mobile: "88666515",
            }),
          });
        }
      }
    }

    getTokenAndSend();
  }, []);

  return (
    <main className="p-4">
      <h1>Push Notification Example</h1>
      {token ? (
        <p className="text-green-600">Token: {token}</p>
      ) : (
        <p className="text-yellow-600">Awaiting token...</p>
      )}
    </main>
  );
}
