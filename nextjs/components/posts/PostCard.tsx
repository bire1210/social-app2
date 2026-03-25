"use client";

import { useState } from "react";
import { Post } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToggleLike, useDeletePost } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { Button } from "@/components/ui/button";
import { UPLOADS_URL } from "@/lib/constants";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  ThumbsUp,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [isLiked, setIsLiked] = useState(
    user ? post.likes.includes(user._id) : false
  );
  const [likesCount, setLikesCount] = useState(
    post.likesCount || post.likes.length
  );

  const handleLike = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    if (toggleLike.isPending) return;
    try {
      const res = await toggleLike.mutateAsync(post._id);
      setIsLiked(res.isLiked);
      setLikesCount((prev) => (res.isLiked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post._id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  const commentsCount =
    post.commentsCount ||
    (Array.isArray(post.comments) ? post.comments.length : 0);

  return (
    <>
      <article className="bg-card rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4">
          <Link
            href={`/profile/${post.author._id}`}
            className="flex items-center gap-3 group"
          >
            <UserAvatar
              src={post.author.avatar}
              fallback={post.author.fullName}
              className="h-10 w-10"
            />
            <div>
              <p className="font-semibold text-sm group-hover:underline">
                {post.author.fullName}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                <span>·</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {user && user._id === post.author._id && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 mt-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Image */}
        {post.image && (
          <div className="mt-3">
            <img
              src={getImageUrl(post.image)}
              alt="Post image"
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Like & Comment counts */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {likesCount > 0 && (
                <>
                  <div className="flex -space-x-1">
                    <div className="h-[18px] w-[18px] rounded-full bg-blue-500 flex items-center justify-center">
                      <ThumbsUp className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div className="h-[18px] w-[18px] rounded-full bg-rose-500 flex items-center justify-center">
                      <Heart className="h-2.5 w-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <span>{likesCount}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {commentsCount > 0 && (
                <span>
                  {commentsCount} comment{commentsCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border mx-4" />

        {/* Action buttons — Facebook style */}
        <div className="flex items-center px-2 py-1">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
              isLiked
                ? "text-blue-500"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <ThumbsUp
              className={`h-5 w-5 transition-all duration-200 ${
                isLiked ? "fill-blue-500 text-blue-500" : ""
              }`}
            />
            <span className="text-sm font-medium">Like</span>
          </button>

          {user ? (
            <Link
              href={`/post/${post._id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Comment</span>
            </Link>
          ) : (
            <button
              onClick={handleComment}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
          )}

          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </article>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Sign in to like, comment, and interact with posts"
      />
    </>
  );
}
