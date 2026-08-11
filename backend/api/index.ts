import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bytsiknhtcnlxwzgqkrd.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dHNpa25odGNubHh3emdxa3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODg3MjksImV4cCI6MjA4OTc2NDcyOX0.5ORuXxKgyS75KKHEyrs8TPmXIJVOfbsPdkJg7oaBCmA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Master Database Type Definitions
export interface RdmReward {
  reward_key: string;
  category: string;
  label: string;
  description: string;
  amount: number;
  unit: string;
  sort_order: number;
  updated_at: string;
  updated_by?: string | null;
}

export interface UserGameState {
  user_id: string;
  updated_at: string;
  payload: Record<string, any>;
}

export interface ContentQuestion {
  id: string;
  domain: 'dailydose' | 'funbrain' | string;
  q: string;
  opts: string[];
  correct: number;
  tag?: string;
  active_date?: string;
  class_level?: string;
  sort_order?: number;
  published?: boolean;
}

export interface InspirationQuote {
  id: number;
  quote: string;
  category?: string;
  content_key?: string;
  sort_order?: number;
}

export interface InspirationPhenomena {
  id: number;
  subject?: string;
  icon?: string;
  badge?: string;
  question?: string;
  explanation?: string;
  volume?: number;
  number?: number;
}

export interface InspirationRoleModel {
  id: number;
  name?: string;
  tag?: string;
  quote?: string;
  bio?: string;
  avatar?: string;
  volume?: number;
  number?: number;
}

export interface PledgeReelSlide {
  id: string;
  day: number;
  slide_index: number;
  icon?: string;
  headline?: string;
  emphasis_word?: string;
  caption?: string;
}

export interface BrainGymProgress {
  user_id: string;
  payload: Record<string, any>;
  updated_at?: string;
}

export interface PuzzleProgress {
  user_id: string;
  payload: Record<string, any>;
  updated_at?: string;
}
