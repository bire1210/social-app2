import api from "@/lib/api";
import { DashboardStats, User, Post } from "@/types";

export const adminService = {
  getDashboard: async (): Promise<{
    stats: DashboardStats;
    recentUsers: User[];
  }> => {
    const res = await api.get("/admin/stats");
    return res.data;
  },

  getUsers: async (): Promise<{ users: User[] }> => {
    const res = await api.get("/admin/users");
    return res.data;
  },

  toggleUserRole: async (
    userId: string
  ): Promise<{ success: boolean }> => {
    const res = await api.put(`/admin/users/${userId}/role`);
    return res.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/admin/posts/${postId}`);
  },
};
