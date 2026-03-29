"use client";

import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";
import { Notification } from "@/types";

const notificationIcons = {
  like: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  comment: {
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  follow: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  reaction: { icon: Heart, color: "text-orange-500", bg: "bg-orange-500/10" },
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const getNotificationText = (n: Notification) => {
    switch (n.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      default:
        return "";
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
            className="text-blue-500 hover:text-blue-500"
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No notifications yet 🔔</p>
          </div>
        ) : (
          notifications.map((n) => {
            const config = notificationIcons[n.type];
            const Icon = config.icon;
            const href = n.type === "follow"
              ? `/profile/${n.sender._id}`
              : n.post ? `/post/${n.post}` : `/profile/${n.sender._id}`;
            return (
              <Link
                key={n._id}
                href={href}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                  n.isRead ? "bg-card hover:bg-accent/30" : "bg-accent/50 hover:bg-accent/70"
                }`}
              >
                <div className={`p-2 rounded-full ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {n.sender.fullName}
                    </span>{" "}
                    {getNotificationText(n)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <UserAvatar
                  src={n.sender.avatar}
                  fallback={n.sender.fullName}
                  className="h-8 w-8"
                />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
