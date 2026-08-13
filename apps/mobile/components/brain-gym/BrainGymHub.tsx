import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '@edubite/ui';
import { CATEGORY_META, GAMES, getGame } from '../../lib/brain-gym/registry';
import { useBrainGym } from '../../lib/brain-gym/hooks/useBrainGym';
import type { GameCategory, GameId } from '../../lib/brain-gym/types';
import { BrainGymScene3D } from './BrainGymScene3D';
import { GameShell } from './GameShell';

const FILTERS: Array<'All' | GameCategory> = [
  'All',
  'memory',
  'logic',
  'visual',
  'speed',
];

export function BrainGymHub() {
  const { progress, openGame, hubTab, setHubTab, toggleFav, activeGameId } =
    useBrainGym();
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
        <View style={styles.heroCard}>
          <View style={styles.heroScene} pointerEvents="auto">
            {!activeGameId ? <BrainGymScene3D /> : null}
          </View>
          <View style={styles.heroOverlay} pointerEvents="box-none">
            <Text style={styles.eyebrow} pointerEvents="none">
              FUNCTION 03 · GO DEEPER
            </Text>
            <Text style={styles.title} pointerEvents="none">
              Brain Gym
            </Text>
            <View style={styles.statPills} pointerEvents="none">
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
            <Text style={styles.desc} pointerEvents="none">
              15 mini-games — memory, logic, visual & speed.
            </Text>
          </View>
        </View>

        <View style={styles.pad}>
          <View style={styles.tabs} accessibilityRole="tablist">
            {(
              [
                ['hub', 'Games', '▦'],
                ['progress', 'Progress', '☆'],
                ['leaderboard', 'Ranks', '🏆'],
              ] as const
            ).map(([key, label, icon]) => {
              const active = hubTab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setHubTab(key)}
                  style={[styles.tab, active && styles.tabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={label}
                >
                  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                    {icon}
                  </Text>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
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
                Personal bests from your synced Brain Gym progress. Global
                multiplayer ranks are not live yet (same as Edubite web).
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
  heroCard: {
    height: 400,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.2)',
    backgroundColor: '#0b1220',
  },
  heroScene: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroOverlay: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  desc: {
    color: theme.colors.textDim,
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 20,
  },
  statPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  statPill: {
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statPillText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabActive: {
    backgroundColor: theme.colors.purpleSoft,
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.45)',
  },
  tabIcon: { fontSize: 14, color: theme.colors.textDim },
  tabIconActive: { color: theme.colors.purple },
  tabText: {
    color: theme.colors.textDim,
    fontWeight: '700',
    fontSize: 12,
  },
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
