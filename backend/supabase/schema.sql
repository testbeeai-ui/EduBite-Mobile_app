-- ============================================================
-- EDUBITE SUPABASE DATABASE SCHEMA DEFINITION
-- Instance: https://bytsiknhtcnlxwzgqkrd.supabase.co
-- ============================================================

-- 1. RDM Rewards Configuration
CREATE TABLE IF NOT EXISTS public.edubite_rdm_rewards (
  reward_key TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. User Game State & Progress Payload
CREATE TABLE IF NOT EXISTS public.edubite_game_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 3. Content Questions (DailyDose & FunBrain)
CREATE TABLE IF NOT EXISTS public.edubite_content_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL, -- 'dailydose' | 'funbrain'
  active_date DATE,
  class_level TEXT, -- 'c11' | 'c12'
  tag TEXT,
  q TEXT NOT NULL,
  opts JSONB NOT NULL, -- string array ["opt1", "opt2", "opt3", "opt4"]
  correct INT NOT NULL,
  sort_order INT DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brain Gym User Progress
CREATE TABLE IF NOT EXISTS public.edubite_brain_gym_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Puzzle User Progress
CREATE TABLE IF NOT EXISTS public.edubite_puzzle_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Monthly Challenge Tables
CREATE TABLE IF NOT EXISTS public.edubite_monthly_challenge_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  month TEXT NOT NULL, -- e.g. '2026-08'
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.edubite_monthly_challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  month TEXT NOT NULL,
  rdm_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inspiration Content Tables
CREATE TABLE IF NOT EXISTS public.edubite_inspiration_quotes (
  id BIGSERIAL PRIMARY KEY,
  quote TEXT NOT NULL,
  category TEXT,
  content_key TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.edubite_inspiration_phenomena (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT,
  icon TEXT,
  badge TEXT,
  question TEXT,
  explanation TEXT,
  volume INT,
  number INT
);

CREATE TABLE IF NOT EXISTS public.edubite_inspiration_role_models (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT,
  quote TEXT,
  bio TEXT,
  avatar TEXT,
  volume INT,
  number INT
);

-- 8. Pledge Reel & AI Integrity Tables
CREATE TABLE IF NOT EXISTS public.edubite_pledge_reel_days (
  day INT PRIMARY KEY,
  theme TEXT,
  pledge_slot TEXT, -- 'am' | 'pm'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.edubite_pledge_reel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day INT REFERENCES public.edubite_pledge_reel_days(day),
  slide_index INT NOT NULL,
  icon TEXT,
  headline TEXT,
  emphasis_word TEXT,
  caption TEXT
);

-- 9. Profiles & User Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  role TEXT,
  rdm NUMERIC DEFAULT 0,
  category TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL
);
