"use client";

import { useState } from "react";
import { Post } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToggleLike, useDeletePost } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { UPLOADS_URL } from "@/lib/constants";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
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

  const [isLiked, setIsLiked] = useState(
    user ? post.likes.includes(user._id) : false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes.length);

  const handleLike = async () => {
    if (toggleLike.isPending) return;
    try {
      const res = await toggleLike.mutateAsync(post._id);
      setIsLiked(res.isLiked);
      setLikesCount((prev) => (res.isLiked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Failed to like post");
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

  return (
    <article className="border border-border rounded-2xl p-4 bg-card hover:bg-accent/30 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
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
            <p className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
              {post.author.fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              @{post.author.username} ·{" "}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </Link>

        {user && user._id === post.author._id && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
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

      {/* Content */}
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Image */}
      {post.image && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img
            src={getImageUrl(post.image)}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
            isLiked
              ? "text-rose-500"
              : "text-muted-foreground hover:text-rose-500"
          }`}
        >
          <Heart
            className={`h-[18px] w-[18px] transition-all duration-200 ${
              isLiked ? "fill-rose-500 scale-110" : ""
            }`}
          />
          <span>{likesCount}</span>
        </button>

        <Link
          href={`/post/${post._id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span>{post.commentsCount || (Array.isArray(post.comments) ? post.comments.length : 0)}</span>
        </Link>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-400 transition-colors">
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}
