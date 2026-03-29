"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FEELINGS } from "@/types";
import { ImagePlus, X, Loader2, Video, Smile } from "lucide-react";
import toast from "react-hot-toast";

export function CreatePost() {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showFeelings, setShowFeelings] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setIsVideo(file.type.startsWith("video/"));
      setExpanded(true);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    setIsVideo(false);
    if (fileRef.current) fileRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);
      if (selectedFeeling) {
        formData.append("feeling", `${selectedFeeling.emoji} ${selectedFeeling.label}`);
      }
      await createPost.mutateAsync(formData);
      setContent("");
      setSelectedFeeling(null);
      removeImage();
      setExpanded(false);
      toast.success("Post created!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create post");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-3 pb-0">
        <div className="flex items-center gap-3">
          <UserAvatar src={user.avatar} fallback={user.fullName} className="h-10 w-10 shrink-0" />
          <button
            onClick={() => setExpanded(true)}
            className={`flex-1 h-10 rounded-full bg-accent/80 hover:bg-accent px-4 text-left text-sm transition-colors ${expanded ? "hidden" : ""}`}
          >
            <span className="text-muted-foreground">
              What&apos;s on your mind, {user.fullName.split(" ")[0]}?
            </span>
          </button>

          {expanded && (
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">
                {user.fullName}
                {selectedFeeling && (
                  <span> is {selectedFeeling.emoji} feeling {selectedFeeling.label}</span>
                )}
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind, ${user.fullName.split(" ")[0]}?`}
                className="min-h-[80px] border-0 resize-none bg-transparent text-base focus-visible:ring-0 p-0"
                maxLength={500}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Feelings picker */}
        {showFeelings && (
          <div className="mt-3 p-3 bg-accent/40 rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-2">How are you feeling?</p>
            <div className="grid grid-cols-4 gap-2">
              {FEELINGS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => {
                    setSelectedFeeling(f);
                    setShowFeelings(false);
                    setExpanded(true);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors text-xs ${
                    selectedFeeling?.label === f.label ? "bg-blue-500/10 text-blue-500" : ""
                  }`}
                >
                  <span className="text-xl">{f.emoji}</span>
                  <span className="truncate w-full text-center">{f.label}</span>
                </button>
              ))}
            </div>
            {selectedFeeling && (
              <button
                onClick={() => setSelectedFeeling(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-destructive"
              >
                Remove feeling
              </button>
            )}
          </div>
        )}

        {/* Image preview */}
        {preview && (
          <div className="relative mt-3 rounded-xl overflow-hidden border border-border">
            {isVideo ? (
              <video
                src={preview}
                controls
                className="w-full max-h-64 rounded-xl bg-black"
              />
            ) : (
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
            )}
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {expanded && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{content.length}/500</span>
            <Button
              onClick={handleSubmit}
              disabled={createPost.isPending || (!content.trim() && !image)}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-6"
              size="sm"
            >
              {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-border mx-3 mt-3" />

      <div className="flex items-center px-2 py-1">
        <button onClick={() => { toast("Live video coming soon! 🎥"); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-accent transition-colors">
          <Video className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Live video</span>
        </button>

        <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleImageSelect} className="hidden" />
        <input ref={videoRef} type="file" accept="video/*" onChange={handleImageSelect} className="hidden" />
        <button
          onClick={() => { fileRef.current?.click(); }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ImagePlus className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Photo/video</span>
        </button>

        <button
          onClick={() => { setShowFeelings(!showFeelings); setExpanded(true); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-accent transition-colors ${selectedFeeling ? "text-yellow-500" : ""}`}
        >
          <Smile className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            {selectedFeeling ? `${selectedFeeling.emoji} ${selectedFeeling.label}` : "Feeling"}
          </span>
        </button>
      </div>
    </div>
  );
}
