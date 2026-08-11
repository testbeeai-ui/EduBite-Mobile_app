export type HabitDef = {
  id: string;
  icon: string;
  bg: string;
  name: string;
  sub: string;
  desc: string;
  benefits: string[];
  rdmKey: string;
  defaultRdm: number;
};

export const HABIT_DEFINITIONS: HabitDef[] = [
  {
    id: 'sleep',
    icon: '😴',
    bg: 'rgba(239,159,39,0.16)',
    name: '7–8 hrs sleep',
    sub: "Locks in what today's dose taught",
    desc: 'Consolidates the material you practised today into long-term memory while you sleep.',
    benefits: [
      'Locks in same-day learning instead of losing it overnight',
      'Sharper focus and faster recall the next morning',
      'Lowers stress hormones that block memory formation',
    ],
    rdmKey: 'habit.sleep',
    defaultRdm: 15,
  },
  {
    id: 'water',
    icon: '💧',
    bg: 'rgba(29,158,117,0.16)',
    name: 'Hydration · 8 glasses',
    sub: 'Stay sharp between study blocks',
    desc: 'Keeps the brain running on enough fluid to think clearly through long study sessions.',
    benefits: [
      'Prevents the afternoon fog caused by mild dehydration',
      'Supports concentration during long practice blocks',
      'Keeps energy steady without relying on sugar or caffeine',
    ],
    rdmKey: 'habit.water',
    defaultRdm: 10,
  },
  {
    id: 'eyes',
    icon: '👁',
    bg: 'rgba(239,159,39,0.16)',
    name: '20-20-20 eye rule',
    sub: 'Every 20 min, look 20ft away',
    desc: 'Reduces digital eye strain by giving your eye muscles regular opportunities to relax.',
    benefits: [
      'Prevents eye fatigue and dry eyes from screen usage',
      'Reduces risk of headaches and blurred vision',
      'Maintains long-term optic health and focus strength',
    ],
    rdmKey: 'habit.eyes',
    defaultRdm: 8,
  },
  {
    id: 'move',
    icon: '🏃',
    bg: 'rgba(212,83,126,0.16)',
    name: '10-min movement break',
    sub: 'Stretch, walk, or shadow-box',
    desc: 'A brief physical break boosts blood circulation and resets your mental bandwidth.',
    benefits: [
      'Re-oxygenates the brain to break through mental blocks',
      'Relieves physical tension in the neck, shoulders, and back',
      'Releases endorphins to elevate mood and focus',
    ],
    rdmKey: 'habit.move',
    defaultRdm: 10,
  },
  {
    id: 'pomodoro',
    icon: '🍅',
    bg: 'rgba(29,158,117,0.16)',
    name: 'Pomodoro technique',
    sub: '25 min focus, 5 min break, repeat',
    desc: 'Trains your brain to focus intensely for short periods while avoiding cognitive fatigue.',
    benefits: [
      'Keeps motivation high by working in manageable chunks',
      'Reduces distractions and procrastination habits',
      'Ensures regular breaks to sustain energy all day',
    ],
    rdmKey: 'habit.pomodoro',
    defaultRdm: 12,
  },
  {
    id: 'noscreen',
    icon: '🌙',
    bg: 'rgba(212,83,126,0.16)',
    name: 'No-screen wind-down',
    sub: '30 min phone-free before bed',
    desc: 'Eliminating blue light before bed helps your brain produce melatonin for deep restorative sleep.',
    benefits: [
      'Makes falling asleep faster and more natural',
      'Improves sleep quality and REM sleep cycles',
      'Protects evening relaxation from notification stress',
    ],
    rdmKey: 'habit.noscreen',
    defaultRdm: 10,
  },
  {
    id: 'meals',
    icon: '🍽',
    bg: 'rgba(55,138,221,0.16)',
    name: 'No skipped meals',
    sub: 'Breakfast especially — brain fuel',
    desc: 'Maintains steady blood glucose levels to prevent cognitive crashes and mood swings.',
    benefits: [
      'Supplies constant energy to power intensive studying',
      'Improves memory retrieval and general brain stamina',
      'Regulates metabolism and reduces stress levels',
    ],
    rdmKey: 'habit.meals',
    defaultRdm: 12,
  },
  {
    id: 'noai',
    icon: '🤖',
    bg: 'rgba(212,83,126,0.16)',
    name: 'Use AI responsibly',
    sub: 'While practising, thinking, testing',
    desc: 'Leveraging AI as a learning tutor rather than a shortcut protects your critical thinking skills.',
    benefits: [
      'Promotes active recall and deep learning over copy-pasting',
      'Builds authentic problem-solving and coding resilience',
      'Prepares you for real-world interviews and engineering tasks',
    ],
    rdmKey: 'habit.noai',
    defaultRdm: 15,
  },
];
