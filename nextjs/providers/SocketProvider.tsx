"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/hooks/useNotifications";
import { toast } from "react-hot-toast";
import { Notification } from "@/types";
import { io, Socket } from "socket.io-client";
interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  const getNotificationText = useCallback((n: Notification) => {
    switch (n.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      default:
        return "sent you a notification";
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
      const newSocket = io(socketUrl, {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        setConnected(true);
        console.log("🔌 Connected to socket server");
        newSocket.emit("join", user._id);
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
        console.log("👋 Disconnected from socket server");
      });

      // Handle real-time notifications
      newSocket.on("newNotification", (notification: Notification) => {
        console.log("📢 New notification received:", notification);

        // Update React Query Cache
        queryClient.setQueryData(notificationKeys.list(), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            notifications: [notification, ...(old.notifications || [])].slice(
              0,
              50,
            ),
            unreadCount: (old.unreadCount || 0) + 1,
          };
        });

        // Show premium toast
        toast.success(
          `${notification.sender.fullName} ${getNotificationText(notification)}`,
          {
            icon: "🔔",
            style: {
              borderRadius: "12px",
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          },
        );
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
      setConnected(false);
    }
  }, [user, queryClient, getNotificationText]);

  const value = React.useMemo(
    () => ({ socket, connected }),
    [socket, connected],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
