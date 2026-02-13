export interface MoodEntry {
  id: number;
  emoji: string;
  label: string;
  score: number;
  intensity?: number;
  notes: string | null;
  created_at: string;
}

export interface Emotion {
  emoji: string;
  label: string;
  color: string;
}

export interface MoodLevel {
  score: number;
  emoji: string;
  label: string;
  color: string;
}

export interface MoodStats {
  totalEntries: number;
  avgScore: number;
  mostFrequentMood: { emoji: string; label: string; count: number } | null;
  moodFrequency: { emoji: string; label: string; count: number }[];
  dailyScores: { date: string; avgScore: number }[];
}
