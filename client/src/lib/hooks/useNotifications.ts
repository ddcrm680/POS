import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export function useNotifications() {
  /*FETCH NOTIFICATIONS*/
  const { data = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(),
  });


  /*DERIVE UNREAD COUNT*/
  const unreadCount = data.filter((n: any) => !n.is_read).length;

  /*MARK SINGLE AS READ */
  const readMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  /*MARK ALL AS READ */
  const readAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: data,
    unreadCount,
    loading: isLoading,
    readNotification: (id: string) => readMutation.mutate(id),
    readAll: () => readAllMutation.mutate(),
  };
  
}
