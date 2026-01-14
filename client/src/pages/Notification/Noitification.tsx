
import { ChevronLeft, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GlobalLoader } from "@/components/common/GlobalLoader";
import { useNotifications } from "@/lib/hooks/useNotifications";

export default function NotificationPage() {
  const {
    notifications,
    loading,
    readNotification,
  } = useNotifications();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <GlobalLoader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <button
           onClick={() => {
 localStorage.removeItem('sidebar_active_parent')
              window.history.back()
            }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="text-lg font-semibold">Notifications</h1>
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Bell className="h-7 w-7 text-blue-500" />
            </div>
            <h2 className="font-semibold text-gray-900">
              No notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              You’re all caught up 🎉
            </p>
          </CardContent>
        </Card>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {notifications.map((n: any) => (
          <Card
            key={n.id}
            className={`transition ${
              !n.is_read ? "border-blue-200 bg-blue-50/50" : ""
            }`}
          >
            <button
              onClick={() => !n.is_read && readNotification(n.id)}
              className={`w-full text-left ${!n.is_read ?" cursor-pointer" :"cursor-default"}`}
            >
              <CardContent className="p-4 space-y-1">
                <div className="flex justify-between items-start gap-3">
                  <p
                    className={`text-sm ${
                      !n.is_read
                        ? "font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {n.data?.title}
                  </p>

                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {n.created_at}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {n.data?.message}
                </p>
              </CardContent>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}