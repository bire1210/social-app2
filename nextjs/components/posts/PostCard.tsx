"use client";

import { useState } from "react";
import { Post, Comment } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToggleLike, useDeletePost, useEditPost } from "@/hooks/usePosts";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UPLOADS_URL } from "@/lib/constants";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  ThumbsUp,
  Globe,
  Pencil,
  Loader2,
  Send,
  Link as LinkIcon,
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
  const editPost = useEditPost();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const [isLiked, setIsLiked] = useState(
    user ? post.likes.includes(user._id) : false
  );
  const [likesCount, setLikesCount] = useState(
    post.likesCount || post.likes.length
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

  const handleLike = async () => {
    if (!user) { setShowAuthPrompt(true); return; }
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

  return (
    <>
      <article className="bg-card rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4">
          <Link href={`/profile/${post.author._id}`} className="flex items-center gap-3 group">
            <UserAvatar src={post.author.avatar} fallback={post.author.fullName} className="h-10 w-10" />
            <div>
              <p className="font-semibold text-sm group-hover:underline">{post.author.fullName}</p>
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
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
              isLiked ? "text-blue-500" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <ThumbsUp className={`h-5 w-5 transition-all duration-200 ${isLiked ? "fill-blue-500 text-blue-500" : ""}`} />
            <span className="text-sm font-medium">Like</span>
          </button>

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
            {/* Add comment */}
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

            {/* Comments list */}
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
        message="Sign in to like, comment, and interact with posts"
      />
    </>
  );
}
