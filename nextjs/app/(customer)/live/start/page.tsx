"use client";

import { useState } from "react";
import { useStartLiveStream } from "@/hooks/useLiveStreams";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function StartLiveStreamPage() {
  const router = useRouter();
  const startStream = useStartLiveStream();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    streamUrl: "",
    thumbnail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.streamUrl.trim()) {
      toast.error("Title and stream URL are required");
      return;
    }

    try {
      const res = await startStream.mutateAsync({
        title: formData.title,
        description: formData.description,
        streamUrl: formData.streamUrl,
        thumbnail: formData.thumbnail,
      });

      toast.success("Live stream started!");
      router.push(`/live/${res.stream._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start stream");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/live" className="p-2 hover:bg-accent rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Go Live</h1>
            <p className="text-sm text-muted-foreground">Start streaming to your audience</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Stream Title *</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What are you streaming about?"
            maxLength={100}
            className="rounded-lg"
          />
          <p className="text-xs text-muted-foreground">{formData.title.length}/100</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell viewers more about your stream..."
            maxLength={500}
            className="resize-none rounded-lg"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">{formData.description.length}/500</p>
        </div>

        {/* Stream URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Stream URL (Embed) *</label>
          <Input
            name="streamUrl"
            value={formData.streamUrl}
            onChange={handleChange}
            placeholder="e.g., https://www.youtube.com/embed/..."
            className="rounded-lg"
          />
          <p className="text-xs text-muted-foreground">
            Use an embeddable stream URL (YouTube Live, Twitch, etc.)
          </p>
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Thumbnail URL</label>
          <Input
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="https://example.com/thumbnail.jpg"
            className="rounded-lg"
          />
          <p className="text-xs text-muted-foreground">Optional: Image URL for stream preview</p>
        </div>

        {/* Preview */}
        {formData.thumbnail && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <img
              src={formData.thumbnail}
              alt="Thumbnail preview"
              className="w-full h-40 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Link href="/live" className="flex-1">
            <Button variant="outline" className="w-full rounded-lg">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={startStream.isPending}
            className="flex-1 bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white rounded-lg"
          >
            {startStream.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Go Live
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-blue-600">💡 Tips for streaming:</p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
          <li>Use a clear, descriptive title</li>
          <li>Add a thumbnail to attract viewers</li>
          <li>Engage with your audience in the live chat</li>
          <li>Keep your stream URL valid and accessible</li>
        </ul>
      </div>
    </div>
  );
}
