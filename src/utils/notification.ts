// utils/notification.ts
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from "../lib/firebase";

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null; // SSR үед ажиллуулахгүй
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Push permission denied");
    return null;
  }

  try {
    const messaging = getMessaging(firebaseApp);
    if (!messaging) {
      console.warn("Messaging not supported in this browser");
      return null;
    }
    const token = await getToken(messaging, {
      vapidKey: "BMUrdJe582ghlwOHRQAEF9aPRKkb6Fv-e3e6wBDhpB5MQ8_NMMbJBuL6Ps55Pv5WyVLqZr0JPqJ31YC8PIMtsNM", // Firebase Console > Project Settings > Cloud Messaging
    });

    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}
