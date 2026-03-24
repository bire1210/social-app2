"use client";

import { useAuth } from "@/hooks/useAuth";
import { UPLOADS_URL } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

export function UserAvatar({ src, fallback, className }: UserAvatarProps) {
  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${UPLOADS_URL}${path}`;
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={src ? getImageUrl(src) : undefined} alt={fallback} />
      <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-500 text-white font-semibold text-sm">
        {fallback.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
