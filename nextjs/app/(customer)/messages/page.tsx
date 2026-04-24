"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useGetOrCreateConversation,
} from "@/hooks/useMessages";
import { useSearchUsers } from "@/hooks/useUsers";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Conversation, Message, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  Search,
  MessageCircle,
  ArrowLeft,
  Loader2,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Conversation List ───────────────────────────────────
function ConversationList({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (conv: Conversation) => void;
}) {
  const { user } = useAuth();
  const { data, isLoading } = useConversations();
  const conversations = data?.conversations ?? [];

  const getOther = (conv: Conversation) =>
    conv.participants.find((p) => p._id !== user?._id) ?? conv.participants[0];

  if (isLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const other = getOther(conv);
        const isSelected = selected === conv._id;
        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/60 transition-colors text-left ${
              isSelected ? "bg-accent" : ""
            }`}
          >
            <div className="relative shrink-0">
              <UserAvatar src={other?.avatar} fallback={other?.fullName ?? "?"} className="h-12 w-12" />
              {conv.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold" : "font-medium"}`}>
                  {other?.fullName}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                  {conv.lastMessageAt
                    ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })
                    : ""}
                </span>
              </div>
              <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {conv.lastMessage?.content ?? "Start a conversation"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Chat Window ─────────────────────────────────────────
function ChatWindow({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const { data, isLoading } = useMessages(conversation._id);
  const sendMessage = useSendMessage(conversation._id);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = data?.messages ?? [];

  const other = conversation.participants.find((p) => p._id !== user?._id) ?? conversation.participants[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sendMessage.isPending) return;
    const content = text.trim();
    setText("");
    try {
      await sendMessage.mutateAsync(content);
    } catch {
      toast.error("Failed to send message");
      setText(content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <UserAvatar src={other?.avatar} fallback={other?.fullName ?? "?"} className="h-9 w-9" />
        <div>
          <p className="font-semibold text-sm">{other?.fullName}</p>
          <p className="text-xs text-muted-foreground">@{other?.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center pt-8"><LoadingSpinner /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <UserAvatar src={other?.avatar} fallback={other?.fullName ?? "?"} className="h-16 w-16 mb-3" />
            <p className="font-semibold">{other?.fullName}</p>
            <p className="text-sm text-muted-foreground mt-1">Say hello!</p>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isMe = msg.sender._id === user?._id;
            return (
              <div key={msg._id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                  <UserAvatar src={msg.sender.avatar} fallback={msg.sender.fullName} className="h-7 w-7 shrink-0" />
                )}
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-accent rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
        <UserAvatar src={user?.avatar} fallback={user?.fullName ?? "?"} className="h-8 w-8 shrink-0" />
        <div className="flex-1 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aa"
            maxLength={2000}
            className="w-full h-9 rounded-full bg-accent/80 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMessage.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:text-muted-foreground transition-colors"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── New Message Search ───────────────────────────────────
function NewMessagePanel({ onConversationCreated }: { onConversationCreated: (conv: Conversation) => void }) {
  const [query, setQuery] = useState("");
  const { data } = useSearchUsers(query);
  const getOrCreate = useGetOrCreateConversation();
  const users = data?.users ?? [];

  const handleSelect = async (u: User) => {
    try {
      const res = await getOrCreate.mutateAsync(u._id);
      onConversationCreated(res.conversation);
    } catch {
      toast.error("Failed to open conversation");
    }
  };

  return (
    <div className="p-4 space-y-3">
      <p className="font-semibold text-sm">New Message</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          className="pl-9 rounded-full bg-accent/60 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
          autoFocus
        />
      </div>
      <div className="space-y-1">
        {users.map((u) => (
          <button
            key={u._id}
            onClick={() => handleSelect(u)}
            disabled={getOrCreate.isPending}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-colors"
          >
            <UserAvatar src={u.avatar} fallback={u.fullName} className="h-10 w-10" />
            <div className="text-left">
              <p className="text-sm font-medium">{u.fullName}</p>
              <p className="text-xs text-muted-foreground">@{u.username}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [showNew, setShowNew] = useState(false);
  const getOrCreate = useGetOrCreateConversation();

  // Open conversation from ?with=userId param (e.g. from profile page)
  useEffect(() => {
    const withUserId = searchParams.get("with");
    if (withUserId && user) {
      getOrCreate.mutateAsync(withUserId).then((res) => {
        setSelectedConv(res.conversation);
      }).catch(() => {});
    }
  }, [searchParams, user]);

  if (loading) return <div className="flex justify-center mt-20"><LoadingSpinner /></div>;

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex h-[calc(100vh-100px)]">
      {/* Left panel — conversation list */}
      <div className={`w-full md:w-[340px] shrink-0 flex flex-col border-r border-border ${selectedConv ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="font-bold text-lg">Messages</h1>
          <button
            onClick={() => { setShowNew(!showNew); setSelectedConv(null); }}
            className="h-9 w-9 rounded-full bg-accent/80 hover:bg-accent flex items-center justify-center transition-colors"
            title="New message"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>

        {showNew ? (
          <NewMessagePanel
            onConversationCreated={(conv) => {
              setSelectedConv(conv);
              setShowNew(false);
            }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              selected={selectedConv?._id ?? null}
              onSelect={(conv) => { setSelectedConv(conv); setShowNew(false); }}
            />
          </div>
        )}
      </div>

      {/* Right panel — chat */}
      <div className={`flex-1 flex flex-col ${selectedConv ? "flex" : "hidden md:flex"}`}>
        {selectedConv ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden flex items-center gap-2 px-3 pt-2">
              <button onClick={() => setSelectedConv(null)} className="p-1 rounded-full hover:bg-accent">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <ChatWindow conversation={selectedConv} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-20 w-20 rounded-full bg-accent/60 flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg">Your Messages</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Send private messages to your friends and connections.
            </p>
            <Button
              onClick={() => setShowNew(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
            >
              Send a message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
