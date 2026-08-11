-- ============================================================
-- EDUBITE SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.edubite_rdm_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_brain_gym_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_puzzle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_monthly_challenge_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_monthly_challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_inspiration_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_inspiration_phenomena ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_inspiration_role_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_pledge_reel_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_pledge_reel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Public Content Read Policies (Anonymous & Authenticated)
CREATE POLICY "Allow public read on edubite_rdm_rewards" 
  ON public.edubite_rdm_rewards FOR SELECT USING (true);

CREATE POLICY "Allow public read on published content questions" 
  ON public.edubite_content_questions FOR SELECT USING (published = true);

CREATE POLICY "Allow public read on inspiration quotes" 
  ON public.edubite_inspiration_quotes FOR SELECT USING (true);

CREATE POLICY "Allow public read on inspiration phenomena" 
  ON public.edubite_inspiration_phenomena FOR SELECT USING (true);

CREATE POLICY "Allow public read on inspiration role models" 
  ON public.edubite_inspiration_role_models FOR SELECT USING (true);

CREATE POLICY "Allow public read on pledge reel days" 
  ON public.edubite_pledge_reel_days FOR SELECT USING (true);

CREATE POLICY "Allow public read on pledge reel slides" 
  ON public.edubite_pledge_reel_slides FOR SELECT USING (true);

-- 2. User-Specific RLS Policies (Auth User Own Data)
CREATE POLICY "Users can read own game state" 
  ON public.edubite_game_state FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own brain gym progress" 
  ON public.edubite_brain_gym_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own puzzle progress" 
  ON public.edubite_puzzle_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);
