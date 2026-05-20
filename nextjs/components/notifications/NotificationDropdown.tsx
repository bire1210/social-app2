"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NotificationBadge } from "@/components/shared/NotificationBadge";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus, Check, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Notification } from "@/types";

const notificationIcons = {
  like: { icon: Heart, color: "text-rose-500" },
  comment: { icon: MessageCircle, color: "text-red-500" },
  follow: { icon: UserPlus, color: "text-emerald-500" },
  reaction: { icon: Heart, color: "text-orange-500" },
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications?.slice(0, 5) ?? []; // Show only 5 recent
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationText = (n: Notification) => {
    switch (n.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "reaction":
        return "reacted to your post";
      default:
        return "";
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border rounded-2xl shadow-xl z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="text-red-500 hover:text-red-600 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => {
                  const config = notificationIcons[n.type];
                  const Icon = config?.icon || Bell;
                  const href = n.type === "follow"
                    ? `/profile/${n.sender._id}`
                    : n.post ? `/post/${n.post._id}` : `/profile/${n.sender._id}`;
                  
                  return (
                    <Link
                      key={n._id}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-start gap-3 p-3 hover:bg-accent/30 transition-colors ${
                        !n.isRead ? "bg-accent/20" : ""
                      }`}
                    >
                      <UserAvatar
                        src={n.sender.avatar}
                        fallback={n.sender.fullName}
                        className="h-10 w-10 shrink-0"
                      />
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
                      <div className="shrink-0">
                        <Icon className={`h-4 w-4 ${config?.color || "text-muted-foreground"}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border p-3">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                See all notifications
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}