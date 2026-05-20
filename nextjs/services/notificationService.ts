import api from "@/lib/api";
import { Notification } from "@/types";

export const notificationService = {
  getNotifications: async (): Promise<{
    success: boolean;
    notifications: Notification[];
    unreadCount: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAllRead: async (): Promise<{ success: boolean; message: string }> => {
    const res = await api.put("/notifications/read");
    return res.data;
  },

  deleteNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
