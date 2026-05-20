"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/messageService";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";

export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  messages: (convId: string) => [...messageKeys.all, "msgs", convId] as const,
  unread: () => [...messageKeys.all, "unread"] as const,
};

// Optimized conversations hook with better caching
export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: () => messageService.getConversations(),
    enabled: !!user,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 30 * 1000, // Reduced polling frequency
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });
}

// Optimized messages hook with pagination support
export function useMessages(conversationId: string, page = 1) {
  return useQuery({
    queryKey: [...messageKeys.messages(conversationId), page],
    queryFn: () => messageService.getMessages(conversationId, page),
    enabled: !!conversationId,
    staleTime: 10 * 1000, // Consider data fresh for 10 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 15 * 1000, // Reduced polling frequency
    refetchIntervalInBackground: false,
    keepPreviousData: true, // Keep previous data while loading new page
  });
}

// Optimized unread count hook
export function useUnreadMessageCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: messageKeys.unread(),
    queryFn: () => messageService.getUnreadCount(),
    enabled: !!user,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 60 * 1000, // Poll every minute
    refetchIntervalInBackground: false,
  });
}

// Optimized send message hook with optimistic updates
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ content, file }: { content?: string; file?: File }) => 
      messageService.sendMessage(conversationId, content, file),
    
    // Optimistic update for better UX
    onMutate: async ({ content, file }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: messageKeys.messages(conversationId) });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(messageKeys.messages(conversationId));
      
      // Optimistically update with temporary message
      if (content || file) {
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          content: content || "",
          messageType: file ? "file" : "text",
          file: file ? {
            url: "",
            originalName: file.name,
            mimeType: file.type,
            size: file.size
          } : undefined,
          sender: queryClient.getQueryData(["auth", "user"]),
          createdAt: new Date().toISOString(),
          conversation: conversationId,
          readBy: []
        };
        
        queryClient.setQueryData(messageKeys.messages(conversationId), (old: any) => ({
          ...old,
          messages: [...(old?.messages || []), tempMessage]
        }));
      }
      
      return { previousMessages };
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(messageKeys.messages(conversationId), context.previousMessages);
      }
    },
    
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
    },
  });
}

// Optimized conversation creation hook
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => messageService.getOrCreateConversation(userId),
    onSuccess: () => {
      // Only invalidate conversations, not all queries
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

// Utility hook for bulk message operations (for future use)
export function useBulkMessageOperations() {
  const queryClient = useQueryClient();
  
  const markAsRead = useCallback(async (conversationId: string, messageIds: string[]) => {
    // Optimistically update read status
    queryClient.setQueryData(messageKeys.messages(conversationId), (old: any) => ({
      ...old,
      messages: old?.messages?.map((msg: any) => 
        messageIds.includes(msg._id) 
          ? { ...msg, readBy: [...msg.readBy, "currentUserId"] }
          : msg
      )
    }));
  }, [queryClient]);
  
  return { markAsRead };
}
