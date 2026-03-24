"use client";

import { useState } from "react";
import { useExplorePosts } from "@/hooks/usePosts";
import { useSearchUsers } from "@/hooks/useUsers";
import { PostCard } from "@/components/posts/PostCard";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: postsData, isLoading } = useExplorePosts();
  const { data: usersData, isFetching: searching } = useSearchUsers(searchQuery);

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
          className="pl-10 rounded-xl bg-accent/50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
        />
      </div>

      {/* Search results */}
      {users.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Users</h3>
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
              <div>
                <p className="font-medium text-sm">{u.fullName}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
