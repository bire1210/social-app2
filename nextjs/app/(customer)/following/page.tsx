"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useToggleFollow } from "@/hooks/useUsers";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { User } from "@/types";
import { UserCheck, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function FollowingCard({ followingUser }: { followingUser: User }) {
  const { user } = useAuth();
  const toggleFollow = useToggleFollow();
  const [isFollowing, setIsFollowing] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleUnfollow = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    try {
      const res = await toggleFollow.mutateAsync(followingUser._id);
      setIsFollowing(res.isFollowing);
      toast.success(res.isFollowing ? `Following ${followingUser.fullName}` : `Unfollowed ${followingUser.fullName}`);
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover / gradient header */}
        <div className="h-20 bg-linear-to-br from-blue-400/30 to-purple-400/30 relative">
          {followingUser.coverImage && (
            <img src={followingUser.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-4 pb-4 -mt-8">
          <Link href={`/profile/${followingUser._id}`}>
            <UserAvatar
              src={followingUser.avatar}
              fallback={followingUser.fullName}
              className="h-16 w-16 border-4 border-card"
            />
          </Link>

          <div className="mt-2">
            <Link href={`/profile/${followingUser._id}`} className="font-semibold text-sm hover:underline block truncate">
              {followingUser.fullName}
            </Link>
            <p className="text-xs text-muted-foreground truncate">@{followingUser.username}</p>
            {followingUser.bio && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{followingUser.bio}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {followingUser.followersCount ?? 0} followers
            </p>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleUnfollow}
              disabled={toggleFollow.isPending}
              size="sm"
              className="flex-1 rounded-lg text-xs bg-accent text-foreground hover:bg-accent/80"
            >
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              Following
            </Button>
            <Link href={`/profile/${followingUser._id}`} className="flex-1">
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
        message="Sign in to manage your following list"
      />
    </>
  );
}

export default function FollowingPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { data: profileData, isLoading } = useProfile(currentUser?._id || "");

  const following = profileData?.user?.following ?? [];

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Following</h1>
          <p className="text-sm text-muted-foreground">{following.length} following</p>
        </div>
      </div>

      {following.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">You're not following anyone yet. Explore and find people to follow!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {following.map((followingUser) => (
            <FollowingCard key={followingUser._id} followingUser={followingUser} />
          ))}
        </div>
      )}
    </div>
  );
}
