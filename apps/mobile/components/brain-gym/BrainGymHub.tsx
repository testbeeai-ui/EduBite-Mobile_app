import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@edubite/ui';
import { CATEGORY_META, GAMES, getGame } from '../../lib/brain-gym/registry';
import { useBrainGym } from '../../lib/brain-gym/hooks/useBrainGym';
import type { GameCategory, GameId } from '../../lib/brain-gym/types';
import { GameShell } from './GameShell';

const FILTERS: Array<'All' | GameCategory> = [
  'All',
  'memory',
  'logic',
  'visual',
  'speed',
];

export function BrainGymHub() {
  const { progress, openGame, hubTab, setHubTab, toggleFav } = useBrainGym();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');

  const dailyId = progress.dailyChallenge?.gameId ?? 'sequence-memory';
  const dailyMeta = getGame(dailyId);

  const featured = useMemo(() => {
    const byPlays = [...GAMES].sort(
      (a, b) =>
        (progress.games[b.id]?.plays ?? 0) - (progress.games[a.id]?.plays ?? 0),
    );
    return byPlays.slice(0, 4);
  }, [progress.games]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      if (filter !== 'All' && g.category !== filter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some((t) => t.includes(q))
      );
    });
  }, [filter, query]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroScene}>
          <LinearGradient
            colors={['rgba(127,119,221,0.22)', '#0B0E16']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroCubeWrap}>
            <LinearGradient
              colors={[theme.colors.purple, '#4a44a8']}
              style={styles.heroCube}
            >
              <Text style={styles.heroCubeText}>BRAIN{'\n'}GYM</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.pad}>
          <Text style={styles.eyebrow}>FUNCTION 03 · GO DEEPER</Text>
          <Text style={styles.title}>Brain Gym</Text>
          <View style={styles.statPills}>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>🔥 {progress.streak}d streak</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>🏆 {progress.totalWins} wins</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>
                ▶ {progress.totalPlays} plays
              </Text>
            </View>
          </View>
          <Text style={styles.desc}>
            15 mini-games — memory, logic, visual & speed. Play on-device. Progress
            saves to your Brain Gym DB.
          </Text>

          <View style={styles.tabs}>
            {(
              [
                ['hub', '▦ Games'],
                ['progress', '☆ Progress'],
                ['leaderboard', '🏆 Ranks'],
              ] as const
            ).map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => setHubTab(key)}
                style={[styles.tab, hubTab === key && styles.tabActive]}
              >
                <Text
                  style={[styles.tabText, hubTab === key && styles.tabTextActive]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {hubTab === 'hub' ? (
            <>
              <Pressable
                style={styles.dailyCard}
                onPress={() => openGame(dailyId, true)}
              >
                <Text style={styles.dailyEyebrow}>DAILY CHALLENGE</Text>
                <Text style={styles.dailyTitle}>
                  {dailyMeta.emoji} {dailyMeta.name}
                </Text>
                <Text style={styles.dailyDesc}>{dailyMeta.description}</Text>
                <Text style={styles.dailyCta}>
                  {progress.dailyChallenge?.completed
                    ? 'Completed · Play again'
                    : 'Start daily'}
                </Text>
              </Pressable>

              <TextInput
                style={styles.search}
                placeholder="Search games"
                placeholderTextColor={theme.colors.textDim}
                value={query}
                onChangeText={setQuery}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {FILTERS.map((f) => {
                  const label =
                    f === 'All' ? 'All' : `${CATEGORY_META[f].emoji} ${CATEGORY_META[f].label}`;
                  return (
                    <Pressable
                      key={f}
                      onPress={() => setFilter(f)}
                      style={[
                        styles.filterChip,
                        filter === f && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          filter === f && styles.filterTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.section}>Featured</Text>
              <View style={styles.grid2}>
                {featured.map((g) => (
                  <GameCard
                    key={g.id}
                    id={g.id}
                    onOpen={() => openGame(g.id)}
                    onFav={() => toggleFav(g.id)}
                    best={progress.games[g.id]?.bestScore ?? 0}
                    fav={!!progress.games[g.id]?.favorite}
                  />
                ))}
              </View>

              <Text style={styles.section}>All games</Text>
              {filtered.map((g) => (
                <Pressable
                  key={g.id}
                  style={styles.listRow}
                  onPress={() => openGame(g.id)}
                >
                  <View
                    style={[styles.listIcon, { backgroundColor: g.color + '33' }]}
                  >
                    <Text style={{ fontSize: 18 }}>{g.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{g.name}</Text>
                    <Text style={styles.listDesc}>{g.description}</Text>
                    <Text style={styles.listMeta}>
                      Best {progress.games[g.id]?.bestScore ?? 0} · ~
                      {Math.round(g.estimatedSeconds / 60) || 1}m
                    </Text>
                  </View>
                  <Pressable onPress={() => toggleFav(g.id)} hitSlop={8}>
                    <Text>
                      {progress.games[g.id]?.favorite ? '★' : '☆'}
                    </Text>
                  </Pressable>
                </Pressable>
              ))}
            </>
          ) : null}

          {hubTab === 'progress' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your progress</Text>
              <Text style={styles.cardBody}>
                Plays {progress.totalPlays} · Wins {progress.totalWins} · RDM
                earned {progress.rdmEarned}
              </Text>
              <Text style={styles.cardBody}>
                Badges: {progress.badges.length ? progress.badges.join(', ') : '—'}
              </Text>
              {progress.recentGameIds.map((id) => {
                const g = getGame(id);
                const s = progress.games[id];
                return (
                  <Pressable
                    key={id}
                    style={styles.listRow}
                    onPress={() => openGame(id)}
                  >
                    <Text style={styles.listTitle}>
                      {g.emoji} {g.name}
                    </Text>
                    <Text style={styles.listMeta}>
                      Best {s?.bestScore ?? 0} · {s?.wins ?? 0} wins
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {hubTab === 'leaderboard' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ranks</Text>
              <Text style={styles.cardBody}>
                Personal bests sync to your Brain Gym progress row. Global
                leaderboard uses the same Edubite DB when available.
              </Text>
              {[...GAMES]
                .sort(
                  (a, b) =>
                    (progress.games[b.id]?.bestScore ?? 0) -
                    (progress.games[a.id]?.bestScore ?? 0),
                )
                .slice(0, 8)
                .map((g, i) => (
                  <Text key={g.id} style={styles.rankRow}>
                    {i + 1}. {g.emoji} {g.name} — {progress.games[g.id]?.bestScore ?? 0}
                  </Text>
                ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <GameShell />
    </View>
  );
}

function GameCard({
  id,
  onOpen,
  onFav,
  best,
  fav,
}: {
  id: GameId;
  onOpen: () => void;
  onFav: () => void;
  best: number;
  fav: boolean;
}) {
  const g = getGame(id);
  return (
    <Pressable style={styles.featCard} onPress={onOpen}>
      <View style={styles.featTop}>
        <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
        <Pressable onPress={onFav} hitSlop={8}>
          <Text>{fav ? '★' : '☆'}</Text>
        </Pressable>
      </View>
      <Text style={styles.featTitle}>{g.name}</Text>
      <Text style={styles.featMeta}>
        {CATEGORY_META[g.category].label} · Best {best}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingBottom: 40 },
  heroScene: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroCubeWrap: { transform: [{ rotate: '8deg' }] },
  heroCube: {
    width: 88,
    height: 88,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCubeText: {
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 16,
  },
  pad: { paddingHorizontal: 16 },
  eyebrow: {
    color: theme.colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  desc: {
    color: theme.colors.textDim,
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 20,
  },
  statPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  statPill: {
    backgroundColor: theme.colors.cardHi,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statPillText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: theme.colors.purpleSoft },
  tabText: { color: theme.colors.textDim, fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: theme.colors.purple },
  dailyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
  },
  dailyEyebrow: {
    color: theme.colors.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dailyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  dailyDesc: { color: theme.colors.textDim, marginTop: 4 },
  dailyCta: {
    color: theme.colors.purple,
    fontWeight: '800',
    marginTop: 10,
  },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardHi,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.cardHi,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: theme.colors.purple },
  filterText: { color: theme.colors.textDim, fontSize: 12 },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  section: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 6,
  },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  featCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featTitle: { color: theme.colors.text, fontWeight: '700' },
  featMeta: { color: theme.colors.textDim, fontSize: 11, marginTop: 4 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: { color: theme.colors.text, fontWeight: '700' },
  listDesc: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  listMeta: { color: theme.colors.textFaint, fontSize: 11, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 16 },
  cardBody: { color: theme.colors.textDim, marginTop: 8, lineHeight: 20 },
  rankRow: { color: theme.colors.text, marginTop: 8 },
});
