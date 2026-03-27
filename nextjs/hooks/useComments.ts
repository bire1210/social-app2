"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/commentService";

export const commentKeys = {
  all: ["comments"] as const,
  post: (postId: string) => [...commentKeys.all, postId] as const,
};

export function useComments(postId: string) {
  return useQuery({
    queryKey: commentKeys.post(postId),
    queryFn: () => commentService.getComments(postId),
    enabled: !!postId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      commentService.addComment(postId, content),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, postId }: { id: string; postId: string }) =>
      commentService.deleteComment(id),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
    },
  });
}
