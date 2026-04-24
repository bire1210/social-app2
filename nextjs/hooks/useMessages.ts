"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/messageService";
import { useAuthStore } from "@/stores/useAuthStore";

export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  messages: (convId: string) => [...messageKeys.all, "msgs", convId] as const,
  unread: () => [...messageKeys.all, "unread"] as const,
};

export function useConversations() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: () => messageService.getConversations(),
    enabled: !!user,
    refetchInterval: 5000, // poll every 5s for new messages
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId),
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 3000, // poll every 3s inside a chat
  });
}

export function useUnreadMessageCount() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: messageKeys.unread(),
    queryFn: () => messageService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 10000,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => messageService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
    },
  });
}

export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => messageService.getOrCreateConversation(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}
