import api from "@/lib/api";
import { Post, Pagination } from "@/types";

export const postService = {
  createPost: async (data: FormData): Promise<{ success: boolean; post: Post }> => {
    const res = await api.post("/posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getFeed: async (page = 1, limit = 10): Promise<{ success: boolean; posts: Post[]; pagination: Pagination }> => {
    const res = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
    return res.data;
  },

  getExplorePosts: async (page = 1, limit = 10): Promise<{ success: boolean; posts: Post[]; pagination: Pagination }> => {
    const res = await api.get(`/posts/explore?page=${page}&limit=${limit}`);
    return res.data;
  },

  getPost: async (id: string): Promise<{ success: boolean; post: Post }> => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },

  getUserPosts: async (userId: string, page = 1): Promise<{ success: boolean; posts: Post[]; pagination: Pagination }> => {
    const res = await api.get(`/posts/user/${userId}?page=${page}`);
    return res.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  toggleLike: async (id: string): Promise<{ success: boolean; isLiked: boolean }> => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },

  editPost: async (id: string, content: string): Promise<{ success: boolean; post: Post }> => {
    const res = await api.put(`/posts/${id}`, { content });
    return res.data;
  },

  reactToPost: async (id: string, type: string): Promise<{ success: boolean; userReaction: string | null; reactionCounts: Record<string, number>; totalReactions: number }> => {
    const res = await api.post(`/posts/${id}/react`, { type });
    return res.data;
  },
};
