"use client";

import { useState } from "react";
import { MoodPicker } from "@/components/emoji-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MoodLevel } from "@/lib/types";

export default function Home() {
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function handleSubmit() {
    if (!selected) return;

    setStatus("saving");
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji: selected.emoji,
          label: selected.label,
          score: selected.score,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStatus("success");
      setSelected(null);
      setNotes("");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">How are you feeling?</h1>
        <p className="text-muted-foreground">Select your mood to log it</p>
      </div>

      <MoodPicker selected={selected} onSelect={setSelected} />

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{selected.emoji}</span>
              {selected.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="What's on your mind?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={status === "saving"}
              className="w-full"
            >
              {status === "saving" ? "Saving..." : "Log Mood"}
            </Button>

            {status === "success" && (
              <p className="text-sm text-center text-green-600">
                Mood logged successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-center text-destructive">
                Something went wrong. Try again.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
