"use client";

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { postService } from "@/services/postService";

// ─── Query Keys ─────────────────────────────────────────
export const postKeys = {
  all: ["posts"] as const,
  feed: () => [...postKeys.all, "feed"] as const,
  explore: () => [...postKeys.all, "explore"] as const,
  user: (userId: string) => [...postKeys.all, "user", userId] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
};

// ─── Queries ────────────────────────────────────────────

export function useFeed() {
  return useInfiniteQuery({
    queryKey: postKeys.feed(),
    queryFn: ({ pageParam = 1 }) => postService.getFeed(pageParam),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useExplorePosts() {
  return useQuery({
    queryKey: postKeys.explore(),
    queryFn: () => postService.getExplorePosts(),
  });
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: postKeys.user(userId),
    queryFn: () => postService.getUserPosts(userId),
    enabled: !!userId,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });
}

// ─── Mutations ──────────────────────────────────────────

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.feed() });
      queryClient.invalidateQueries({ queryKey: postKeys.explore() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      postService.editPost(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useReactToPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) =>
      postService.reactToPost(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
