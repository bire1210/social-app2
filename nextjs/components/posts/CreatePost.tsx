"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X, Loader2, Video, Smile } from "lucide-react";
import toast from "react-hot-toast";

export function CreatePost() {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setExpanded(true);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      await createPost.mutateAsync(formData);
      setContent("");
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
      {/* Top section — Avatar + Input */}
      <div className="p-3 pb-0">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={user.avatar}
            fallback={user.fullName}
            className="h-10 w-10 shrink-0"
          />
          <button
            onClick={() => setExpanded(true)}
            className={`flex-1 h-10 rounded-full bg-accent/80 hover:bg-accent px-4 text-left text-sm transition-colors ${
              expanded ? "hidden" : ""
            }`}
          >
            <span className="text-muted-foreground">
              What&apos;s on your mind, {user.fullName.split(" ")[0]}?
            </span>
          </button>

          {expanded && (
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind, ${
                  user.fullName.split(" ")[0]
                }?`}
                className="min-h-[80px] border-0 resize-none bg-transparent text-base focus-visible:ring-0 p-0"
                maxLength={500}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Image preview */}
        {preview && (
          <div className="relative mt-3 rounded-xl overflow-hidden border border-border">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-xl"
            />
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
            <span className="text-xs text-muted-foreground">
              {content.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              disabled={createPost.isPending || (!content.trim() && !image)}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-6"
              size="sm"
            >
              {createPost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border mx-3 mt-3" />

      {/* Bottom action buttons — Facebook style */}
      <div className="flex items-center px-2 py-1">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-accent transition-colors">
          <Video className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Live video
          </span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ImagePlus className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Photo/video
          </span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-accent transition-colors">
          <Smile className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Feeling
          </span>
        </button>
      </div>
    </div>
  );
}
