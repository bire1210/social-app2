import api from "@/lib/api";
import { User } from "@/types";

export const userService = {
  getProfile: async (id: string): Promise<{ success: boolean; user: User }> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  updateProfile: async (data: FormData): Promise<{ success: boolean; user: User }> => {
    const res = await api.put("/users/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  toggleFollow: async (id: string): Promise<{ success: boolean; isFollowing: boolean }> => {
    const res = await api.post(`/users/${id}/follow`);
    return res.data;
  },

  searchUsers: async (q: string): Promise<{ success: boolean; users: User[] }> => {
    const res = await api.get(`/users/search?q=${q}`);
    return res.data;
  },

  getSuggestedUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    const res = await api.get("/users/suggested");
    return res.data;
  },
};
