import api from "@/lib/api";
import { Comment, Pagination } from "@/types";

export const commentService = {
  getComments: async (
    postId: string,
    page = 1
  ): Promise<{ success: boolean; comments: Comment[]; pagination: Pagination }> => {
    if (!postId) throw new Error("Post ID is required");
    const res = await api.get(`/comments/${postId}?page=${page}&limit=20`);
    return res.data;
  },

  addComment: async (
    postId: string,
    content: string,
    file?: File
  ): Promise<{ success: boolean; comment: Comment }> => {
    if (!postId) throw new Error("Post ID is required");
    if (!content?.trim() && !file) throw new Error("Comment must have either text or media");
    if (content && content.length > 300) throw new Error("Comment cannot exceed 300 characters");
    
    const formData = new FormData();
    formData.append("content", content?.trim() || "");
    if (file) {
      formData.append("image", file);
    }

    const res = await api.post(`/comments/${postId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    if (!id) throw new Error("Comment ID is required");
    await api.delete(`/comments/${id}`);
  },
};
