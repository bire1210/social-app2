"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storyService } from "@/services/storyService";
import { useAuthStore } from "@/stores/useAuthStore";

export const storyKeys = {
  all: ["stories"] as const,
  feed: () => [...storyKeys.all, "feed"] as const,
};

export function useStories() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: storyKeys.feed(),
    queryFn: () => storyService.getStories(),
    enabled: !!user,
    refetchInterval: 60_000,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => storyService.createStory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useViewStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storyService.viewStory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storyService.deleteStory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useAddStoryComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, content }: { storyId: string; content: string }) =>
      storyService.addComment(storyId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useGetStoryComments(storyId: string) {
  return useQuery({
    queryKey: [...storyKeys.all, "comments", storyId],
    queryFn: () => storyService.getComments(storyId),
  });
}

export function useDeleteStoryComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, commentId }: { storyId: string; commentId: string }) =>
      storyService.deleteComment(storyId, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storyKeys.all }),
  });
}
