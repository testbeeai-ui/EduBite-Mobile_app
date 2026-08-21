import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { shuffle, range } from '../utils/shuffle';
import { sfx } from '../utils/sound';
import { patternMemoryCorrectDelta } from '../scoring';
import {
  CellButton,
  COLORS,
  GridWrap,
  HudPill,
  PlayStage,
  PrimaryButton,
} from './_shared';
import { usePausableScheduler } from './_pausable-scheduler';

export function PatternMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const cells = size * size;
  const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const [pattern, setPattern] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [show, setShow] = useState(true);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const gen = (targetRound: number) => {
    const roundCount = Math.min(cells, count + Math.floor((targetRound - 1) / 2));
    const p = new Set(shuffle(range(cells)).slice(0, roundCount));
    setPattern(p);
    setSelected(new Set());
    setShow(true);
    const studyMs = difficulty === 'easy' ? 1_800 : difficulty === 'medium' ? 1_500 : 1_200;
    schedule(() => setShow(false), studyMs);
  };

  useEffect(() => {
    gen(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (i: number) => {
    if (paused || show || completedRef.current) return;
    sfx.tap(soundEnabled);
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const submit = () => {
    if (paused || show || completedRef.current) return;
    const ok = selected.size === pattern.size && [...selected].every((i) => pattern.has(i));
    if (ok) {
      sfx.correct(soundEnabled);
      const ns = score + patternMemoryCorrectDelta(round, difficulty);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setRound((r) => r + 1);
        schedule(() => gen(round + 1), 400);
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(() => gen(round), 400);
    }
  };

  return (
    <PlayStage>
      <View style={styles.board}>
        <HudPill>
          <Text style={styles.hudText}>
            {show ? 'Memorize the pattern!' : 'Recreate it'} · Round {round}/5
          </Text>
        </HudPill>
        <View style={styles.gridWrap}>
          <GridWrap columns={size}>
            {range(cells).map((i) => {
              const on = show ? pattern.has(i) : selected.has(i);
              return (
                <CellButton
                  key={i}
                  onPress={() => toggle(i)}
                  style={on ? styles.on : undefined}
                />
              );
            })}
          </GridWrap>
        </View>
        {!show ? (
          <PrimaryButton label="Check pattern" onPress={submit} style={styles.submit} />
        ) : (
          <Text style={styles.hint}>Pattern disappears soon — hold it in mind</Text>
        )}
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
  on: {
    borderColor: 'rgba(167,139,250,0.5)',
    backgroundColor: 'rgba(167,139,250,0.25)',
  },
  submit: { marginTop: 8 },
  hint: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 8,
  },
});
