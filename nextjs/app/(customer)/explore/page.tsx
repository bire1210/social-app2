"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchUsers } from "@/hooks/useUsers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";
import { Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const { data, isLoading } = useSearchUsers(query);
  const users = data?.users || [];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6" />
          Search Results
        </h1>
        {query && (
          <p className="text-muted-foreground mt-1">
            Showing results for <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-10" />
      ) : query.trim() === "" ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Type something in the search bar to find users.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No users found for "{query}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Link 
              key={user._id} 
              href={`/profile/${user._id}`}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
            >
              <UserAvatar src={user.avatar} fallback={user.fullName} className="h-14 w-14" />
              <div>
                <h3 className="font-semibold text-lg">{user.fullName}</h3>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm mt-1 line-clamp-1">{user.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingSpinner className="mt-20" />}>
      <SearchResults />
    </Suspense>
  );
}
