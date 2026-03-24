import api from "@/lib/api";
import { AuthResponse } from "@/types";

export const authService = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<AuthResponse> => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
