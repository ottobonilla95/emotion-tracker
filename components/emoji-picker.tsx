"use client";

import { MOOD_LEVELS } from "@/lib/emotions";
import { cn } from "@/lib/utils";
import type { MoodLevel } from "@/lib/types";

interface MoodPickerProps {
  selected: MoodLevel | null;
  onSelect: (level: MoodLevel) => void;
}

export function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {[...MOOD_LEVELS].reverse().map((level) => (
        <button
          key={level.score}
          onClick={() => onSelect(level)}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 transition-all hover:scale-105",
            selected?.score === level.score
              ? "scale-105 shadow-md"
              : "border-transparent hover:border-muted-foreground/20 hover:bg-muted"
          )}
          style={
            selected?.score === level.score
              ? { borderColor: level.color, backgroundColor: `${level.color}15` }
              : undefined
          }
        >
          <span className="text-3xl">{level.emoji}</span>
          <span className="text-xs text-muted-foreground">{level.label}</span>
        </button>
      ))}
    </div>
  );
}
