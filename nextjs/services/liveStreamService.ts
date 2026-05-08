import api from "@/lib/api";
import { LiveStream } from "@/types";

export const liveStreamService = {
  getLiveStreams: async (): Promise<{ success: boolean; streams: LiveStream[] }> => {
    const res = await api.get("/live");
    return res.data;
  },

  getLiveStream: async (id: string): Promise<{ success: boolean; stream: LiveStream }> => {
    const res = await api.get(`/live/${id}`);
    return res.data;
  },

  startLiveStream: async (data: {
    title: string;
    description?: string;
    streamUrl: string;
    thumbnail?: string;
  }): Promise<{ success: boolean; stream: LiveStream }> => {
    const res = await api.post("/live/start", data);
    return res.data;
  },

  addViewer: async (id: string): Promise<{ success: boolean; viewerCount: number }> => {
    const res = await api.post(`/live/${id}/view`);
    return res.data;
  },

  likeLiveStream: async (id: string): Promise<{ success: boolean; isLiked: boolean; likeCount: number }> => {
    const res = await api.post(`/live/${id}/like`);
    return res.data;
  },

  addComment: async (id: string, content: string): Promise<{ success: boolean; comments: any[] }> => {
    const res = await api.post(`/live/${id}/comment`, { content });
    return res.data;
  },

  endLiveStream: async (id: string): Promise<{ success: boolean; stream: LiveStream }> => {
    const res = await api.post(`/live/${id}/end`);
    return res.data;
  },

  getStreamerLiveStreams: async (streamerId: string): Promise<{ success: boolean; streams: LiveStream[] }> => {
    const res = await api.get(`/live/streamer/${streamerId}`);
    return res.data;
  },
};
