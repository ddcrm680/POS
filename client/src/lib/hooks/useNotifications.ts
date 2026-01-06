import { useEffect, useState } from "react";
import {
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
} from "@/lib/api";

export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    async function loadNotifications() {
        setLoading(true);
        try {
            const [list, count] = await Promise.all([
                fetchNotifications(),
                fetchUnreadNotificationCount(),
            ]);
            setNotifications(list);
            setUnreadCount(count);
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    }

    async function readNotification(id: string) {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (e) {
            console.error(e)
        }
    }

    async function readAll() {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        reload: loadNotifications,
        readNotification,
        readAll,
    };
}
