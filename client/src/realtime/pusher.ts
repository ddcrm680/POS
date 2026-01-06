import Pusher from "pusher-js";
import { getRawToken } from "@/lib/api";
import { Constant } from "@/lib/constant";

let pusher: Pusher | null = null;

export function initRealtimeNotifications(
  userId: number,
  onNotification: (data: any) => void
) {
  if (pusher) return;

  const token = getRawToken();
  if (!token) return;

  pusher = new Pusher(Constant.REACT_APP_PUSHER_KEY, {
    cluster: Constant.REACT_APP_PUSHER_CLUSTER,
    forceTLS: true,

    // 🔐 Sanctum-authenticated private channels
    authEndpoint: `${Constant.REACT_APP_BASE_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  const channelName = `private-App.Models.User.${userId}`;
  const channel = pusher.subscribe(channelName);

  channel.bind(
    "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
    (payload: any) => {
      onNotification(payload);
    }
  );

  //ONLY one error handler
  channel.bind("pusher:subscription_error", (err: any) => {
    console.error("Realtime subscription error", err);
  });
}
