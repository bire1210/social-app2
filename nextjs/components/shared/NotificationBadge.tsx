"use client";

import { memo } from "react";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export const NotificationBadge = memo(function NotificationBadge({ 
  count, 
  className = "", 
  maxCount = 9 
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span 
      className={`absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ${className}`}
    >
      {count > maxCount ? `${maxCount}+` : count}
    </span>
  );
});

NotificationBadge.displayName = "NotificationBadge";