"use client";

import { useFeed } from "@/hooks/usePosts";
import { CreatePost } from "@/components/posts/CreatePost";
import { PostCard } from "@/components/posts/PostCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function FeedPage() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed();

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your personalized feed
        </p>
      </div>

      <CreatePost />

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No posts yet. Follow people or create your first post! ✨
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}

        {hasNextPage && posts.length > 0 && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-sm text-blue-500 hover:text-blue-500 transition-colors"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
