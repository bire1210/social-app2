"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSuggestedUsers, useToggleFollow } from "@/hooks/useUsers";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Search, Gift, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { User } from "@/types";
import toast from "react-hot-toast";

function SuggestedUserCard({ suggestedUser }: { suggestedUser: User }) {
  const toggleFollow = useToggleFollow();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    try {
      const res = await toggleFollow.mutateAsync(suggestedUser._id);
      setIsFollowing(res.isFollowing);
    } catch {
      toast.error("Failed to follow user");
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/60 transition-colors group">
      <Link href={`/profile/${suggestedUser._id}`}>
        <UserAvatar
          src={suggestedUser.avatar}
          fallback={suggestedUser.fullName}
          className="h-9 w-9"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${suggestedUser._id}`}
          className="text-sm font-semibold truncate block hover:underline"
        >
          {suggestedUser.fullName}
        </Link>
        <p className="text-xs text-muted-foreground truncate">
          @{suggestedUser.username}
        </p>
      </div>
      <Button
        onClick={handleFollow}
        disabled={toggleFollow.isPending}
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        className={`text-xs h-8 rounded-lg ${
          isFollowing
            ? ""
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
}

export function RightSidebar() {
  const { user } = useAuth();
  const { data, isLoading } = useSuggestedUsers();
  const suggestedUsers = data?.users ?? [];

  if (!user) return null;

  return (
    <aside className="sticky top-[72px] h-fit space-y-4 pb-6">
      {/* Sponsored / Ad placeholder */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground font-semibold text-sm px-2">
          Sponsored
        </h3>
        <div className="rounded-xl overflow-hidden bg-accent/40 hover:bg-accent/60 transition-colors cursor-pointer p-3">
          <div className="flex items-center gap-3">
            <div className="h-[100px] w-[100px] rounded-lg bg-linear-to-br from-blue-400 to-purple-500 shrink-0 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">B+</span>
            </div>
            <div>
              <p className="text-sm font-semibold">BireSocial Premium</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unlock exclusive features and badges
              </p>
              <p className="text-xs text-blue-500 mt-1">biresocial.app</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Suggested Users */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-muted-foreground font-semibold text-sm">
            Suggested for you
          </h3>
          <Link
            href="/explore"
            className="text-xs text-blue-500 hover:text-blue-600 font-medium"
          >
            See All
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-accent" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 bg-accent rounded" />
                  <div className="h-2 w-16 bg-accent rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          suggestedUsers.slice(0, 5).map((u) => (
            <SuggestedUserCard key={u._id} suggestedUser={u} />
          ))
        )}
      </div>

      <div className="border-t border-border" />

      {/* Birthdays - Static placeholder */}
      <div className="space-y-2 px-2">
        <h3 className="text-muted-foreground font-semibold text-sm">
          Birthdays
        </h3>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-linear-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
            <Gift className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm">
            <span className="font-semibold">No birthdays</span>{" "}
            <span className="text-muted-foreground">today</span>
          </p>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Contacts */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-muted-foreground font-semibold text-sm">
            Contacts
          </h3>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Show following users as contacts */}
        {suggestedUsers.slice(0, 8).map((contact) => (
          <Link
            key={contact._id}
            href={`/profile/${contact._id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/60 transition-colors"
          >
            <div className="relative">
              <UserAvatar
                src={contact.avatar}
                fallback={contact.fullName}
                className="h-8 w-8"
              />
              {/* Random online indicator */}
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
            </div>
            <span className="text-sm font-medium">{contact.fullName}</span>
          </Link>
        ))}
      </div>

      {/* Footer links */}
      <div className="px-2 pt-2">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Privacy · Terms · Advertising · Cookies · More · BireSocial © 2026
        </p>
      </div>
    </aside>
  );
}
