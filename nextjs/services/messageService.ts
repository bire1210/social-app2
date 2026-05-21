import api from "@/lib/api";
import { Conversation, Message } from "@/types";

export const messageService = {
  getConversations: async (): Promise<{ success: boolean; conversations: Conversation[] }> => {
    const res = await api.get("/messages/conversations");
    return res.data;
  },

  getOrCreateConversation: async (userId: string): Promise<{ success: boolean; conversation: Conversation }> => {
    const res = await api.post(`/messages/conversations/${userId}`);
    return res.data;
  },

  getMessages: async (conversationId: string, page = 1): Promise<{ success: boolean; messages: Message[]; pagination: { page: number; pages: number } }> => {
    const res = await api.get(`/messages/conversations/${conversationId}/messages?page=${page}`);
    return res.data;
  },

  sendMessage: async (conversationId: string, content?: string, file?: File): Promise<{ success: boolean; message: Message }> => {
    console.log("=== DEBUG: sendMessage service called ===");
    console.log("Conversation ID:", conversationId);
    console.log("Content:", content);
    console.log("File:", file);

    const formData = new FormData();
    
    if (content) {
      formData.append("content", content);
      console.log("Added content to FormData");
    }
    
    if (file) {
      formData.append("file", file);
      console.log("Added file to FormData");
    }

    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const res = await api.post(`/messages/conversations/${conversationId}/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  },

  getUnreadCount: async (): Promise<{ success: boolean; unreadCount: number }> => {
    const res = await api.get("/messages/unread-count");
    return res.data;
  },
};
