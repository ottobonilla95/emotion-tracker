import { Emotion, MoodLevel } from "./types";

export const MOOD_LEVELS: MoodLevel[] = [
  { score: 2, emoji: "😄", label: "Super Good", color: "#22c55e" },
  { score: 1, emoji: "🙂", label: "Good", color: "#3b82f6" },
  { score: 0, emoji: "😐", label: "Neutral", color: "#9ca3af" },
  { score: -1, emoji: "😕", label: "Bad", color: "#f97316" },
  { score: -2, emoji: "😞", label: "Very Bad", color: "#ef4444" },
];

export function getMoodLevel(score: number): MoodLevel {
  return MOOD_LEVELS.find((m) => m.score === score) ?? MOOD_LEVELS[2];
}

// Keep old EMOTIONS for backward compat in mood-card display of legacy entries
export const EMOTIONS: Emotion[] = [
  { emoji: "😊", label: "Happy", color: "#FFD93D" },
  { emoji: "😌", label: "Calm", color: "#6BCB77" },
  { emoji: "😐", label: "Neutral", color: "#9E9E9E" },
  { emoji: "😔", label: "Sad", color: "#4D96FF" },
  { emoji: "😰", label: "Anxious", color: "#FF6B6B" },
  { emoji: "😤", label: "Frustrated", color: "#FF8C32" },
  { emoji: "😍", label: "Loved", color: "#FF69B4" },
  { emoji: "😴", label: "Tired", color: "#8B7EC8" },
  { emoji: "🤯", label: "Overwhelmed", color: "#E84393" },
  { emoji: "🥳", label: "Excited", color: "#00D2D3" },
];
