"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useToggleFollow } from "@/hooks/useUsers";
import { useUserPosts, useUserLikedPosts } from "@/hooks/usePosts";
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
  MessageCircle,
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
  const { data: likedPostsData } = useUserLikedPosts(userId);
  const followMutation = useToggleFollow();

  const profile = profileData?.user ?? null;
  const posts = postsData?.posts ?? [];
  const likedPosts = likedPostsData?.posts ?? [];
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
        <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-red-500/20 to-yellow-400/20">
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
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className={`rounded-full ${
                    !isFollowing ? "bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white" : ""
                  }`}
                >
                  {isFollowing ? (
                    <><UserMinus className="h-4 w-4 mr-1" />Unfollow</>
                  ) : (
                    <><UserPlus className="h-4 w-4 mr-1" />Follow</>
                  )}
                </Button>
                {currentUser && (
                  <Link href={`/messages?with=${userId}`}>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </Link>
                )}
              </div>
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
                  className="flex items-center gap-1 text-red-500 hover:underline"
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
              <button className="text-sm hover:underline transition-colors">
                <strong>{profile.followingCount}</strong>{" "}
                <span className="text-muted-foreground">Following</span>
              </button>
              <button className="text-sm hover:underline transition-colors">
                <strong>{profile.followersCount}</strong>{" "}
                <span className="text-muted-foreground">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full rounded-xl bg-accent/50">
            <TabsTrigger value="posts" className="flex-1 rounded-lg">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 rounded-lg">
              Liked ({likedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1 rounded-lg">
              Following ({profile?.followingCount || 0})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1 rounded-lg">
              Followers ({profile?.followersCount || 0})
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

          <TabsContent value="liked" className="space-y-4 mt-4">
            {likedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No liked posts yet</p>
              </div>
            ) : (
              likedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4 mt-4">
            {profile?.following && profile.following.length > 0 ? (
              profile.following.map((followee: any) => (
                <div key={followee._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/40 border border-border">
                  <Link href={`/profile/${followee._id}`} className="flex items-center gap-3 flex-1">
                    <UserAvatar src={followee.avatar} fallback={followee.fullName} className="h-10 w-10" />
                    <div>
                      <p className="text-sm font-medium">{followee.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{followee.username}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Not following anyone yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-4 mt-4">
            {profile?.followers && profile.followers.length > 0 ? (
              profile.followers.map((follower: any) => (
                <div key={follower._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/40 border border-border">
                  <Link href={`/profile/${follower._id}`} className="flex items-center gap-3 flex-1">
                    <UserAvatar src={follower.avatar} fallback={follower.fullName} className="h-10 w-10" />
                    <div>
                      <p className="text-sm font-medium">{follower.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{follower.username}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No followers yet</p>
              </div>
            )}
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
