import { useState, useEffect } from 'react';
import {
  fetchEdubiteRewards,
  fetchUserGameState,
  fetchUserProfile,
  fetchDailyDoseQuestions,
  fetchFunBrainQuestions,
  fetchInspirationQuotes,
  fetchPledgeReelSlides,
  fetchBrainGymProgress,
  fetchPuzzleProgress,
  RdmReward,
  UserGameState,
  UserProfile,
  ContentQuestion,
  InspirationQuote,
  PledgeReelSlide,
  BrainGymProgress,
  PuzzleProgress,
} from '../lib/supabase';

export interface EdubiteDataState {
  loading: boolean;
  rewards: RdmReward[];
  rewardMap: Record<string, RdmReward>;
  gameState: UserGameState | null;
  profile: UserProfile | null;
  dailyDoseQuestions: ContentQuestion[];
  funBrainQuestions: ContentQuestion[];
  inspirationQuotes: InspirationQuote[];
  pledgeSlides: PledgeReelSlide[];
  brainGymProgress: BrainGymProgress | null;
  puzzleProgress: PuzzleProgress | null;
  refetch: () => Promise<void>;
}

export function useEdubiteData(): EdubiteDataState {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<RdmReward[]>([]);
  const [rewardMap, setRewardMap] = useState<Record<string, RdmReward>>({});
  const [gameState, setGameState] = useState<UserGameState | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyDoseQuestions, setDailyDoseQuestions] = useState<ContentQuestion[]>([]);
  const [funBrainQuestions, setFunBrainQuestions] = useState<ContentQuestion[]>([]);
  const [inspirationQuotes, setInspirationQuotes] = useState<InspirationQuote[]>([]);
  const [pledgeSlides, setPledgeSlides] = useState<PledgeReelSlide[]>([]);
  const [brainGymProgress, setBrainGymProgress] = useState<BrainGymProgress | null>(null);
  const [puzzleProgress, setPuzzleProgress] = useState<PuzzleProgress | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        fetchedRewards,
        state,
        userProf,
        ddQuestions,
        fbQuestions,
        quotes,
        slides,
        bgProgress,
        puzProgress,
      ] = await Promise.all([
        fetchEdubiteRewards(),
        fetchUserGameState(),
        fetchUserProfile(),
        fetchDailyDoseQuestions(),
        fetchFunBrainQuestions(),
        fetchInspirationQuotes(),
        fetchPledgeReelSlides(1),
        fetchBrainGymProgress(),
        fetchPuzzleProgress(),
      ]);

      setRewards(fetchedRewards);
      const rMap: Record<string, RdmReward> = {};
      fetchedRewards.forEach((r) => {
        rMap[r.reward_key] = r;
      });
      setRewardMap(rMap);
      setGameState(state);
      setProfile(userProf);
      setDailyDoseQuestions(ddQuestions);
      setFunBrainQuestions(fbQuestions);
      setInspirationQuotes(quotes);
      setPledgeSlides(slides);
      setBrainGymProgress(bgProgress);
      setPuzzleProgress(puzProgress);
    } catch (err) {
      console.warn('Failed to load Edubite Supabase data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    rewards,
    rewardMap,
    gameState,
    profile,
    dailyDoseQuestions,
    funBrainQuestions,
    inspirationQuotes,
    pledgeSlides,
    brainGymProgress,
    puzzleProgress,
    refetch: loadData,
  };
}
