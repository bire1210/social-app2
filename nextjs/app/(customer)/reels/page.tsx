"use client";

import { useVideoFeed } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useReactToPost } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { UPLOADS_URL } from "@/lib/constants";
import { Post, ReactionType } from "@/types";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState, useRef, useEffect, useCallback } from "react";
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

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

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
            className="h-[calc(100vh-120px)] snap-start snap-always relative flex items-center justify-center bg-black rounded-xl overflow-hidden mb-2"
          >
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
              <Link
                href={`/post/${post._id}`}
                className="flex flex-col items-center gap-1"
              >
                <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <span className="text-white text-xs font-medium">
                  {post.commentsCount || 0}
                </span>
              </Link>

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
