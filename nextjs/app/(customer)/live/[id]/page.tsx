"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLiveStream, useAddViewer, useLikeLiveStream, useAddLiveComment, useEndLiveStream } from "@/hooks/useLiveStreams";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, X, Send, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function LiveStreamPage() {
  const params = useParams();
  const streamId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const { data: streamData, isLoading } = useLiveStream(streamId);
  const addViewer = useAddViewer();
  const likeMutation = useLikeLiveStream();
  const addComment = useAddLiveComment();
  const endStream = useEndLiveStream();

  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const stream = streamData?.stream;

  // Add viewer when component mounts
  useEffect(() => {
    if (streamId && user) {
      addViewer.mutate(streamId);
    }
  }, [streamId, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Sign in to like");
      return;
    }
    try {
      const res = await likeMutation.mutateAsync(streamId);
      setIsLiked(res.isLiked);
      toast.success(res.isLiked ? "Liked!" : "Unliked");
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync({ id: streamId, content: commentText });
      setCommentText("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleEndStream = async () => {
    try {
      await endStream.mutateAsync(streamId);
      toast.success("Stream ended");
      router.push("/live");
    } catch {
      toast.error("Failed to end stream");
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  if (!stream) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Stream not found</p>
      </div>
    );
  }

  const isStreamer = user?._id === stream.streamer._id;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
            <iframe
              src={stream.streamUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Live Badge */}
            {stream.status === "live" && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            )}

            {/* Viewer Count */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
              <Users className="h-4 w-4" />
              {stream.viewerCount}
            </div>
          </div>

          {/* Stream Info */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold">{stream.title}</h1>
                {stream.description && (
                  <p className="text-sm text-muted-foreground mt-1">{stream.description}</p>
                )}
              </div>
              {isStreamer && (
                <Button
                  onClick={handleEndStream}
                  disabled={endStream.isPending}
                  variant="destructive"
                  size="sm"
                  className="rounded-lg"
                >
                  End Stream
                </Button>
              )}
            </div>

            {/* Streamer Info */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Link href={`/profile/${stream.streamer._id}`} className="flex items-center gap-3 group">
                <UserAvatar
                  src={stream.streamer.avatar}
                  fallback={stream.streamer.fullName}
                  className="h-10 w-10"
                />
                <div>
                  <p className="font-semibold text-sm group-hover:underline">{stream.streamer.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{stream.streamer.username}</p>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`p-2 rounded-lg transition-colors ${
                    isLiked
                      ? "bg-red-500/20 text-red-500"
                      : "bg-accent text-muted-foreground hover:text-red-500"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
                <button className="p-2 rounded-lg bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
              <span>{stream.likes.length} likes</span>
              <span>{stream.comments.length} comments</span>
              <span>Started {formatDistanceToNow(new Date(stream.startedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border flex flex-col h-[600px]">
          {/* Comments Header */}
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </h2>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {stream.comments.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No comments yet</p>
            ) : (
              stream.comments.map((comment, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={comment.author.avatar}
                      fallback={comment.author.fullName}
                      className="h-6 w-6"
                    />
                    <span className="text-xs font-semibold">{comment.author.fullName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          {user && (
            <form onSubmit={handleAddComment} className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Say something..."
                  className="flex-1 h-9 rounded-full bg-accent/80 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500/30"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || addComment.isPending}
                  className="p-2 text-red-500 disabled:text-muted-foreground hover:bg-accent rounded-full transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
