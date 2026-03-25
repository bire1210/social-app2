"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useToggleFollow } from "@/hooks/useUsers";
import { useUserPosts } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AuthPromptModal } from "@/components/shared/AuthPromptModal";
import { PostCard } from "@/components/posts/PostCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UPLOADS_URL } from "@/lib/constants";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  UserPlus,
  UserMinus,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { data: profileData, isLoading } = useProfile(userId);
  const { data: postsData } = useUserPosts(userId);
  const followMutation = useToggleFollow();

  const profile = profileData?.user ?? null;
  const posts = postsData?.posts ?? [];
  const isOwnProfile = currentUser?._id === userId;
  const isFollowing = profile && currentUser
    ? profile.followers.includes(currentUser._id)
    : false;

  const handleFollow = async () => {
    if (!currentUser) {
      setShowAuthPrompt(true);
      return;
    }
    try {
      const res = await followMutation.mutateAsync(userId);
      toast.success(res.isFollowing ? "Followed!" : "Unfollowed");
    } catch {
      toast.error("Failed to follow/unfollow");
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">User not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative h-40 rounded-2xl overflow-hidden bg-linear-to-r from-blue-500/20 to-blue-500/20">
          {profile.coverImage && (
            <img
              src={getImageUrl(profile.coverImage)}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="relative -mt-12 px-4">
          <div className="flex items-end justify-between">
            <UserAvatar
              src={profile.avatar}
              fallback={profile.fullName}
              className="h-20 w-20 border-4 border-background"
            />

            {isOwnProfile ? (
              <Link href="/settings">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Settings className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={followMutation.isPending}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className={`rounded-full ${
                  !isFollowing
                    ? "bg-linear-to-r from-blue-500 to-blue-500 text-white"
                    : ""
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="mt-3">
            <h1 className="text-xl font-bold">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>

            {profile.bio && (
              <p className="mt-2 text-sm leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {format(new Date(profile.createdAt), "MMM yyyy")}
              </span>
            </div>

            <div className="flex items-center gap-5 mt-3">
              <span className="text-sm">
                <strong>{profile.followingCount}</strong>{" "}
                <span className="text-muted-foreground">Following</span>
              </span>
              <span className="text-sm">
                <strong>{profile.followersCount}</strong>{" "}
                <span className="text-muted-foreground">Followers</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full rounded-xl bg-accent/50">
            <TabsTrigger value="posts" className="flex-1 rounded-lg">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 rounded-lg">
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Liked posts coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Sign in to follow users and build your network"
      />
    </>
  );
}
