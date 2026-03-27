import api from "@/lib/api";
import { Comment, Pagination } from "@/types";

export const commentService = {
  getComments: async (
    postId: string,
    page = 1
  ): Promise<{ success: boolean; comments: Comment[]; pagination: Pagination }> => {
    const res = await api.get(`/comments/${postId}?page=${page}&limit=20`);
    return res.data;
  },

  addComment: async (
    postId: string,
    content: string
  ): Promise<{ success: boolean; comment: Comment }> => {
    const res = await api.post(`/comments/${postId}`, { content });
    return res.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};
