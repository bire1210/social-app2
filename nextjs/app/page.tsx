"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFeed } from "@/hooks/usePosts";
import { CreatePost } from "@/components/posts/CreatePost";
import { PostCard } from "@/components/posts/PostCard";
import { StoriesRow } from "@/components/feed/StoriesRow";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect guests to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // While redirecting or no user, show spinner
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Authenticated user — show full layout with FYP feed
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar — Desktop */}
      <div className="hidden md:block">
        <TopNavbar />
      </div>

      {/* Mobile top + bottom nav */}
      <MobileNav />

      <div className="flex max-w-[1920px] mx-auto">
        {/* Left Sidebar — Desktop */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-screen mt-14 md:mt-14 mb-16 md:mb-0">
          <div className="max-w-[680px] mx-auto px-4 py-4">
            <AuthenticatedFeed />
          </div>
        </main>

        {/* Right Sidebar — Large screens only */}
        <div className="hidden xl:block w-[340px] shrink-0 pr-4 mt-14">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

/* ─── Authenticated Feed (FYP) ─── */
function AuthenticatedFeed() {
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
    <div className="space-y-4">
      {/* Stories */}
      <StoriesRow />

      {/* Create Post */}
      <CreatePost />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground text-lg">
              No posts yet. Follow people or create your first post! ✨
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}

        {hasNextPage && posts.length > 0 && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-sm text-red-500 hover:text-red-600 transition-colors bg-card rounded-xl border border-border font-medium"
          >
            {isFetchingNextPage ? "Loading..." : "Load more posts"}
          </button>
        )}
      </div>
    </div>
  );
}