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

  // 🔥 OPTIMISTIC UPDATE
  onMutate: async (id: string) => {
    await queryClient.cancelQueries({ queryKey: ["notifications"] });

    const previousNotifications =
      queryClient.getQueryData<any[]>(["notifications"]);

    // update cache immediately
    queryClient.setQueryData(["notifications"], (old: any[] = []) =>
      old.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );

    return { previousNotifications };
  },

  // 🔄 ROLLBACK ON ERROR
  onError: (_err, _id, context) => {
    if (context?.previousNotifications) {
      queryClient.setQueryData(
        ["notifications"],
        context.previousNotifications
      );
    }
  },

  // 🔁 FINAL SYNC
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  },
});
  /*MARK ALL AS READ */
 const readAllMutation = useMutation({
  mutationFn: () => markAllNotificationsRead(),

  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ["notifications"] });

    const previousNotifications =
      queryClient.getQueryData<any[]>(["notifications"]);

    queryClient.setQueryData(["notifications"], (old: any[] = []) =>
      old.map((n) => ({ ...n, is_read: true }))
    );

    return { previousNotifications };
  },

  onError: (_err, _vars, context) => {
    if (context?.previousNotifications) {
      queryClient.setQueryData(
        ["notifications"],
        context.previousNotifications
      );
    }
  },

  onSettled: () => {
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
