"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveStreamService } from "@/services/liveStreamService";
import { useAuthStore } from "@/stores/useAuthStore";

export const liveKeys = {
  all: ["live"] as const,
  streams: () => [...liveKeys.all, "streams"] as const,
  stream: (id: string) => [...liveKeys.all, "stream", id] as const,
};

export function useLiveStreams() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: liveKeys.streams(),
    queryFn: () => liveStreamService.getLiveStreams(),
    enabled: !!user,
    refetchInterval: 5000,
  });
}

export function useLiveStream(id: string) {
  return useQuery({
    queryKey: liveKeys.stream(id),
    queryFn: () => liveStreamService.getLiveStream(id),
    enabled: !!id,
    refetchInterval: 2000,
  });
}

export function useStartLiveStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      liveStreamService.startLiveStream(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveKeys.streams() });
    },
  });
}

export function useEndLiveStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveStreamService.endLiveStream(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveKeys.streams() });
    },
  });
}

export function useAddViewer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveStreamService.addViewer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: liveKeys.stream(id) });
    },
  });
}

export function useLikeLiveStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveStreamService.likeLiveStream(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: liveKeys.stream(id) });
    },
  });
}

export function useAddLiveComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      liveStreamService.addComment(id, content),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: liveKeys.stream(id) });
    },
  });
}
