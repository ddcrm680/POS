
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
      // SHOW TOAST
      toast({
        title: payload?.data?.title ?? "New notification",
        description: payload?.data?.message ?? "",
      });

      // 🔁 REFRESH DATA
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    });
  }, [user?.id]);

  return null;
}
