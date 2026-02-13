"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { MoodEntry } from "@/lib/types";
import { getMoodLevel } from "@/lib/emotions";

interface MoodCardProps {
  entry: MoodEntry;
  onDelete: (id: number) => void;
}

export function MoodCard({ entry, onDelete }: MoodCardProps) {
  const level = getMoodLevel(entry.score);
  const date = new Date(entry.created_at);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{entry.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{entry.label}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${level.color}20`,
                color: level.color,
              }}
            >
              {level.label}
            </span>
          </div>
          {entry.notes && (
            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
          )}
          <time className="text-xs text-muted-foreground mt-1 block">
            {date.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            at{" "}
            {date.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(entry.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
