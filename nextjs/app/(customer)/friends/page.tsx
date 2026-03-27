"use client";

import { useState } from "react";
import { useSuggestedUsers, useToggleFollow } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { User } from "@/types";
import { UserPlus, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function PersonCard({ person }: { person: User }) {
  const { user } = useAuth();
  const toggleFollow = useToggleFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleFollow = async () => {
    if (!user) { setShowAuthPrompt(true); return; }
    try {
      const res = await toggleFollow.mutateAsync(person._id);
      setIsFollowing(res.isFollowing);
      toast.success(res.isFollowing ? `Following ${person.fullName}` : `Unfollowed ${person.fullName}`);
    } catch {
      toast.error("Failed to follow");
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover / gradient header */}
        <div className="h-20 bg-linear-to-br from-blue-400/30 to-purple-400/30 relative">
          {person.coverImage && (
            <img src={person.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-4 pb-4 -mt-8">
          <Link href={`/profile/${person._id}`}>
            <UserAvatar
              src={person.avatar}
              fallback={person.fullName}
              className="h-16 w-16 border-4 border-card"
            />
          </Link>

          <div className="mt-2">
            <Link href={`/profile/${person._id}`} className="font-semibold text-sm hover:underline block truncate">
              {person.fullName}
            </Link>
            <p className="text-xs text-muted-foreground truncate">@{person.username}</p>
            {person.bio && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{person.bio}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {person.followersCount ?? 0} followers
            </p>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleFollow}
              disabled={toggleFollow.isPending}
              size="sm"
              className={`flex-1 rounded-lg text-xs ${
                isFollowing
                  ? "bg-accent text-foreground hover:bg-accent/80"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isFollowing ? (
                <><UserCheck className="h-3.5 w-3.5 mr-1" />Following</>
              ) : (
                <><UserPlus className="h-3.5 w-3.5 mr-1" />Add Friend</>
              )}
            </Button>
            <Link href={`/profile/${person._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Sign in to follow people and build your network"
      />
    </>
  );
}

export default function FriendsPage() {
  const { data, isLoading } = useSuggestedUsers();
  const people = data?.users ?? [];

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">People You May Know</h1>
          <p className="text-sm text-muted-foreground">Discover and connect with new people</p>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No suggestions right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {people.map((person) => (
            <PersonCard key={person._id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
