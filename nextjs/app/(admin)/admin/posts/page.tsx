"use client";

import { useAdminPosts, useAdminDeletePost } from "@/hooks/useAdmin";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function AdminPostsPage() {
  const { data, isLoading } = useAdminPosts();
  const deletePost = useAdminDeletePost();

  const posts = data?.posts ?? [];

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post and all its comments?")) return;
    try {
      await deletePost.mutateAsync(postId);
      toast.success("Post deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate all posts ({posts.length})
        </p>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post._id} className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <UserAvatar
                    src={post.author.avatar}
                    fallback={post.author.fullName}
                    className="h-9 w-9 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {post.author.fullName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        @{post.author.username}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>❤️ {post.likes.length} likes</span>
                      <span>
                        💬{" "}
                        {Array.isArray(post.comments)
                          ? post.comments.length
                          : 0}{" "}
                        comments
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post._id)}
                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
