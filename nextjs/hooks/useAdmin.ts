"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { postService } from "@/services/postService";

// ─── Query Keys ─────────────────────────────────────────
export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  posts: () => [...adminKeys.all, "posts"] as const,
};

// ─── Queries ────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminService.getDashboard(),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => adminService.getUsers(),
  });
}

export function useAdminPosts() {
  return useQuery({
    queryKey: adminKeys.posts(),
    queryFn: () => postService.getExplorePosts(1, 50),
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useToggleUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.toggleUserRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useAdminDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => adminService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}
