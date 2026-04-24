"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStories, useCreateStory, useViewStory, useDeleteStory } from "@/hooks/useStories";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Story, StoryGroup } from "@/types";
import { UPLOADS_URL } from "@/lib/constants";
import {
  Plus, ChevronLeft, ChevronRight, X, Trash2,
  ImagePlus, Type, Loader2, ChevronLeftIcon, ChevronRightIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const BG_COLORS = [
  "#1877f2", "#e41e3f", "#00c853", "#ff6d00",
  "#aa00ff", "#00bcd4", "#f50057", "#1de9b6",
];

const STORY_GRADIENTS = [
  "from-pink-500 via-red-500 to-yellow-500",
  "from-purple-500 via-blue-500 to-cyan-400",
  "from-green-400 via-emerald-500 to-teal-500",
  "from-orange-400 via-pink-500 to-purple-500",
  "from-blue-500 via-indigo-500 to-violet-500",
  "from-rose-400 via-fuchsia-500 to-indigo-500",
  "from-amber-400 via-orange-500 to-red-500",
  "from-cyan-400 via-blue-500 to-purple-600",
];

// ─── Story Viewer Modal ───────────────────────────────────
function StoryViewer({
  groups,
  startGroupIndex,
  onClose,
}: {
  groups: StoryGroup[];
  startGroupIndex: number;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();
  const [groupIdx, setGroupIdx] = useState(startGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];

  if (!story) { onClose(); return null; }

  const getUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  const goNext = () => {
    viewStory.mutate(story._id);
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(storyIdx + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(groupIdx + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIdx > 0) {
      setStoryIdx(storyIdx - 1);
    } else if (groupIdx > 0) {
      setGroupIdx(groupIdx - 1);
      setStoryIdx(groups[groupIdx - 1].stories.length - 1);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStory.mutateAsync(story._id);
      toast.success("Story deleted");
      goNext();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div
        className="relative w-full max-w-sm h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: story.backgroundColor || "#1877f2" }}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className={`h-full bg-white rounded-full transition-all duration-300 ${i < storyIdx ? "w-full" : i === storyIdx ? "w-1/2" : "w-0"}`}
              />
            </div>
          ))}
        </div>

        {/* Author */}
        <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <UserAvatar src={story.author.avatar} fallback={story.author.fullName} className="h-9 w-9 ring-2 ring-white" />
            <div>
              <p className="text-white text-sm font-semibold drop-shadow">{story.author.fullName}</p>
              <p className="text-white/70 text-xs">
                {Math.round((new Date(story.expiresAt).getTime() - Date.now()) / 3600000)}h left
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?._id === story.author._id && (
              <button onClick={handleDelete} className="text-white/80 hover:text-white p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Story content */}
        {story.image ? (
          <img src={getUrl(story.image)} alt="story" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <p className="text-white text-2xl font-bold text-center leading-relaxed">{story.text}</p>
          </div>
        )}

        {/* Text overlay on image */}
        {story.image && story.text && (
          <div className="absolute bottom-16 left-4 right-4">
            <p className="text-white text-lg font-semibold text-center drop-shadow-lg bg-black/30 rounded-xl px-3 py-2">
              {story.text}
            </p>
          </div>
        )}

        {/* Nav areas */}
        <button onClick={goPrev} className="absolute left-0 top-0 w-1/3 h-full z-10" />
        <button onClick={goNext} className="absolute right-0 top-0 w-1/3 h-full z-10" />

        {/* Arrow hints */}
        {(storyIdx > 0 || groupIdx > 0) && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <ChevronLeftIcon className="h-8 w-8 text-white/60" />
          </div>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <ChevronRightIcon className="h-8 w-8 text-white/60" />
        </div>
      </div>
    </div>
  );
}

// ─── Create Story Modal ───────────────────────────────────
function CreateStoryModal({ onClose }: { onClose: () => void }) {
  const createStory = useCreateStory();
  const [mode, setMode] = useState<"pick" | "image" | "text">("pick");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMode("image");
    }
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    if (imageFile) fd.append("image", imageFile);
    if (text.trim()) fd.append("text", text.trim());
    fd.append("backgroundColor", bgColor);

    try {
      await createStory.mutateAsync(fd);
      toast.success("Story posted!");
      onClose();
    } catch {
      toast.error("Failed to create story");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-bold text-lg">Create Story</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "pick" && (
          <div className="p-4 space-y-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-accent/60 hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <ImagePlus className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Photo story</p>
                <p className="text-xs text-muted-foreground">Share a photo</p>
              </div>
            </button>
            <button
              onClick={() => setMode("text")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-accent/60 hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Type className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Text story</p>
                <p className="text-xs text-muted-foreground">Share a thought</p>
              </div>
            </button>
          </div>
        )}

        {mode === "image" && imagePreview && (
          <div className="p-4 space-y-3">
            <div className="relative rounded-xl overflow-hidden h-64">
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add text to your story..."
              maxLength={200}
              rows={2}
              className="w-full rounded-xl bg-accent/60 px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <div className="flex gap-2">
              <button onClick={() => { setMode("pick"); setImageFile(null); setImagePreview(null); }} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={createStory.isPending}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {createStory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share Story"}
              </button>
            </div>
          </div>
        )}

        {mode === "text" && (
          <div className="p-4 space-y-3">
            <div
              className="h-48 rounded-xl flex items-center justify-center p-4 transition-colors"
              style={{ backgroundColor: bgColor }}
            >
              <p className="text-white text-xl font-bold text-center break-words">
                {text || "Your text here..."}
              </p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={200}
              rows={2}
              className="w-full rounded-xl bg-accent/60 px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {BG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${bgColor === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("pick")} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={createStory.isPending || !text.trim()}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createStory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share Story"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main StoriesRow ──────────────────────────────────────
export function StoriesRow() {
  const { user } = useAuth();
  const { data } = useStories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewerGroup, setViewerGroup] = useState<number | null>(null);

  const groups = data?.storyGroups ?? [];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  if (!user) return null;

  return (
    <>
      <div className="relative bg-card rounded-xl border border-border p-4">
        {showLeftArrow && (
          <button onClick={() => scroll("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {showRightArrow && groups.length > 3 && (
          <button onClick={() => scroll("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* Create Story */}
          <div
            onClick={() => setShowCreate(true)}
            className="shrink-0 w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="h-[65%] relative overflow-hidden">
              <UserAvatar src={user.avatar} fallback={user.fullName} className="absolute inset-0 h-full w-full rounded-none object-cover" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            </div>
            <div className="h-[35%] bg-card flex flex-col items-center justify-end pb-3 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-blue-500 border-4 border-card flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-center mt-1">Create story</span>
            </div>
          </div>

          {/* Story groups */}
          {groups.map((group, idx) => {
            const latest = group.stories[0];
            const getUrl = (p: string) => p?.startsWith("http") ? p : `${UPLOADS_URL}${p}`;
            return (
              <div
                key={group.author._id}
                onClick={() => setViewerGroup(idx)}
                className="shrink-0 w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Background */}
                {latest.image ? (
                  <img src={getUrl(latest.image)} alt="story" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-3" style={{ backgroundColor: latest.backgroundColor }}>
                    <p className="text-white text-xs font-semibold text-center line-clamp-4">{latest.text}</p>
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                {/* Avatar ring — blue if unviewed */}
                <div className="absolute top-3 left-3">
                  <div className={`p-[2.5px] rounded-full ${group.hasUnviewed ? `bg-linear-to-tr ${STORY_GRADIENTS[idx % STORY_GRADIENTS.length]}` : "bg-gray-400"}`}>
                    <div className="p-[2px] rounded-full bg-card">
                      <UserAvatar src={group.author.avatar} fallback={group.author.fullName} className="h-9 w-9" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-semibold truncate drop-shadow-lg">
                    {group.author.fullName.split(" ")[0]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && <CreateStoryModal onClose={() => setShowCreate(false)} />}
      {viewerGroup !== null && (
        <StoryViewer
          groups={groups}
          startGroupIndex={viewerGroup}
          onClose={() => setViewerGroup(null)}
        />
      )}
    </>
  );
}
