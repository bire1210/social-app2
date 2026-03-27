"use client";

import { useState, useRef } from "react";
import { Post, Comment, ReactionType, REACTIONS } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useReactToPost, useDeletePost, useEditPost } from "@/hooks/usePosts";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { ReactionPicker } from "@/components/posts/ReactionPicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UPLOADS_URL } from "@/lib/constants";
import {
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  ThumbsUp,
  Globe,
  Pencil,
  Loader2,
  Send,
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

const REACTION_META: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: "👍", label: "Like", color: "text-blue-500" },
  love: { emoji: "❤️", label: "Love", color: "text-red-500" },
  haha: { emoji: "😂", label: "Haha", color: "text-yellow-500" },
  wow: { emoji: "😮", label: "Wow", color: "text-yellow-500" },
  sad: { emoji: "😢", label: "Sad", color: "text-yellow-500" },
  angry: { emoji: "😡", label: "Angry", color: "text-orange-500" },
};

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const reactToPost = useReactToPost();
  const deletePost = useDeletePost();
  const editPost = useEditPost();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    (post.userReaction as ReactionType) ?? null
  );
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    post.reactionCounts ?? {}
  );
  const [totalReactions, setTotalReactions] = useState(
    post.reactions?.length ?? post.likesCount ?? 0
  );

  const { data: commentsData, isLoading: commentsLoading } = useComments(
    showComments ? post._id : ""
  );
  const comments = commentsData?.comments ?? [];

  const commentsCount =
    post.commentsCount ||
    (Array.isArray(post.comments) ? post.comments.length : 0);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  const handleReact = async (type: ReactionType) => {
    if (!user) { setShowAuthPrompt(true); return; }
    setShowReactionPicker(false);
    if (reactToPost.isPending) return;

    // Optimistic update
    const prev = userReaction;
    const prevCounts = { ...reactionCounts };
    const prevTotal = totalReactions;

    if (prev === type) {
      setUserReaction(null);
      setReactionCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] ?? 0) - 1) }));
      setTotalReactions((t) => Math.max(0, t - 1));
    } else {
      if (prev) {
        setReactionCounts((c) => ({ ...c, [prev]: Math.max(0, (c[prev] ?? 0) - 1) }));
      } else {
        setTotalReactions((t) => t + 1);
      }
      setUserReaction(type);
      setReactionCounts((c) => ({ ...c, [type]: (c[type] ?? 0) + 1 }));
    }

    try {
      const res = await reactToPost.mutateAsync({ id: post._id, type });
      setUserReaction(res.userReaction as ReactionType | null);
      setReactionCounts(res.reactionCounts);
      setTotalReactions(res.totalReactions);
    } catch {
      setUserReaction(prev);
      setReactionCounts(prevCounts);
      setTotalReactions(prevTotal);
      toast.error("Failed to react");
    }
  };

  const handleLikeClick = () => {
    if (!user) { setShowAuthPrompt(true); return; }
    handleReact(userReaction === "like" ? "like" : "like");
  };

  const handleComment = () => {
    if (!user) { setShowAuthPrompt(true); return; }
    setShowComments(true);
    setTimeout(() => document.getElementById(`comment-input-${post._id}`)?.focus(), 100);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post._id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await editPost.mutateAsync({ id: post._id, content: editContent });
      setIsEditing(false);
      toast.success("Post updated");
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ postId: post._id, content: commentText });
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({ id: commentId, postId: post._id });
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  // Top reactions to show in the count row
  const topReactions = REACTIONS.filter((r) => (reactionCounts[r.type] ?? 0) > 0)
    .sort((a, b) => (reactionCounts[b.type] ?? 0) - (reactionCounts[a.type] ?? 0))
    .slice(0, 3);

  const reactionMeta = userReaction ? REACTION_META[userReaction] : null;

  return (
    <>
      <article className="bg-card rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4">
          <Link href={`/profile/${post.author._id}`} className="flex items-center gap-3 group">
            <UserAvatar src={post.author.avatar} fallback={post.author.fullName} className="h-10 w-10" />
            <div>
              <p className="font-semibold text-sm group-hover:underline">
                {post.author.fullName}
                {post.feeling && (
                  <span className="font-normal text-muted-foreground"> is {post.feeling}</span>
                )}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.isEdited && <><span>·</span><span>Edited</span></>}
                <span>·</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </Link>

          {user && user._id === post.author._id && (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              } />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setIsEditing(true); setEditContent(post.content); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="px-4 mt-2">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="resize-none text-sm"
                maxLength={500}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{editContent.length}/500</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleEdit} disabled={editPost.isPending || !editContent.trim()} className="bg-blue-500 hover:bg-blue-600 text-white">
                    {editPost.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          )}
        </div>

        {/* Image */}
        {post.image && (
          <div className="mt-3">
            <img src={getImageUrl(post.image)} alt="Post image" className="w-full max-h-[500px] object-cover" />
          </div>
        )}

        {/* Reaction & comment counts */}
        {(totalReactions > 0 || commentsCount > 0) && (
          <div className="flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {totalReactions > 0 && (
                <>
                  <div className="flex -space-x-1">
                    {topReactions.map((r) => (
                      <div key={r.type} className="h-[18px] w-[18px] rounded-full bg-accent flex items-center justify-center text-[11px]">
                        {r.emoji}
                      </div>
                    ))}
                  </div>
                  <span>{totalReactions}</span>
                </>
              )}
            </div>
            {commentsCount > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {commentsCount} comment{commentsCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border mx-4" />

        {/* Action buttons */}
        <div className="flex items-center px-2 py-1">
          {/* Like with reaction picker on hover */}
          <div
            className="flex-1 relative"
            onMouseEnter={() => {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              hoverTimeout.current = setTimeout(() => setShowReactionPicker(true), 400);
            }}
            onMouseLeave={() => {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              hoverTimeout.current = setTimeout(() => setShowReactionPicker(false), 300);
            }}
          >
            {showReactionPicker && (
              <div className="absolute bottom-full left-0 mb-1 z-20">
                <ReactionPicker onReact={handleReact} />
              </div>
            )}
            <button
              onClick={handleLikeClick}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                reactionMeta ? reactionMeta.color : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {reactionMeta ? (
                <>
                  <span className="text-lg leading-none">{reactionMeta.emoji}</span>
                  <span className="text-sm font-medium">{reactionMeta.label}</span>
                </>
              ) : (
                <>
                  <ThumbsUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Like</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleComment}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="border-t border-border px-4 py-3 space-y-3">
            {user && (
              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <UserAvatar src={user.avatar} fallback={user.fullName} className="h-8 w-8 shrink-0" />
                <div className="flex-1 relative">
                  <input
                    id={`comment-input-${post._id}`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full h-9 rounded-full bg-accent/80 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    maxLength={300}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || addComment.isPending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:text-muted-foreground"
                  >
                    {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            )}

            {commentsLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment: Comment) => (
                  <div key={comment._id} className="flex items-start gap-2 group">
                    <Link href={`/profile/${comment.author._id}`}>
                      <UserAvatar src={comment.author.avatar} fallback={comment.author.fullName} className="h-8 w-8 shrink-0" />
                    </Link>
                    <div className="flex-1">
                      <div className="bg-accent/60 rounded-2xl px-3 py-2 inline-block max-w-full">
                        <Link href={`/profile/${comment.author._id}`} className="text-xs font-semibold hover:underline">
                          {comment.author.fullName}
                        </Link>
                        <p className="text-sm mt-0.5">{comment.content}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {user && user._id === comment.author._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </article>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Sign in to react, comment, and interact with posts"
      />
    </>
  );
}
