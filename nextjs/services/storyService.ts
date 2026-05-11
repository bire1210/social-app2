import api from "@/lib/api";
import { StoryGroup, Story } from "@/types";

export const storyService = {
  getStories: async (): Promise<{ success: boolean; storyGroups: StoryGroup[] }> => {
    const res = await api.get("/stories");
    return res.data;
  },

  createStory: async (data: FormData): Promise<{ success: boolean; story: Story }> => {
    const res = await api.post("/stories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  viewStory: async (id: string): Promise<void> => {
    await api.post(`/stories/${id}/view`);
  },

  deleteStory: async (id: string): Promise<void> => {
    await api.delete(`/stories/${id}`);
  },

  addComment: async (
    storyId: string,
    content: string
  ): Promise<{ success: boolean; comment: any }> => {
    const res = await api.post(`/stories/${storyId}/comments`, { content });
    return res.data;
  },

  getComments: async (storyId: string): Promise<{ success: boolean; comments: any[] }> => {
    const res = await api.get(`/stories/${storyId}/comments`);
    return res.data;
  },

  deleteComment: async (storyId: string, commentId: string): Promise<void> => {
    await api.delete(`/stories/${storyId}/comments/${commentId}`);
  },
};
