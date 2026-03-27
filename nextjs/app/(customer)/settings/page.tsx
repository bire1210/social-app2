"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useUsers";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Loader2, Moon, Sun, Camera, ImagePlus } from "lucide-react";
import { UPLOADS_URL } from "@/lib/constants";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const updateProfile = useUpdateProfile();
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    website: user?.website || "",
    location: user?.location || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append("avatar", avatarFile);
      if (coverFile) formData.append("coverImage", coverFile);

      await updateProfile.mutateAsync(formData);
      setAvatarFile(null);
      setCoverFile(null);
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-semibold">Profile</h2>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Photo</Label>
          <div
            className="relative h-32 rounded-xl overflow-hidden bg-accent/50 cursor-pointer group"
            onClick={() => coverRef.current?.click()}
          >
            {(coverPreview || user.coverImage) ? (
              <img
                src={coverPreview || getImageUrl(user.coverImage)}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => avatarRef.current?.click()}>
              <UserAvatar
                src={avatarPreview || user.avatar}
                fallback={user.fullName}
                className="h-16 w-16"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => avatarRef.current?.click()} className="rounded-xl">
              Change photo
            </Button>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={160}
            className="rounded-xl resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">{form.bio.length}/160</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8"
        >
          {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </form>

      <Separator />

      {/* Appearance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="flex items-center gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="rounded-xl"
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="rounded-xl"
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
        </div>
      </div>
    </div>
  );
}
