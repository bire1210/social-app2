import api from "@/lib/api";
import { Notification } from "@/types";

export const notificationService = {
  getNotifications: async (): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAllRead: async (): Promise<void> => {
    await api.put("/notifications/read");
  },
};
