import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { shuffle, range } from '../utils/shuffle';
import { sfx } from '../utils/sound';
import { difficultyMultiplier } from '../storage';
import { CellButton, COLORS, GridWrap, HudPill, PlayStage } from './_shared';
import { usePausableScheduler } from './_pausable-scheduler';

const ICONS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌',
  '🐞', '🐜', '🦗', '🕷️', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊',
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
  '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🧅', '🧄', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀',
  '🥚', '🍳', '🥞', '🧇', '🥓', '🥩', '🍗', '🌭', '🍔', '🍟', '🍕', '🥪', '🌯', '🌮', '🍿', '🧈',
  '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🥛', '☕',
  '🍵', '🧃', '🥤', '🧋', '🍺', '🍻', '🍷', '🍹', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
  '🎱', '🪀', '🏓', '🏸', '🥅', '🎒', '🎓', '🕶️', '🥽', '🥼', '🛟', '🎈', '🎁', '🎨', '🎭', '🎪',
];

export function ImageMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === 'easy' ? 3 : 4;
  const n = size * size;
  const [grid, setGrid] = useState<string[]>([]);
  const [changedGrid, setChangedGrid] = useState<string[]>([]);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [answer, setAnswer] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const setup = () => {
    const g = shuffle(ICONS).slice(0, n);
    const changedIndex = Math.floor(Math.random() * n);
    const replacement = shuffle(ICONS.filter((icon) => !g.includes(icon)))[0]!;
    const nextChangedGrid = g.map((icon, index) =>
      index === changedIndex ? replacement : icon,
    );
    setGrid(g);
    setChangedGrid(nextChangedGrid);
    setAnswer(changedIndex);
    setPhase('study');
    schedule(() => setPhase('quiz'), difficulty === 'hard' ? 1200 : 2000);
  };

  useEffect(() => {
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i: number) => {
    if (paused || phase !== 'quiz' || completedRef.current) return;
    if (i === answer) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(45 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setRound((r) => r + 1);
        schedule(setup, 350);
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(setup, 350);
    }
  };

  const shown = phase === 'study' ? grid : changedGrid;

  return (
    <PlayStage>
      <View style={styles.board}>
        <HudPill>
          <Text style={styles.hudText}>
            {phase === 'study' ? 'Study the icons…' : 'Which icon changed?'} · Round{' '}
            {round}/5
          </Text>
        </HudPill>
        <View style={styles.gridWrap}>
          <GridWrap columns={size}>
            {range(n).map((i) => (
              <CellButton
                key={i}
                onPress={() => pick(i)}
                disabled={phase === 'study'}
                textStyle={styles.icon}
              >
                {shown[i]}
              </CellButton>
            ))}
          </GridWrap>
        </View>
        <Text style={styles.hint}>
          {phase === 'study'
            ? 'Commit the grid to memory'
            : 'Tap the cell that swapped'}
        </Text>
      </View>
    </PlayStage>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: 'rgba(20,26,35,0.95)',
    padding: 16,
  },
  hudText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  gridWrap: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
  icon: { fontSize: 30 },
  hint: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 8,
  },
});
