import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useGame } from '../../lib/game/GameProvider';
import { isFullDay } from '../../lib/game/state';

export default function ProfileScreen() {
  const router = useRouter();
  const { state, level, criteria } = useGame();

  const name = level.current.name;
  const rdm = state.rdm ?? 0;
  const initialLetter = name.charAt(0).toUpperCase();
  const habitsChecked = state.habits.filter((h) => h.done).length;
  const habitsTotal = state.habits.length || 8;
  const funBest = state.funbrain.highScore ?? 0;
  const achievementCount = useMemo(() => {
    let n = 0;
    if (state.streak >= 7) n += 1;
    if (state.streak >= 30) n += 1;
    if (rdm >= 1000) n += 1;
    if (rdm >= 5000) n += 1;
    if (Object.values(state.doseDayLog).some((d) => d.correct >= d.total && d.total > 0)) n += 1;
    if (funBest >= 100) n += 1;
    if (habitsChecked === habitsTotal) n += 1;
    if (criteria.pledgeAM && criteria.pledgePM) n += 1;
    return n;
  }, [criteria.pledgeAM, criteria.pledgePM, funBest, habitsChecked, habitsTotal, rdm, state.doseDayLog, state.streak]);

  const fullDays = Object.values(state.dayCriteriaLog).filter((d) => isFullDay(d)).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.userCardWrap}>
        <LinearGradient
          colors={['rgba(127,119,221,0.14)', theme.colors.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.userCard}
        >
          <View style={styles.userTop}>
            <View style={styles.userAvWrap}>
              <LinearGradient colors={[theme.colors.purple, '#a13fd6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.userAv}>
                <Text style={styles.userAvText}>{initialLetter}</Text>
              </LinearGradient>
              <View style={styles.lvBadge}>
                <Text style={styles.lvBadgeText}>Lv.{level.current.level}</Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>
                Silent learner session · Class {state.dose.currentClass}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.ubadge, styles.ubadgeTeal]}>
              <Text style={[styles.ubadgeText, styles.ubadgeTextTeal]}>✓ Edubite Connected</Text>
            </View>
            <View style={[styles.ubadge, styles.ubadgePurple]}>
              <Text style={[styles.ubadgeText, styles.ubadgeTextPurple]}>✨ {level.current.name}</Text>
            </View>
            <View style={[styles.ubadge, styles.ubadgeGray]}>
              <Text style={[styles.ubadgeText, styles.ubadgeTextGray]}>
                🌐 Joined {state.joinedDate.slice(0, 4)}
              </Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Progress saves automatically via anonymous session — no login page in this app.
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.rdmCard}>
        <View style={styles.rdmTop}>
          <View style={styles.rdmIc}><Text style={styles.rdmIcText}>🪙</Text></View>
          <View style={styles.rdmInfo}>
            <Text style={styles.rdmTitle}>{rdm.toLocaleString()} RDM Earned</Text>
            <Text style={styles.rdmSub}>
              Level {level.current.level} · {level.current.name}
            </Text>
          </View>
          <View style={styles.rdmRight}>
            <Text style={styles.rdmPct}>{level.progress}% to Lv{level.next.level}</Text>
            <Text style={styles.rdmNeed}>{level.rdmToNext} RDM needed</Text>
          </View>
        </View>

        <View style={styles.rdmTrack}>
          <LinearGradient
            colors={[theme.colors.teal, theme.colors.blue, theme.colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.rdmFill, { width: `${Math.min(100, level.progress)}%` }]}
          />
        </View>
      </View>

      <Text style={styles.secHeading}>Learning Statistics</Text>

      <View style={styles.statGrid}>
        <View style={styles.statBox}>
          <View style={[styles.statIc, { backgroundColor: theme.colors.amberSoft }]}>
            <Text style={{ color: theme.colors.amber, fontSize: 14 }}>🔥</Text>
          </View>
          <Text style={styles.statVal}>{state.streak}</Text>
          <Text style={styles.statLbl}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIc, { backgroundColor: theme.colors.purpleSoft }]}>
            <Text style={{ color: theme.colors.purple, fontSize: 14 }}>⚡</Text>
          </View>
          <Text style={styles.statVal}>{funBest}</Text>
          <Text style={styles.statLbl}>FunBrain Best</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIc, { backgroundColor: theme.colors.tealSoft }]}>
            <Text style={{ color: theme.colors.teal, fontSize: 14 }}>✓</Text>
          </View>
          <Text style={styles.statVal}>{habitsChecked}/{habitsTotal}</Text>
          <Text style={styles.statLbl}>Habits Today</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIc, { backgroundColor: theme.colors.tealSoft }]}>
            <Text style={{ color: theme.colors.teal, fontSize: 14 }}>🏆</Text>
          </View>
          <Text style={styles.statVal}>{achievementCount}</Text>
          <Text style={styles.statLbl}>Achievements</Text>
        </View>
      </View>

      <Text style={styles.metaLine}>{fullDays} full days logged · {rdm} RDM total</Text>

      <TouchableOpacity style={styles.linkCard} activeOpacity={0.7} onPress={() => router.navigate('/achievements')}>
        <View>
          <Text style={[styles.linkLbl, { color: theme.colors.teal }]}>ACHIEVEMENTS</Text>
          <Text style={styles.linkDesc}>View unlocked badges & rewards</Text>
        </View>
        <Text style={styles.linkIc}>🎖</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkCard} activeOpacity={0.7} onPress={() => router.navigate('/habits')}>
        <View>
          <Text style={[styles.linkLbl, { color: theme.colors.teal }]}>HABITS</Text>
          <Text style={styles.linkDesc}>Check off daily study goals</Text>
        </View>
        <Text style={styles.linkIc}>✅</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkCard} activeOpacity={0.7} onPress={() => router.navigate('/inspiration')}>
        <View>
          <Text style={[styles.linkLbl, { color: theme.colors.purple }]}>INSPIRATION</Text>
          <Text style={styles.linkDesc}>Quote, role model & phenomena of the day</Text>
        </View>
        <Text style={styles.linkIc}>🌟</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 26,
  },
  userCardWrap: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  userCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  userTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, marginBottom: 12 },
  userAvWrap: { position: 'relative' },
  userAv: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userAvText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  lvBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: theme.colors.teal, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.bg },
  lvBadgeText: { fontSize: 9, fontWeight: '800', color: '#062B1D', fontFamily: theme.fonts.body },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },
  userEmail: { fontSize: 11.5, color: theme.colors.textDim, marginTop: 2, fontFamily: theme.fonts.body },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  ubadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border },
  ubadgeTeal: { backgroundColor: theme.colors.tealSoft, borderColor: 'rgba(29,158,117,0.35)' },
  ubadgePurple: { backgroundColor: theme.colors.purpleSoft, borderColor: 'rgba(127,119,221,0.35)' },
  ubadgeGray: { backgroundColor: theme.colors.cardHi },
  ubadgeText: { fontSize: 10, fontWeight: '700', fontFamily: theme.fonts.body },
  ubadgeTextTeal: { color: theme.colors.teal },
  ubadgeTextPurple: { color: theme.colors.purple },
  ubadgeTextGray: { color: theme.colors.textDim },

  noteBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(55,138,221,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(55,138,221,0.25)',
  },
  noteText: { fontSize: 11, color: theme.colors.textDim, lineHeight: 16, fontFamily: theme.fonts.body },

  rdmCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 16, marginBottom: 20 },
  rdmTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rdmIc: { width: 38, height: 38, borderRadius: 11, backgroundColor: theme.colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  rdmIcText: { fontSize: 17 },
  rdmInfo: { flex: 1 },
  rdmTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },
  rdmSub: { fontSize: 11, color: theme.colors.textFaint, marginTop: 2, fontFamily: theme.fonts.body },
  rdmRight: { alignItems: 'flex-end' },
  rdmPct: { fontSize: 12, fontWeight: '800', color: theme.colors.teal, fontFamily: theme.fonts.body },
  rdmNeed: { fontSize: 10.5, color: theme.colors.textFaint, marginTop: 2, fontFamily: theme.fonts.body },

  rdmTrack: { height: 8, borderRadius: 99, backgroundColor: theme.colors.cardHi, overflow: 'hidden', marginTop: 14, flexDirection: 'row' },
  rdmFill: { height: '100%', borderRadius: 99 },

  secHeading: { fontSize: 14, fontWeight: '700', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, color: theme.colors.text, fontFamily: theme.fonts.body },
  metaLine: { fontSize: 11, color: theme.colors.textFaint, marginBottom: 14, fontFamily: theme.fonts.body },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 10 },
  statBox: { width: '50%', paddingHorizontal: 5, marginBottom: 10 },
  statIc: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statVal: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: theme.colors.text },
  statLbl: { fontSize: 10.5, color: theme.colors.textFaint, marginTop: 2, fontFamily: theme.fonts.body },

  linkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 15, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 10 },
  linkLbl: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, marginBottom: 4, fontFamily: theme.fonts.body },
  linkDesc: { fontSize: 11.5, color: theme.colors.textDim, fontFamily: theme.fonts.body },
  linkIc: { fontSize: 16, marginLeft: 10 },
});
