"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";

// ─── Query Keys ─────────────────────────────────────────
export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

// ─── Queries ────────────────────────────────────────────

export function useNotifications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new notifications
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      // Update the cache to mark all as read
      queryClient.setQueryData(notificationKeys.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications?.map((n: any) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData(notificationKeys.list(), (old: any) => {
        if (!old) return old;
        const filteredNotifications = old.notifications?.filter((n: any) => n._id !== deletedId);
        return {
          ...old,
          notifications: filteredNotifications,
          unreadCount: Math.max(0, old.unreadCount - 1),
        };
      });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
