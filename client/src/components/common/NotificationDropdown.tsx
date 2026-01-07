import React from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/hooks/useNotifications";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    readNotification,
    readAll,
    loading,
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:text-black hover:bg-transparent"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-[4px] right-[4px] h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={-2}
        collisionPadding={12}
        className="p-0 overflow-hidden sm:w-96 max-w-full"
      >
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <p className="font-semibold text-sm">Notifications</p>

          {unreadCount > 0 && (
            <button
              onClick={readAll}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* ===== BODY ===== */}
        <div className="max-h-[360px] overflow-y-auto">
          {loading && (
            <p className="p-4 text-sm text-muted-foreground">
              Loading notifications…
            </p>
          )}

          {!loading && notifications.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              You’re all caught up 🎉
            </p>
          )}

          {!loading &&
            notifications.map((n: any, idx: number) => (
              <div key={n.id}>
                <button
                  onClick={() => !n.is_read && readNotification(n.id)}
                  className={`
                    relative w-full text-left px-4 py-3 flex gap-3
                    hover:bg-muted/40 transition
                    ${!n.is_read ? "bg-muted/50" : ""}
                  `}
                >
                  {/* Unread indicator */}
                  {!n.is_read && (
                    <span
                      className="
                        absolute left-1 top-1/2
                        h-6 w-1
                        -translate-y-1/2
                        bg-primary rounded-full
                      "
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {n.data?.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {n.created_at}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-snug">
                      {n.data?.message}
                    </p>
                  </div>
                </button>

                {idx !== notifications.length - 1 && (
                  <div className="border-b border-[#ebf0f7]" />
                )}
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
