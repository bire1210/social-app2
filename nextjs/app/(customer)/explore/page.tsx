"use client";

import { useState, useEffect } from "react";
import { useExplorePosts } from "@/hooks/usePosts";
import { useSearchUsers } from "@/hooks/useUsers";
import { PostCard } from "@/components/posts/PostCard";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const { data: postsData, isLoading } = useExplorePosts();
  const { data: usersData, isFetching: searching, error: searchError } = useSearchUsers(searchQuery);

  // Sync with URL query param changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const posts = postsData?.posts ?? [];
  const users = usersData?.users ?? [];

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover new people and posts
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-10 rounded-xl bg-accent/50 border-0 focus-visible:ring-1 focus-visible:ring-red-500"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Search error */}
      {searchError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          Failed to search users. Please try again.
        </div>
      )}

      {/* Search results */}
      {searchQuery && users.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              {users.length} user{users.length !== 1 ? "s" : ""} found
            </h3>
          </div>
          {users.map((u) => (
            <Link
              key={u._id}
              href={`/profile/${u._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <UserAvatar
                src={u.avatar}
                fallback={u.fullName}
                className="h-10 w-10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{u.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No search results */}
      {searchQuery && users.length === 0 && !searching && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">No users found for "{searchQuery}"</p>
        </div>
      )}

      {/* Posts */}
      {!searchQuery && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Trending Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts to explore yet
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
