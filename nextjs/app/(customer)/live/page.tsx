"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveStreams, useStartLiveStream, useEndLiveStream } from "@/hooks/useLiveStreams";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, MessageCircle, Users, Loader2, Video, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function LivePage() {
  const { user } = useAuth();
  const { data, isLoading } = useLiveStreams();
  const startLiveStream = useStartLiveStream();
  const endLiveStream = useEndLiveStream();

  const [showStartModal, setShowStartModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [myStream, setMyStream] = useState<any>(null);

  const streams = data?.streams ?? [];
  const userStream = streams.find((s) => s.streamer._id === user?._id && s.isLive);

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const res = await startLiveStream.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setMyStream(res.stream);
      setForm({ title: "", description: "" });
      setShowStartModal(false);
      toast.success("Live stream started!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start stream");
    }
  };

  const handleEndStream = async () => {
    if (!myStream) return;
    try {
      await endLiveStream.mutateAsync(myStream._id);
      setMyStream(null);
      toast.success("Live stream ended");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to end stream");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Streams</h1>
          <p className="text-muted-foreground mt-1">Watch and interact with live streams</p>
        </div>
        {user && (
          <Button
            onClick={() => setShowStartModal(true)}
            className="bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white rounded-full px-6"
          >
            <Video className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        )}
      </div>

      {/* My Stream */}
      {myStream && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-lg font-bold">{myStream.title}</h2>
              </div>
              <Button
                onClick={handleEndStream}
                variant="destructive"
                size="sm"
                className="rounded-lg"
              >
                End Stream
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-500">{myStream.viewerCount}</p>
                <p className="text-xs text-muted-foreground">Viewers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{myStream.likes.length}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{myStream.comments.length}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.filter((s) => s.isLive).length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No live streams right now</p>
          </div>
        ) : (
          streams
            .filter((s) => s.isLive)
            .map((stream) => (
              <Link key={stream._id} href={`/live/${stream._id}`}>
                <Card className="border-border/50 bg-card/50 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-black rounded-t-lg overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 flex items-end p-3">
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-white text-xs font-bold">LIVE</span>
                          <span className="text-white/60 text-xs ml-auto">
                            {stream.viewerCount} watching
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-2">{stream.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {stream.description || "No description"}
                        </p>
                      </div>

                      {/* Streamer */}
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={stream.streamer.avatar}
                          fallback={stream.streamer.fullName}
                          className="h-8 w-8"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {stream.streamer.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(stream.startedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {stream.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {stream.comments.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {stream.viewerCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
        )}
      </div>

      {/* Start Stream Modal */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a Live Stream</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStartStream} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What are you streaming?"
                maxLength={100}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell viewers what to expect..."
                maxLength={500}
                rows={3}
                className="rounded-lg resize-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStartModal(false)}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={startLiveStream.isPending}
                className="flex-1 bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white rounded-lg"
              >
                {startLiveStream.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Go Live
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
