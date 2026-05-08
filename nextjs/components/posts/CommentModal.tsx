"use client";

import { useState } from "react";
import { Post, Comment } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

export function CommentModal({ open, onOpenChange, post }: CommentModalProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const { data: commentsData, isLoading: commentsLoading } = useComments(
    open ? post._id : ""
  );
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const comments = commentsData?.comments ?? [];

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to comment!
              </p>
            </div>
          ) : (
            comments.map((comment: Comment) => (
              <div key={comment._id} className="flex items-start gap-2 group">
                <Link href={`/profile/${comment.author._id}`}>
                  <UserAvatar
                    src={comment.author.avatar}
                    fallback={comment.author.fullName}
                    className="h-8 w-8 shrink-0"
                  />
                </Link>
                <div className="flex-1">
                  <div className="bg-accent/60 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <Link
                      href={`/profile/${comment.author._id}`}
                      className="text-xs font-semibold hover:underline"
                    >
                      {comment.author.fullName}
                    </Link>
                    <p className="text-sm mt-0.5">{comment.content}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
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
            ))
          )}
        </div>

        {/* Comment Input */}
        {user && (
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-4 border-t border-border">
            <UserAvatar
              src={user.avatar}
              fallback={user.fullName}
              className="h-8 w-8 shrink-0"
            />
            <div className="flex-1 relative">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full h-9 rounded-full bg-accent/80 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-red-500/30"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addComment.isPending}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 disabled:text-muted-foreground"
              >
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
