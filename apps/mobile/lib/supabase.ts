import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bytsiknhtcnlxwzgqkrd.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dHNpa25odGNubHh3emdxa3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODg3MjksImV4cCI6MjA4OTc2NDcyOX0.5ORuXxKgyS75KKHEyrs8TPmXIJVOfbsPdkJg7oaBCmA';

// Create read-only Supabase client with URL and Anon Key only
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// TYPES
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

export interface UserProfile {
  id: string;
  name?: string;
  role?: string;
  rdm?: number;
  created_at?: string;
  updated_at?: string;
  state?: string;
  category?: string;
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

// 1. RDM REWARDS
export async function fetchEdubiteRewards(): Promise<RdmReward[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_rdm_rewards')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Error fetching edubite_rdm_rewards:', error.message);
      return [];
    }
    return (data as RdmReward[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchEdubiteRewards:', err?.message || err);
    return [];
  }
}

// 2. GAME STATE
export async function fetchUserGameState(userId?: string): Promise<UserGameState | null> {
  try {
    let query = supabase.from('edubite_game_state').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('RLS / fetch error for edubite_game_state:', error.message);
      return null;
    }
    return (data as UserGameState) || null;
  } catch (err: any) {
    console.warn('Exception in fetchUserGameState:', err?.message || err);
    return null;
  }
}

// 3. USER PROFILE
export async function fetchUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    let query = supabase.from('profiles').select('*');
    if (userId) {
      query = query.eq('id', userId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('RLS / fetch error for profiles:', error.message);
      return null;
    }
    return (data as UserProfile) || null;
  } catch (err: any) {
    console.warn('Exception in fetchUserProfile:', err?.message || err);
    return null;
  }
}

// 4. DAILY DOSE CONTENT QUESTIONS
export async function fetchDailyDoseQuestions(classLevel?: string): Promise<ContentQuestion[]> {
  try {
    let query = supabase
      .from('edubite_content_questions')
      .select('*')
      .eq('domain', 'dailydose')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(10);

    if (classLevel) {
      query = query.eq('class_level', classLevel);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching DailyDose questions:', error.message);
      return [];
    }
    return (data as ContentQuestion[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchDailyDoseQuestions:', err?.message || err);
    return [];
  }
}

// 5. FUNBRAIN CONTENT QUESTIONS
export async function fetchFunBrainQuestions(): Promise<ContentQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_content_questions')
      .select('*')
      .eq('domain', 'funbrain')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(10);

    if (error) {
      console.warn('Error fetching FunBrain questions:', error.message);
      return [];
    }
    return (data as ContentQuestion[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchFunBrainQuestions:', err?.message || err);
    return [];
  }
}

// 6. INSPIRATION DATA
export async function fetchInspirationQuotes(): Promise<InspirationQuote[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_inspiration_quotes')
      .select('*')
      .limit(10);
    if (error) {
      console.warn('Error fetching inspiration quotes:', error.message);
      return [];
    }
    return (data as InspirationQuote[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchInspirationQuotes:', err?.message || err);
    return [];
  }
}

export async function fetchInspirationPhenomena(): Promise<InspirationPhenomena[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_inspiration_phenomena')
      .select('*')
      .limit(10);
    if (error) {
      console.warn('Error fetching inspiration phenomena:', error.message);
      return [];
    }
    return (data as InspirationPhenomena[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchInspirationPhenomena:', err?.message || err);
    return [];
  }
}

export async function fetchInspirationRoleModels(): Promise<InspirationRoleModel[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_inspiration_role_models')
      .select('*')
      .limit(10);
    if (error) {
      console.warn('Error fetching inspiration role models:', error.message);
      return [];
    }
    return (data as InspirationRoleModel[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchInspirationRoleModels:', err?.message || err);
    return [];
  }
}

// 7. PLEDGE REEL SLIDES
export async function fetchPledgeReelSlides(day: number = 1): Promise<PledgeReelSlide[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_pledge_reel_slides')
      .select('*')
      .eq('day', day)
      .order('slide_index', { ascending: true });

    if (error) {
      console.warn('Error fetching pledge reel slides:', error.message);
      return [];
    }
    return (data as PledgeReelSlide[]) || [];
  } catch (err: any) {
    console.warn('Exception in fetchPledgeReelSlides:', err?.message || err);
    return [];
  }
}

// 8. BRAIN GYM PROGRESS
export async function fetchBrainGymProgress(userId?: string): Promise<BrainGymProgress | null> {
  try {
    let query = supabase.from('edubite_brain_gym_progress').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('Error/RLS fetching Brain Gym progress:', error.message);
      return null;
    }
    return (data as BrainGymProgress) || null;
  } catch (err: any) {
    console.warn('Exception in fetchBrainGymProgress:', err?.message || err);
    return null;
  }
}

// 9. PUZZLE PROGRESS
export async function fetchPuzzleProgress(userId?: string): Promise<PuzzleProgress | null> {
  try {
    let query = supabase.from('edubite_puzzle_progress').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('Error/RLS fetching Puzzle progress:', error.message);
      return null;
    }
    return (data as PuzzleProgress) || null;
  } catch (err: any) {
    console.warn('Exception in fetchPuzzleProgress:', err?.message || err);
    return null;
  }
}
