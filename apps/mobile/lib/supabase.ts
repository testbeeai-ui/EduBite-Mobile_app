import './auth/crypto-polyfill';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy apps/mobile/.env.example to apps/mobile/.env and fill values.',
  );
}

const SECURE_STORE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        return Promise.resolve(
          typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null,
        );
      } catch {
        return Promise.resolve(null);
      }
    }
    return SecureStore.getItemAsync(key, SECURE_STORE_OPTS);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value, SECURE_STORE_OPTS);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key, SECURE_STORE_OPTS);
  },
};

// Anon / publishable key only — never embed service_role or Google client secret.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    persistSession: true,
    autoRefreshToken: true,
    // Native Google login uses signInWithIdToken (no URL session detect).
    // Keep detectSessionInUrl false on RN; web Expo shell may use URL.
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
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

/**
 * Learner-facing quiz row.
 * Trust boundary: EXPO_PUBLIC anon key is world-readable. Never SELECT secrets
 * (answer keys) into the client — server RPCs grade submissions.
 */
export interface ContentQuestion {
  id: string;
  domain: 'dailydose' | 'funbrain' | string;
  q: string;
  opts: string[];
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
  id?: string;
  day: number;
  slide_index: number;
  icon?: string;
  headline?: string;
  emphasis_word?: string;
  caption?: string;
  pledge_slot?: string;
}

export interface PledgeReelDay {
  day: number;
  theme: string;
  slides: Array<{
    icon: string;
    headline: string;
    emphasisWord: string;
    caption: string;
  }>;
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

/** Learner select — answer key column intentionally omitted. */
const CONTENT_QUESTION_PUBLIC_COLUMNS =
  'id, domain, q, opts, tag, active_date, class_level, sort_order, published';

async function requireSessionUserId(explicitUserId?: string): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sessionUid = session?.user?.id ?? null;
  if (!sessionUid) return null;
  if (explicitUserId && explicitUserId !== sessionUid) {
    console.warn('Refusing to fetch another user\'s row; using session uid.');
  }
  return sessionUid;
}

// 1. RDM REWARDS
export async function fetchEdubiteRewards(): Promise<RdmReward[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_rdm_rewards')
      .select(
        'reward_key, category, label, description, amount, unit, sort_order, updated_at, updated_by',
      )
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Error fetching edubite_rdm_rewards:', error.message);
      return [];
    }
    return (data as RdmReward[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchEdubiteRewards:', message);
    return [];
  }
}

// 2. GAME STATE (own row via session; writes go through edubite_save_game_state RPC)
export async function fetchUserGameState(userId?: string): Promise<UserGameState | null> {
  try {
    const uid = await requireSessionUserId(userId);
    if (!uid) return null;

    const { data, error } = await supabase
      .from('edubite_game_state')
      .select('user_id, updated_at, payload')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      console.warn('RLS / fetch error for edubite_game_state:', error.message);
      return null;
    }
    return (data as UserGameState) || null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchUserGameState:', message);
    return null;
  }
}

// 3. USER PROFILE (own row only)
export async function fetchUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    const uid = await requireSessionUserId(userId);
    if (!uid) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, rdm, created_at, updated_at, state, category')
      .eq('id', uid)
      .maybeSingle();
    if (error) {
      console.warn('RLS / fetch error for profiles:', error.message);
      return null;
    }
    return (data as UserProfile) || null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchUserProfile:', message);
    return null;
  }
}

// 4. DAILY DOSE — no answer key column for learners (server grades via answers[])
export async function fetchDailyDoseQuestions(
  classLevel: '11' | '12' = '11',
  activeDate: string,
): Promise<ContentQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_content_questions')
      .select(CONTENT_QUESTION_PUBLIC_COLUMNS)
      .eq('domain', 'dailydose')
      .eq('published', true)
      .eq('class_level', classLevel)
      .eq('active_date', activeDate)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
      .limit(5);

    if (error) {
      console.warn('Error fetching DailyDose questions:', error.message);
      return [];
    }
    return (data as ContentQuestion[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchDailyDoseQuestions:', message);
    return [];
  }
}

// 5. FUNBRAIN — no answer key column for learners
export async function fetchFunBrainQuestions(
  activeDate: string,
): Promise<ContentQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_content_questions')
      .select(CONTENT_QUESTION_PUBLIC_COLUMNS)
      .eq('domain', 'funbrain')
      .eq('published', true)
      .eq('active_date', activeDate)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
      .limit(6);

    if (error) {
      console.warn('Error fetching FunBrain questions:', error.message);
      return [];
    }
    return (data as ContentQuestion[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchFunBrainQuestions:', message);
    return [];
  }
}

/** Lock today's puzzle attempt (immutable). */
export async function lockPuzzleAttempt(attempt: {
  puzzleId: string;
  dateKey: string;
  responseType: 'open-ended' | 'mcq';
  note: string;
  selectedOptionIndex: number | null;
}): Promise<{ inserted: boolean } | null> {
  const { data, error } = await supabase.rpc('edubite_lock_puzzle_attempt', {
    p_attempt: attempt,
  });
  if (error) {
    console.warn('edubite_lock_puzzle_attempt failed:', error.message);
    return null;
  }
  return { inserted: Boolean((data as { inserted?: boolean } | null)?.inserted) };
}

// 6. INSPIRATION DATA
export async function fetchInspirationQuotes(): Promise<InspirationQuote[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_inspiration_quotes')
      .select('id, quote, category, content_key, sort_order')
      .order('sort_order', { ascending: true })
      .limit(500);
    if (error) {
      console.warn('Error fetching inspiration quotes:', error.message);
      return [];
    }
    return (data as InspirationQuote[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchInspirationQuotes:', message);
    return [];
  }
}

export async function fetchInspirationPhenomena(): Promise<InspirationPhenomena[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_inspiration_phenomena')
      .select('id, subject, icon, badge, question, explanation, volume, number')
      .order('volume', { ascending: true })
      .order('number', { ascending: true })
      .limit(500);
    if (error) {
      console.warn('Error fetching inspiration phenomena:', error.message);
      return [];
    }
    return (data as InspirationPhenomena[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchInspirationPhenomena:', message);
    return [];
  }
}

export async function fetchInspirationRoleModels(): Promise<InspirationRoleModel[]> {
  try {
    const { data, error } = await supabase
      .from('edubite_inspiration_role_models')
      .select('id, name, tag, quote, bio, avatar, volume, number')
      .order('volume', { ascending: true })
      .order('number', { ascending: true })
      .limit(500);
    if (error) {
      console.warn('Error fetching inspiration role models:', error.message);
      return [];
    }
    return (data as InspirationRoleModel[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchInspirationRoleModels:', message);
    return [];
  }
}

/** Learner enroll into monthly challenge (no admin UI). */
export async function enrollMonthlyChallenge(args: {
  monthKey: string;
  displayName: string;
  dateKey?: string;
}): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.rpc('edubite_enroll_monthly_challenge', {
    p_month_key: args.monthKey,
    p_display_name: args.displayName,
    p_date_key: args.dateKey ?? null,
  });
  if (error) {
    console.warn('edubite_enroll_monthly_challenge failed:', error.message);
    return null;
  }
  return (data as Record<string, unknown>) ?? null;
}

// 7. PLEDGE REEL SLIDES
export async function fetchPledgeReelSlides(
  day: number = 1,
  slot: 'am' | 'pm' = 'am',
): Promise<PledgeReelSlide[]> {
  try {
    const slotted = await supabase
      .from('edubite_pledge_reel_slides')
      .select('id, day, slide_index, icon, headline, emphasis_word, caption, pledge_slot')
      .eq('day', day)
      .eq('pledge_slot', slot)
      .order('slide_index', { ascending: true });

    if (!slotted.error && slotted.data?.length) {
      return slotted.data as PledgeReelSlide[];
    }

    // Older rows may lack pledge_slot — fall back to day-only.
    const fallback = await supabase
      .from('edubite_pledge_reel_slides')
      .select('id, day, slide_index, icon, headline, emphasis_word, caption, pledge_slot')
      .eq('day', day)
      .order('slide_index', { ascending: true });

    if (fallback.error) {
      console.warn('Error fetching pledge reel slides:', fallback.error.message);
      return [];
    }
    return (fallback.data as PledgeReelSlide[]) || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchPledgeReelSlides:', message);
    return [];
  }
}

/** Load a full 4-slide reel for AM/PM + journey day (matches web pledge-reel API). */
export async function fetchPledgeReelDay(
  slot: 'am' | 'pm',
  day: number,
): Promise<PledgeReelDay | null> {
  try {
    const [{ data: dayRow }, slides] = await Promise.all([
      supabase
        .from('edubite_pledge_reel_days')
        .select('day, theme, pledge_slot')
        .eq('day', day)
        .eq('pledge_slot', slot)
        .maybeSingle(),
      fetchPledgeReelSlides(day, slot),
    ]);

    if (slides.length < 4) return null;

    const ordered = [...slides]
      .sort((a, b) => a.slide_index - b.slide_index)
      .slice(0, 4)
      .map((s) => ({
        icon: s.icon || '🧠',
        headline: s.headline || '',
        emphasisWord: s.emphasis_word || '',
        caption: s.caption || '',
      }));

    return {
      day,
      theme: (dayRow as { theme?: string } | null)?.theme || `Day ${day}`,
      slides: ordered,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchPledgeReelDay:', message);
    return null;
  }
}

// 8. BRAIN GYM PROGRESS
export async function fetchBrainGymProgress(userId?: string): Promise<BrainGymProgress | null> {
  try {
    const uid = await requireSessionUserId(userId);
    if (!uid) return null;

    const { data, error } = await supabase
      .from('edubite_brain_gym_progress')
      .select('user_id, payload, updated_at')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      console.warn('Error/RLS fetching Brain Gym progress:', error.message);
      return null;
    }
    return (data as BrainGymProgress) || null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchBrainGymProgress:', message);
    return null;
  }
}

// 9. PUZZLE PROGRESS
export async function fetchPuzzleProgress(userId?: string): Promise<PuzzleProgress | null> {
  try {
    const uid = await requireSessionUserId(userId);
    if (!uid) return null;

    const { data, error } = await supabase
      .from('edubite_puzzle_progress')
      .select('user_id, payload, updated_at')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      console.warn('Error/RLS fetching Puzzle progress:', error.message);
      return null;
    }
    return (data as PuzzleProgress) || null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Exception in fetchPuzzleProgress:', message);
    return null;
  }
}

/** Server-authoritative progress write (grades answers server-side). Requires auth session. */
export async function saveGameState(payload: Record<string, unknown>) {
  const { data, error } = await supabase.rpc('edubite_save_game_state', {
    p_payload: payload,
  });
  if (error) {
    console.warn('edubite_save_game_state failed:', error.message);
    return null;
  }
  return data;
}
