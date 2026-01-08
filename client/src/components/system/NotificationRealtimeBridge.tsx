
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { initRealtimeNotifications } from "@/realtime/pusher";
import { toast } from "@/hooks/use-toast";

export default function NotificationRealtimeBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    initRealtimeNotifications(Number(user.id), (payload) => {
      toast({
        title: payload?.data?.title ?? "New notification",
        description: payload?.data?.message ?? "",
        variant: "info",
      });

      // 🔁 Re-fetch notifications list only
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
  }, [user?.id]);

  return null;
}

