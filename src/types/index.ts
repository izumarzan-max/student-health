export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  language: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepRecord {
  id: string;
  user_id: string;
  sleep_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  quality: number;
  created_at: string;
}

export interface WaterRecord {
  id: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
  created_at: string;
}

export interface ActivityRecord {
  id: string;
  user_id: string;
  activity_date: string;
  activity_type: string;
  duration_minutes: number;
  intensity: string | null;
  created_at: string;
}

export interface MoodRecord {
  id: string;
  user_id: string;
  mood_date: string;
  mood_level: 1 | 2 | 3 | 4 | 5;
  note: string | null;
  created_at: string;
}

export interface NutritionItem {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  benefits: string;
  serving_size: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  read_time_minutes: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
