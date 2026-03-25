"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSuggestedUsers } from "@/hooks/useUsers";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

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

const STORY_BG_COLORS = [
  "bg-linear-to-br from-pink-400 to-rose-600",
  "bg-linear-to-br from-blue-400 to-indigo-600",
  "bg-linear-to-br from-green-400 to-emerald-600",
  "bg-linear-to-br from-purple-400 to-violet-600",
  "bg-linear-to-br from-orange-400 to-amber-600",
  "bg-linear-to-br from-cyan-400 to-teal-600",
  "bg-linear-to-br from-fuchsia-400 to-pink-600",
  "bg-linear-to-br from-lime-400 to-green-600",
];

export function StoriesRow() {
  const { user } = useAuth();
  const { data } = useSuggestedUsers();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const suggestedUsers = data?.users ?? [];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!user) return null;

  return (
    <div className="relative bg-card rounded-xl border border-border p-4">
      {/* Left arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Right arrow */}
      {showRightArrow && suggestedUsers.length > 3 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Scrollable stories */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {/* Create Story Card */}
        <div
          className="shrink-0 w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
          style={{ scrollSnapAlign: "start" }}
        >
          <div className="h-[65%] bg-linear-to-br from-blue-400 to-blue-600 relative">
            <UserAvatar
              src={user.avatar}
              fallback={user.fullName}
              className="absolute inset-0 h-full w-full rounded-none object-cover"
            />
          </div>
          <div className="h-[35%] bg-card flex flex-col items-center justify-end pb-3 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-blue-500 border-4 border-card flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-center mt-1">
              Create story
            </span>
          </div>
        </div>

        {/* User Story Cards */}
        {suggestedUsers.map((storyUser, index) => (
          <div
            key={storyUser._id}
            className="shrink-0 w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Background */}
            <div
              className={`absolute inset-0 ${
                STORY_BG_COLORS[index % STORY_BG_COLORS.length]
              } transition-transform duration-300 group-hover:scale-105`}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

            {/* User avatar with gradient ring */}
            <div className="absolute top-3 left-3">
              <div
                className={`p-[2.5px] rounded-full bg-linear-to-tr ${
                  STORY_GRADIENTS[index % STORY_GRADIENTS.length]
                }`}
              >
                <div className="p-[2px] rounded-full bg-card">
                  <UserAvatar
                    src={storyUser.avatar}
                    fallback={storyUser.fullName}
                    className="h-9 w-9"
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-xs font-semibold truncate drop-shadow-lg">
                {storyUser.fullName.split(" ")[0]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
