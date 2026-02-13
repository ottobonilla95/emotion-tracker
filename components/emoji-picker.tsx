"use client";

import { EMOTIONS } from "@/lib/emotions";
import { cn } from "@/lib/utils";
import type { Emotion } from "@/lib/types";

interface EmojiPickerProps {
  selected: Emotion | null;
  onSelect: (emotion: Emotion) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {EMOTIONS.map((emotion) => (
        <button
          key={emotion.emoji}
          onClick={() => onSelect(emotion)}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-105",
            selected?.emoji === emotion.emoji
              ? "border-primary bg-primary/5 scale-105 shadow-md"
              : "border-transparent hover:border-muted-foreground/20 hover:bg-muted"
          )}
        >
          <span className="text-3xl">{emotion.emoji}</span>
          <span className="text-xs text-muted-foreground">{emotion.label}</span>
        </button>
      ))}
    </div>
  );
}
