import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@edubite/ui';
import { useEdubiteData } from '../../hooks/useEdubiteData';

export default function HomeScreen() {
  const { rewardMap, gameState, profile } = useEdubiteData();

  const userRdm = profile?.rdm ?? gameState?.payload?.rdm ?? 0;
  const targetRdm = rewardMap['challenge.target_rdm']?.amount ?? 5000;
  const currentStreak = gameState?.payload?.streak ?? 0;
  const habitsChecked = gameState?.payload?.habitsChecked ?? 0;

  const challengeProgressPct = Math.min(100, Math.floor((userRdm / targetRdm) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* Curious Starter Card */}
      <View style={styles.card}>
        <View style={styles.lvlTop}>
          <View style={styles.lvlRing}>
            <Svg width="56" height="56" viewBox="0 0 56 56" style={styles.svgRotated}>
              <Circle cx="28" cy="28" r="23" fill="none" stroke={theme.colors.cardHi} strokeWidth="6" />
              <Circle 
                cx="28" cy="28" r="23" 
                fill="none" stroke={theme.colors.teal} strokeWidth="6" 
                strokeLinecap="round" strokeDasharray="144.5" strokeDashoffset={144.5 - (144.5 * Math.min(userRdm, 500)) / 500} 
              />
            </Svg>
            <View style={styles.lvlCenter}>
              <Text style={styles.lvlCenterText}>Lv1</Text>
            </View>
          </View>
          
          <View style={styles.lvlInfo}>
            <View style={styles.lvlNameRow}>
              <Text style={styles.lvlTitle}>{profile?.name || 'Curious Starter'}</Text>
              <View style={styles.lvlBadge}>
                <Text style={styles.lvlBadgeText}>Lv.1</Text>
              </View>
            </View>
            <Text style={styles.lvlSub}>{Math.max(0, 500 - userRdm)} RDM to Level 2</Text>
          </View>
          
          <Text style={styles.lvlPct}>{Math.floor((userRdm / 500) * 100)}% to Lv2</Text>
        </View>
      </View>

      {/* August Challenge Card */}
      <View style={styles.card}>
        <View style={styles.chalTop}>
          <View style={styles.chalIcon}>
            <Text style={styles.chalIconText}>🏆</Text>
          </View>
          <View style={styles.chalInfo}>
            <Text style={styles.chalTitle}>August 2026 Challenge</Text>
            <Text style={styles.chalSub}>Reach {targetRdm.toLocaleString()} RDM to unlock August 2026</Text>
          </View>
          <View style={styles.lockPill}>
            <Text style={styles.lockPillText}>🔒 Locked</Text>
          </View>
        </View>
        
        <View style={styles.chalProgRow}>
          <Text style={styles.chalProgText}>Progress to unlock</Text>
          <Text style={styles.chalProgValue}>{userRdm.toLocaleString()} / {targetRdm.toLocaleString()} RDM</Text>
        </View>
        <View style={styles.chalTrack}>
          <View style={[styles.chalFill, { width: `${challengeProgressPct}%` }]} />
        </View>
        
        <TouchableOpacity style={styles.learnBtn} onPress={() => { console.log('TODO: Read-only mode - Learn How modal'); }}>
          <Text style={styles.learnBtnText}>ⓘ Learn How? — Conditions & Benefits</Text>
        </TouchableOpacity>
      </View>

      {/* Consistency Corner */}
      <View style={styles.card}>
        <View style={styles.ccHead}>
          <View style={styles.ccHeadLeft}>
            <View style={styles.ccIcon}><Text style={styles.ccIconText}>🔥</Text></View>
            <View>
              <Text style={styles.ccTitle}>Consistency Corner</Text>
              <Text style={styles.ccSub}>Daily Check-in & Streak Meter</Text>
            </View>
          </View>
          <View style={styles.ccBadge}>
            <Text style={styles.ccBadgeText}>🔥 {currentStreak} Day Streak</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardAlt, { marginBottom: 10 }]}>
          <View style={styles.checkinTop}>
            <View style={styles.checkinTopLeft}>
              <View style={styles.leafIcon}><Text style={styles.leafIconText}>🌱</Text></View>
              <View>
                <Text style={styles.ctTitle}>Daily check-in</Text>
                <Text style={styles.ctSub}>Habits tracker progress</Text>
              </View>
            </View>
            <View style={styles.checkinCountBadge}>
              <Text style={styles.checkinCountText}>{habitsChecked}/8</Text>
            </View>
          </View>
          
          <View style={styles.habitDots}>
            {[1,2,3,4,5,6,7,8].map((i) => (
              <View key={i} style={[styles.hdot, i <= habitsChecked && { backgroundColor: theme.colors.teal }]} />
            ))}
          </View>
          
          <TouchableOpacity style={styles.checkinBtn} onPress={() => { console.log('TODO: Read-only mode - habit checkin'); }}>
            <Text style={styles.checkinBtnText}>Tap to check habits →</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.cardAlt, { marginBottom: 0 }]}>
          <View style={styles.smTop}>
            <View style={styles.flmIcon}><Text style={styles.flmIconText}>🔥</Text></View>
            <View>
              <Text style={styles.smTitle}>Streak Meter</Text>
              <Text style={styles.smSub}>5 daily streak criteria</Text>
            </View>
          </View>
          
          <View style={styles.smStats}>
            <View style={styles.smStat}>
              <Text style={[styles.smStatV, { color: theme.colors.teal }]}>{currentStreak}</Text>
              <Text style={styles.smStatK}>DAYS</Text>
            </View>
            <View style={styles.smStat}>
              <Text style={[styles.smStatV, { color: theme.colors.blue }]}>{userRdm}</Text>
              <Text style={styles.smStatK}>TOTAL RDM</Text>
            </View>
            <View style={styles.smStat}>
              <Text style={[styles.smStatV, { color: theme.colors.blue }]}>{habitsChecked}/8</Text>
              <Text style={styles.smStatK}>HABITS</Text>
            </View>
          </View>
          
          <View style={styles.smFoot}>
            <Text style={styles.smFootText}>Habits contribute to full day</Text>
            <Text style={styles.smFootDet}>Details →</Text>
          </View>
        </View>
      </View>

      {/* Stat Trio */}
      <View style={styles.statTrio}>
        <View style={[styles.statMini, styles.smAmber]}>
          <Text style={styles.si}>🔥</Text>
          <Text style={styles.sv}>{currentStreak} Days</Text>
          <Text style={styles.sk}>CURRENT STREAK</Text>
        </View>
        <View style={[styles.statMini, styles.smTeal]}>
          <Text style={styles.si}>⚡</Text>
          <Text style={styles.sv}>0/1 Full</Text>
          <Text style={styles.sk}>WEEK PROGRESS</Text>
        </View>
        <View style={[styles.statMini, styles.smPink]}>
          <Text style={styles.si}>🎯</Text>
          <Text style={styles.sv}>0/1 Full</Text>
          <Text style={styles.sk}>28-DAY JOURNEY</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.card}>
        <Text style={styles.legendTitle}>CRITERIA LEGEND</Text>
        <View style={styles.legendWrap}>
          {[
            { label: 'Daily Dose', color: theme.colors.teal },
            { label: 'Fun Brain', color: theme.colors.amber },
            { label: 'Puzzles', color: theme.colors.pink },
            { label: 'Habits', color: theme.colors.blue },
            { label: 'Pledge', color: theme.colors.purple },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.ldot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* First Week */}
      <View style={styles.secTitleRow}>
        <Text style={styles.secTitleSpark}>✦</Text>
        <Text style={styles.secTitleText}>Your first week</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
        <View style={[styles.dayChip, styles.dayChipJoined]}>
          <Text style={styles.dtag}>DAY 1</Text>
          <Text style={[styles.dname, styles.dnameJoined]}>Joined</Text>
          <View style={styles.dayDots}>
            <View style={[styles.ddot, { backgroundColor: theme.colors.teal }]} />
            <View style={[styles.ddot, { backgroundColor: theme.colors.amber }]} />
            <View style={[styles.ddot, { backgroundColor: theme.colors.pink }]} />
            <View style={[styles.ddot, { backgroundColor: theme.colors.blue }]} />
            <View style={[styles.ddot, { backgroundColor: theme.colors.purple }]} />
          </View>
        </View>
        
        {[2,3,4,5,6,7].map((day) => (
          <View key={day} style={styles.dayChip}>
            <Text style={styles.dtag}>SOON</Text>
            <Text style={styles.dname}>Day {day}</Text>
            <View style={styles.dayDots}>
              {[1,2,3,4,5].map((d) => <View key={d} style={styles.ddot} />)}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* First 4 weeks */}
      <View style={styles.secTitleRow}>
        <Text style={styles.secTitleSpark}>✦</Text>
        <Text style={styles.secTitleText}>Your first 4 weeks</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.calHead}>
          {['S','M','T','W','T','F','S'].map((d, i) => <Text key={i} style={styles.calHeadText}>{d}</Text>)}
        </View>
        <View style={styles.calGrid}>
          {[...Array(28)].map((_, i) => {
            const isToday = i === 0;
            return (
              <View key={i} style={[styles.calCell, isToday && styles.calCellToday]}>
                <Text style={[styles.calCellText, isToday && styles.calCellTextToday]}>{i + 1}</Text>
              </View>
            )
          })}
        </View>
        <Text style={styles.calFoot}>Day 1 · Joined Aug 7 · Row 1: Weeks 1–2 · Row 2: Weeks 3–4</Text>
        
        <View style={styles.heatLegend}>
          <Text style={styles.heatLegendText}>Less</Text>
          <View style={[styles.sq, { backgroundColor: '#1B2330' }]} />
          <View style={[styles.sq, { backgroundColor: 'rgba(29,158,117,0.35)' }]} />
          <View style={[styles.sq, { backgroundColor: 'rgba(29,158,117,0.7)' }]} />
          <View style={[styles.sq, { backgroundColor: theme.colors.teal }]} />
          <Text style={styles.heatLegendText}>More</Text>
        </View>
      </View>

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
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardAlt: {
    backgroundColor: theme.colors.cardAlt,
  },
  // Curious Starter
  lvlTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  lvlRing: { width: 56, height: 56, position: 'relative' },
  svgRotated: { transform: [{ rotate: '-90deg' }] },
  lvlCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  lvlCenterText: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 13, color: theme.colors.teal },
  lvlInfo: { flex: 1 },
  lvlNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  lvlTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  lvlBadge: { backgroundColor: theme.colors.tealSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  lvlBadgeText: { fontSize: 10, fontWeight: '800', color: theme.colors.teal, fontFamily: theme.fonts.body },
  lvlSub: { fontSize: 11, color: theme.colors.textFaint, marginTop: 3, fontFamily: theme.fonts.body },
  lvlPct: { fontSize: 10.5, color: theme.colors.textDim, alignSelf: 'flex-start', fontFamily: theme.fonts.body },

  // August Challenge
  chalTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  chalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#574fc9', alignItems: 'center', justifyContent: 'center' }, // using solid for fallback of linear gradient
  chalIconText: { fontSize: 17 },
  chalInfo: { flex: 1 },
  chalTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  chalSub: { fontSize: 10.5, color: theme.colors.textFaint, marginTop: 2, fontFamily: theme.fonts.body },
  lockPill: { backgroundColor: theme.colors.amberSoft, borderColor: 'rgba(239,159,39,0.3)', borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 3 },
  lockPillText: { fontSize: 9.5, fontWeight: '700', color: theme.colors.amber, fontFamily: theme.fonts.body },
  chalProgRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  chalProgText: { fontSize: 11, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  chalProgValue: { fontSize: 11, fontWeight: '700', color: theme.colors.textDim, fontFamily: theme.fonts.body },
  chalTrack: { height: 6, borderRadius: 99, backgroundColor: theme.colors.cardHi, marginTop: 6, overflow: 'hidden' },
  chalFill: { width: '0%', height: '100%', borderRadius: 99, backgroundColor: theme.colors.purple }, // fallback gradient
  learnBtn: { marginTop: 12, padding: 11, borderRadius: 12, backgroundColor: 'rgba(127,119,221,0.06)', borderColor: 'rgba(127,119,221,0.3)', borderWidth: 1, alignItems: 'center' },
  learnBtnText: { color: theme.colors.purple, fontSize: 12, fontWeight: '700', fontFamily: theme.fonts.body },

  // Consistency Corner
  ccHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  ccHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  ccIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: theme.colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  ccIconText: { fontSize: 14 },
  ccTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  ccSub: { fontSize: 10.5, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  ccBadge: { backgroundColor: theme.colors.amberSoft, borderColor: 'rgba(239,159,39,0.3)', borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  ccBadgeText: { fontSize: 10, fontWeight: '700', color: theme.colors.amber, fontFamily: theme.fonts.body },

  checkinTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  checkinTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  leafIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  leafIconText: { fontSize: 13 },
  ctTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },
  ctSub: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  checkinCountBadge: { backgroundColor: theme.colors.tealSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  checkinCountText: { fontSize: 10.5, fontWeight: '800', color: theme.colors.teal, fontFamily: theme.fonts.body },
  habitDots: { flexDirection: 'row', gap: 5, marginBottom: 12 },
  hdot: { flex: 1, height: 7, borderRadius: 99, backgroundColor: theme.colors.cardHi, borderColor: theme.colors.borderSoft, borderWidth: 1 },
  checkinBtn: { width: '100%', padding: 11, borderRadius: 12, backgroundColor: theme.colors.tealSoft, borderColor: 'rgba(29,158,117,0.35)', borderWidth: 1, alignItems: 'center' },
  checkinBtnText: { color: theme.colors.teal, fontSize: 12, fontWeight: '700', fontFamily: theme.fonts.body },

  smTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  flmIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  flmIconText: { fontSize: 13 },
  smTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },
  smSub: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  smStats: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  smStat: { flex: 1, backgroundColor: theme.colors.cardHi, borderColor: theme.colors.borderSoft, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  smStatV: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 15 },
  smStatK: { fontSize: 8, color: theme.colors.textFaint, letterSpacing: 0.3, marginTop: 2, fontFamily: theme.fonts.body },
  smFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smFootText: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  smFootDet: { fontSize: 10, color: theme.colors.blue, fontWeight: '700', fontFamily: theme.fonts.body },

  // Stat Trio
  statTrio: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  statMini: { flex: 1, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1 },
  smAmber: { backgroundColor: theme.colors.amberSoft, borderColor: 'rgba(239,159,39,0.25)' },
  smTeal: { backgroundColor: theme.colors.tealSoft, borderColor: 'rgba(29,158,117,0.25)' },
  smPink: { backgroundColor: theme.colors.pinkSoft, borderColor: 'rgba(212,83,126,0.25)' },
  si: { fontSize: 15, marginBottom: 4 },
  sv: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 13.5, color: theme.colors.text },
  sk: { fontSize: 8, color: theme.colors.textFaint, letterSpacing: 0.3, marginTop: 2, fontFamily: theme.fonts.body },

  // Legend
  legendTitle: { fontSize: 10.5, color: theme.colors.textFaint, letterSpacing: 0.3, fontWeight: '700', marginBottom: 10, fontFamily: theme.fonts.body },
  legendWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, rowGap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6 },
  ldot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11.5, color: theme.colors.textDim, fontFamily: theme.fonts.body },

  // Sections
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 2, marginTop: 16, marginBottom: 10 },
  secTitleSpark: { color: theme.colors.teal, fontSize: 13.5, fontWeight: '700' },
  secTitleText: { fontSize: 13.5, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },

  // Week Scroll
  weekScroll: { paddingBottom: 4 },
  weekScrollContent: { gap: 9 },
  dayChip: { width: 70, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, marginRight: 9 },
  dayChipJoined: { backgroundColor: theme.colors.amberSoft, borderColor: theme.colors.amber },
  dtag: { fontSize: 8.5, color: theme.colors.textFaint, fontWeight: '700', letterSpacing: 0.3, fontFamily: theme.fonts.body },
  dname: { fontSize: 11.5, fontWeight: '700', marginVertical: 7, color: theme.colors.text, fontFamily: theme.fonts.body },
  dnameJoined: { color: theme.colors.amber },
  dayDots: { flexDirection: 'row', justifyContent: 'center', gap: 3 },
  ddot: { width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: theme.colors.border },

  // Calendar
  calHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  calHeadText: { flex: 1, textAlign: 'center', fontSize: 9.5, color: theme.colors.textFaint, fontWeight: '700', fontFamily: theme.fonts.body },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  calCell: { width: '13%', aspectRatio: 1 / 0.85, borderRadius: 8, backgroundColor: theme.colors.cardHi, borderColor: theme.colors.borderSoft, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  calCellToday: { backgroundColor: theme.colors.amberSoft, borderColor: theme.colors.amber },
  calCellText: { fontSize: 10.5, color: theme.colors.textDim, fontWeight: '600', fontFamily: theme.fonts.body },
  calCellTextToday: { color: theme.colors.amber, fontWeight: '800' },
  calFoot: { fontSize: 10, color: theme.colors.textFaint, marginTop: 10, lineHeight: 15, fontFamily: theme.fonts.body },
  heatLegend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  heatLegendText: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  sq: { width: 8, height: 8, borderRadius: 2 },
});
