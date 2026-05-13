"use client";

import { useVideoFeed } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useReactToPost } from "@/hooks/usePosts";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { UPLOADS_URL } from "@/lib/constants";
import {
  MessageCircle,
  Share2,
  Heart,
  Play,
  Volume2,
  VolumeX,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ReelsPage() {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useVideoFeed();
  const reactToPost = useReactToPost();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch comments for the selected post
  const { data: commentsData, isLoading: commentsLoading } = useComments(
    showComments && selectedPostId ? selectedPostId : ""
  );
  const comments = commentsData?.comments ?? [];

  const posts = (data?.pages.flatMap((page) => page.posts) ?? []).filter(
    (p) => p.author != null
  );

  const getVideoUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  // Auto-play current video, pause others
  useEffect(() => {
    posts.forEach((post, idx) => {
      const video = videoRefs.current[post._id];
      if (!video) return;
      if (idx === currentIndex) {
        video.play().catch(() => {});
        setPlayingVideos((prev) => ({ ...prev, [post._id]: true }));
      } else {
        video.pause();
        video.currentTime = 0;
        setPlayingVideos((prev) => ({ ...prev, [post._id]: false }));
      }
    });
  }, [currentIndex, posts.length]);

  // Fetch next page when nearing the end
  useEffect(() => {
    if (currentIndex >= posts.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, posts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll snap observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-index") || "0");
            setCurrentIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.7 }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [posts.length]);

  const toggleMute = (postId: string) => {
    const video = videoRefs.current[postId];
    if (!video) return;
    video.muted = !video.muted;
    setMutedVideos((prev) => ({ ...prev, [postId]: video.muted }));
  };

  const togglePlay = (postId: string) => {
    const video = videoRefs.current[postId];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlayingVideos((prev) => ({ ...prev, [postId]: true }));
    } else {
      video.pause();
      setPlayingVideos((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    try {
      await reactToPost.mutateAsync({ id: postId, type: "like" });
    } catch {
      toast.error("Failed to react");
    }
  };

  const handleComment = (postId: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setSelectedPostId(postId);
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim() && !commentFile) return;

    try {
      await addComment.mutateAsync({ postId, content: commentText, file: commentFile || undefined });
      setCommentText("");
      setCommentFile(null);
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await deleteComment.mutateAsync({ id: commentId, postId });
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center px-4">
        <div className="h-20 w-20 rounded-full bg-accent/60 flex items-center justify-center mb-4">
          <Play className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Reels Yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Video posts will appear here. Be the first to share a video!
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-[calc(100vh-120px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {posts.map((post, index) => (
          <div
            key={post._id}
            data-index={index}
            className="h-[calc(100vh-120px)] snap-start snap-always relative flex flex-col bg-black rounded-xl overflow-hidden mb-2"
          >
            {/* Video Container */}
            <div className="flex-1 relative flex items-center justify-center">
              {/* Video */}
              <video
                ref={(el) => { videoRefs.current[post._id] = el; }}
                src={getVideoUrl(post.video)}
                loop
                muted={mutedVideos[post._id] !== false}
                playsInline
                preload="metadata"
                onClick={() => togglePlay(post._id)}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Play/Pause overlay */}
              {!playingVideos[post._id] && (
                <button
                  onClick={() => togglePlay(post._id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
                >
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-8 w-8 text-white ml-1" fill="white" />
                  </div>
                </button>
              )}

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                {/* Author info */}
                <Link
                  href={`/profile/${post.author._id}`}
                  className="flex items-center gap-3 mb-3"
                >
                  <UserAvatar
                    src={post.author.avatar}
                    fallback={post.author.fullName}
                    className="h-10 w-10 ring-2 ring-white/30"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {post.author.fullName}
                    </p>
                    <p className="text-white/60 text-xs">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>

                {/* Post content */}
                {post.content && (
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2 mb-2">
                    {post.content}
                  </p>
                )}
              </div>

              {/* Right side action buttons */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
                {/* Like */}
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                    post.userReaction
                      ? "bg-red-500/20 text-red-500"
                      : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                  }`}>
                    <Heart
                      className="h-6 w-6"
                      fill={post.userReaction ? "currentColor" : "none"}
                    />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {post.reactions?.length || 0}
                  </span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => handleComment(post._id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {post.commentsCount || 0}
                  </span>
                </button>

                {/* Share */}
                <button
                  onClick={() => handleShare(post._id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <span className="text-white text-xs font-medium">Share</span>
                </button>

                {/* Mute toggle */}
                <button
                  onClick={() => toggleMute(post._id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    {mutedVideos[post._id] !== false ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Comments Section at Bottom */}
            {showComments && selectedPostId === post._id && (
              <div className="bg-black/95 border-t border-white/10 p-4 max-h-[40vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowComments(false)}
                  className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
                  title="Close comments"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Comments List */}
                <div className="space-y-3 mb-4 pr-6">
                  {commentsLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment: any) => (
                      <div key={comment._id} className="flex items-start gap-2 group">
                        <Link href={`/profile/${comment.author._id}`}>
                          <UserAvatar
                            src={comment.author.avatar}
                            fallback={comment.author.fullName}
                            className="h-7 w-7 shrink-0"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white/10 rounded-lg px-2 py-1 inline-block max-w-full">
                            <Link
                              href={`/profile/${comment.author._id}`}
                              className="text-xs font-semibold text-white hover:underline"
                            >
                              {comment.author.fullName}
                            </Link>
                            {comment.content && (
                              <p className="text-xs text-white/90 mt-0.5 break-words">{comment.content}</p>
                            )}
                          </div>
                          {/* Media */}
                          {comment.image && !comment.video && (
                            <img
                              src={getVideoUrl(comment.image)}
                              alt="Comment image"
                              className="mt-2 rounded-lg max-w-[200px] max-h-[200px] object-cover"
                            />
                          )}
                          {comment.video && (
                            <video
                              src={getVideoUrl(comment.video)}
                              controls
                              className="mt-2 rounded-lg max-w-[200px] max-h-[200px] object-cover"
                            />
                          )}
                          <p className="text-[10px] text-white/50 mt-1 ml-1">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {user && user._id === comment.author._id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id, post._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/50 text-center py-2">No comments yet</p>
                  )}
                </div>

                {/* Comment Input */}
                {user && (
                  <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <UserAvatar
                      src={user.avatar}
                      fallback={user.fullName}
                      className="h-7 w-7 shrink-0"
                    />
                    <div className="flex-1 relative">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full h-8 rounded-full bg-white/10 px-3 pr-20 text-xs text-white placeholder-white/50 outline-none focus:ring-1 focus:ring-red-500/50"
                        maxLength={300}
                      />
                      {/* File input */}
                      <label className="absolute right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => setCommentFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={(!commentText.trim() && !commentFile) || addComment.isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 disabled:text-white/30"
                      >
                        {addComment.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading more */}
        {isFetchingNextPage && (
          <div className="h-20 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Sign in to interact with reels"
      />
    </>
  );
}
