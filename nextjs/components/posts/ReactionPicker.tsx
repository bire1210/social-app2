"use client";

import { REACTIONS, ReactionType } from "@/types";

interface ReactionPickerProps {
  onReact: (type: ReactionType) => void;
}

export function ReactionPicker({ onReact }: ReactionPickerProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-full shadow-lg">
      {REACTIONS.map((r) => (
        <button
          key={r.type}
          onClick={() => onReact(r.type)}
          title={r.label}
          className="text-2xl hover:scale-125 transition-transform duration-150 leading-none"
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
}
