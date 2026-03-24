"use client";

import { create } from "zustand";
import { User } from "@/types";
import { authService } from "@/services/authService";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user });
  },

  register: async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null });
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const data = await authService.getMe();
        set({ user: data.user, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, loading: false });
    }
  },
}));
