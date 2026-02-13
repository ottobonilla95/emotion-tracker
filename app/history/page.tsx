"use client";

import { useEffect, useState } from "react";
import { MoodCard } from "@/components/mood-card";
import { Button } from "@/components/ui/button";
import type { MoodEntry } from "@/lib/types";

const FILTER_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All", value: 0 },
];

export default function HistoryPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filter, setFilter] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  async function fetchEntries() {
    setLoading(true);
    const params = filter > 0 ? `?days=${filter}` : "";
    const res = await fetch(`/api/mood${params}`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/mood/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mood History</h1>
        <p className="text-muted-foreground">Your recent mood entries</p>
      </div>

      <div className="flex gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No mood entries yet. Go log your first mood!
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <MoodCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
