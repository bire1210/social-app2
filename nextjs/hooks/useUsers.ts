"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/stores/useAuthStore";

// ─── Query Keys ─────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  profile: (id: string) => [...userKeys.all, "profile", id] as const,
  search: (q: string) => [...userKeys.all, "search", q] as const,
  suggested: () => [...userKeys.all, "suggested"] as const,
};

// ─── Queries ────────────────────────────────────────────

export function useProfile(id: string) {
  return useQuery({
    queryKey: userKeys.profile(id),
    queryFn: () => userService.getProfile(id),
    enabled: !!id,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => userService.searchUsers(query),
    enabled: query.trim().length > 0,
  });
}

export function useSuggestedUsers() {
  return useQuery({
    queryKey: userKeys.suggested(),
    queryFn: () => userService.getSuggestedUsers(),
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.toggleFollow(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: FormData) => userService.updateProfile(data),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
