"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/usePosts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function CreatePost() {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
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
      toast.success("Post created!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create post");
    }
  };

  if (!user) return null;

  return (
    <div className="border border-border rounded-2xl p-4 bg-card">
      <div className="flex gap-3">
        <UserAvatar
          src={user.avatar}
          fallback={user.fullName}
          className="h-10 w-10"
        />
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[80px] border-0 resize-none bg-transparent text-base focus-visible:ring-0 p-0"
            maxLength={500}
          />

          {/* Image preview */}
          {preview && (
            <div className="relative mt-3 rounded-xl overflow-hidden max-h-64">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="text-muted-foreground hover:text-blue-500"
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {content.length}/500
              </span>
              <Button
                onClick={handleSubmit}
                disabled={createPost.isPending || (!content.trim() && !image)}
                className="rounded-full bg-linear-to-r from-blue-500 to-blue-500 hover:from-blue-500 hover:to-blue-500 text-white px-6"
                size="sm"
              >
                {createPost.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
