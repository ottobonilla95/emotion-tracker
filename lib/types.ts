export interface MoodEntry {
  id: number;
  emoji: string;
  label: string;
  intensity: number;
  notes: string | null;
  created_at: string;
}

export interface Emotion {
  emoji: string;
  label: string;
  color: string;
}

export interface MoodStats {
  totalEntries: number;
  avgIntensity: number;
  mostFrequentMood: { emoji: string; label: string; count: number } | null;
  moodFrequency: { emoji: string; label: string; count: number }[];
  recentTrend: { date: string; avgIntensity: number }[];
}
