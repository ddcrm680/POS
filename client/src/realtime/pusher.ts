import Pusher from "pusher-js";
import { getRawToken } from "@/lib/api";

let pusher: Pusher | null = null;

export function initRealtimeNotifications(
  userId: number,
  onNotification: (data: any) => void
) {
  if (pusher) {
   // console.log("ℹ️ Pusher already initialized");
    return;
  }

  const token = getRawToken();
  if (!token) {
    console.warn("🔕 No token found, realtime disabled");
    return;
  }

  console.log("🚀 Initializing Pusher");

  pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY!, {
    cluster: process.env.REACT_APP_PUSHER_CLUSTER!,
    forceTLS: true,

    // 🔐 TOKEN-BASED AUTH (Sanctum)
    authEndpoint: `${process.env.REACT_APP_BASE_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  const channelName = `private-App.Models.User.${userId}`;
 console.log("📡 Subscribing to:", channelName);

  const channel = pusher.subscribe(channelName);

  channel.bind(
    "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
    (payload: any) => {
      console.log("🔔 Realtime notification received:", payload);
      onNotification(payload);
    }
  );

  channel.bind("pusher:subscription_succeeded", () => {
   // console.log("✅ Realtime subscription successful");
  });

  channel.bind("pusher:subscription_error", (err: any) => {
    console.error("❌ Realtime subscription error:", err);
  });
}
