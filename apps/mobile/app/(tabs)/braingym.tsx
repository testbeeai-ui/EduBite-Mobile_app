import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useEdubiteData } from '../../hooks/useEdubiteData';

const featuredGames = [
  { id: '1', title: 'Sequence Memory', cat: 'Memory', best: 'Best 108 · ~1m', icon: '🔢', color: theme.colors.blue, bgColor: theme.colors.blueSoft },
  { id: '2', title: 'Sudoku', cat: 'Logic', best: 'Best 1,226 · ~3m', icon: '9', color: theme.colors.blue, bgColor: theme.colors.blueSoft },
  { id: '3', title: 'Reaction Time', cat: 'Speed', best: 'Best 0 · ~1m', icon: '⚡', color: theme.colors.amber, bgColor: theme.colors.amberSoft },
  { id: '4', title: 'Odd One Out', cat: 'Visual', best: 'Best 360 · ~1m', icon: '🔍', color: theme.colors.purple, bgColor: theme.colors.purpleSoft },
];

const allGames = [
  { id: '1', title: 'Sequence Memory', desc: 'Watch the tile order, then repeat it.', best: 'Best 108 · ~1m', icon: '🔢', color: theme.colors.blue, bgColor: theme.colors.blueSoft },
  { id: '2', title: 'Pattern Memory', desc: 'Memorize a grid pattern and recreate it.', best: 'Best 0 · ~1m', icon: '▦', color: theme.colors.textDim, bgColor: theme.colors.cardHi },
  { id: '3', title: 'Number Flash', desc: 'Numbers flash — recall them in order.', best: 'Best 0 · ~1m', icon: '🔢', color: theme.colors.blue, bgColor: theme.colors.blueSoft },
  { id: '4', title: 'Recall Reader', desc: 'Read a short passage, then answer from memory.', best: 'Best 0 · ~2m', icon: '📖', color: theme.colors.textDim, bgColor: theme.colors.cardHi },
  { id: '5', title: 'Letter Memory', desc: 'Memorize letters that flash on screen.', best: 'Best 0 · ~1m', icon: 'abc', color: theme.colors.blue, bgColor: theme.colors.blueSoft },
  { id: '6', title: 'Image Memory', desc: 'Study a grid of icons, then spot what changed.', best: 'Best 0 · ~1m', icon: '🖼', color: theme.colors.teal, bgColor: theme.colors.tealSoft },
  { id: '7', title: 'Sudoku', desc: 'Fill the mini grid with unique numbers.', best: 'Best 1,226 · ~3m', icon: '9', color: theme.colors.blue, bgColor: theme.colors.blueSoft },
  { id: '8', title: 'Minesweeper', desc: 'Clear the board without hitting mines.', best: 'Best 0 · ~2m', icon: '💣', color: theme.colors.purple, bgColor: theme.colors.purpleSoft },
  { id: '9', title: '2048', desc: 'Slide tiles, merge numbers, reach 2048.', best: 'Best 0 · ~3m', icon: '🧱', color: theme.colors.amber, bgColor: theme.colors.amberSoft },
];

const filters = ['All', '🧠 Memory', '🧩 Logic', '👁 Visual', '⚡ Speed'];

export default function BrainGymScreen() {
  const { rewardMap, gameState } = useEdubiteData();
  const [activeTab, setActiveTab] = useState('Games');
  const [activeFilter, setActiveFilter] = useState('All');

  const streak = gameState?.payload?.bgStreak ?? 1;
  const wins = gameState?.payload?.bgWins ?? 3;
  const dailyBonusRdm = rewardMap['brain_gym.daily_win_bonus']?.amount ?? 25;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* Hero Scene */}
      <View style={styles.heroScene}>
        <LinearGradient
          colors={['rgba(127,119,221,0.22)', '#0B0E16']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.floatTag, styles.ftSpeed]}><Text style={styles.floatTagText}>⚡ Speed</Text></View>
        <View style={[styles.floatTag, styles.ftMemory]}><Text style={styles.floatTagText}>🧠 Memory</Text></View>
        <View style={[styles.floatTag, styles.ftLogic]}><Text style={styles.floatTagText}>🧩 Logic</Text></View>
        
        <View style={styles.heroCubeWrap}>
          <LinearGradient colors={[theme.colors.purple, '#4a44a8']} style={styles.heroCube} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Text style={styles.heroCubeText}>BRAIN{"\n"}GYM</Text>
          </LinearGradient>
        </View>

        <Text style={[styles.floatEmoji, styles.fe1]}>🎯</Text>
        <Text style={[styles.floatEmoji, styles.fe2]}>🕵️</Text>
      </View>

      <View style={styles.pad}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.dot, { backgroundColor: theme.colors.blue }]} />
          <Text style={[styles.eyebrowText, { color: theme.colors.blue }]}>FUNCTION 03 · GO DEEPER</Text>
        </View>
        <Text style={styles.title}>Brain Gym</Text>

        <View style={styles.statPills}>
          <View style={styles.statPill}><Text style={styles.statPillText}>🔥 {streak}d streak</Text></View>
          <View style={styles.statPill}><Text style={styles.statPillText}>🏆 {wins} wins</Text></View>
          <View style={styles.statPill}><Text style={styles.statPillText}>⏱ 0/30 min today</Text></View>
        </View>

        <Text style={styles.desc}>15 mini-games — memory, logic, visual & speed. Short sessions. Real gains. Earn RDM while you train.</Text>

        <View style={styles.tabs}>
          {['▦ Games', '☆ Progress', '🏆 Ranks'].map(tab => {
            const isActive = tab.includes(activeTab);
            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab.replace(/[^a-zA-Z]/g, '').trim())} style={[styles.tab, isActive && styles.tabActive]}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Daily Challenge */}
      <View style={styles.dailyCardWrap}>
        <LinearGradient colors={['rgba(239,159,39,0.14)', 'rgba(212,83,126,0.08)']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.dailyCard}>
          <View style={styles.dailyLeft}>
            <Text style={styles.dailyEyebrow}>DAILY CHALLENGE</Text>
            <Text style={styles.dailyTitle}>🖼 Image Memory</Text>
            <Text style={styles.dailySub}>Complete today for streak + {dailyBonusRdm} bonus RDM</Text>
          </View>
          <TouchableOpacity style={styles.startBtnWrap} onPress={() => { console.log('TODO: Read-only mode - start daily challenge'); }}>
            <LinearGradient colors={[theme.colors.teal, '#57d9a8']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start daily</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.pad}><Text style={styles.secLabel}>FEATURED</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {featuredGames.map(game => (
          <View key={game.id} style={styles.featCard}>
            <Text style={styles.star}>☆</Text>
            <View style={[styles.fic, { backgroundColor: game.bgColor }]}>
              <Text style={{ fontSize: 15, color: game.color }}>{game.icon}</Text>
            </View>
            <Text style={styles.ftitle} numberOfLines={2}>{game.title}</Text>
            <Text style={styles.fcat}>{game.cat}</Text>
            <Text style={styles.fbest}>{game.best}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search & Filters */}
      <View style={styles.searchRow}>
        <Text style={styles.sic}>🔍</Text>
        <Text style={{ flex: 1, color: theme.colors.textFaint, fontSize: 12.5, fontFamily: theme.fonts.body }}>Search games...</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {filters.map(f => {
          const isActive = f === activeFilter;
          return (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.fchip, isActive && styles.fchipActive]}>
              <Text style={[styles.fchipText, isActive && styles.fchipTextActive]}>{f}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.pad}><Text style={styles.secLabel}>ALL GAMES</Text></View>
      
      {/* Game Grid */}
      <View style={styles.gameGrid}>
        {allGames.map(game => (
          <View key={game.id} style={styles.gameCell}>
            <View style={styles.gameCard}>
              <Text style={styles.star}>☆</Text>
              <View style={[styles.gic, { backgroundColor: game.bgColor }]}>
                <Text style={{ fontSize: 14, color: game.color }}>{game.icon}</Text>
              </View>
              <Text style={styles.gtitle} numberOfLines={1}>{game.title}</Text>
              <Text style={styles.gdesc}>{game.desc}</Text>
              <Text style={styles.gbest}>{game.best}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.moreNote}>6 more games in the full library · scroll or filter to find them</Text>
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
    paddingBottom: 26,
  },
  pad: {
    paddingHorizontal: 16,
  },
  heroScene: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    height: 150,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0B0E16',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  heroCubeWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -39 }, { translateY: -39 }], // 78 / 2
    shadowColor: 'rgba(127,119,221,0.55)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  heroCube: {
    width: 78,
    height: 78,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCubeText: {
    color: '#fff',
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 11.5,
    lineHeight: 13.8,
    textAlign: 'center',
  },
  floatTag: {
    position: 'absolute',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  floatTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#fff',
    fontFamily: theme.fonts.body,
  },
  ftSpeed: { top: 16, left: 14, backgroundColor: 'rgba(239,159,39,0.85)' },
  ftMemory: { top: 14, right: 16, backgroundColor: 'rgba(212,83,126,0.85)' },
  ftLogic: { bottom: 16, right: 18, backgroundColor: 'rgba(29,158,117,0.85)' },
  floatEmoji: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.85,
  },
  fe1: { bottom: 12, left: 26 },
  fe2: { bottom: 34, left: '60%' },
  
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  eyebrowText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, fontFamily: theme.fonts.body },
  title: { fontSize: 22, fontWeight: '800', fontFamily: theme.fonts.heading, color: theme.colors.text, marginBottom: 12 },
  
  statPills: { flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginBottom: 14 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 999, backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  statPillText: { fontSize: 10.5, fontWeight: '700', color: theme.colors.textDim, fontFamily: theme.fonts.body },
  
  desc: { fontSize: 12, color: theme.colors.textDim, lineHeight: 18.6, marginBottom: 16, fontFamily: theme.fonts.body },
  
  tabs: { flexDirection: 'row', gap: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, marginBottom: 16 },
  tab: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.colors.teal },
  tabText: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  tabTextActive: { color: theme.colors.teal },
  
  dailyCardWrap: { marginHorizontal: 16, marginBottom: 20 },
  dailyCard: {
    paddingVertical: 14, paddingHorizontal: 15, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(239,159,39,0.3)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  dailyLeft: { flex: 1 },
  dailyEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: theme.colors.amber, marginBottom: 3, fontFamily: theme.fonts.body },
  dailyTitle: { fontSize: 13.5, fontWeight: '800', color: theme.colors.text, fontFamily: theme.fonts.body },
  dailySub: { fontSize: 10, color: theme.colors.textDim, marginTop: 2, fontFamily: theme.fonts.body },
  startBtnWrap: { borderRadius: 999, overflow: 'hidden' },
  startBtn: { paddingVertical: 9, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#08130F', fontWeight: '800', fontSize: 11.5, fontFamily: theme.fonts.body },

  secLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: theme.colors.textFaint, marginBottom: 10, fontFamily: theme.fonts.body },

  featScroll: { marginBottom: 20 },
  featCard: { width: 120, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 15, padding: 12, marginRight: 10 },
  star: { position: 'absolute', top: 9, right: 9, fontSize: 11, color: theme.colors.textFaint },
  fic: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  ftitle: { fontSize: 11.5, fontWeight: '700', lineHeight: 14.3, color: theme.colors.text, fontFamily: theme.fonts.body },
  fcat: { fontSize: 9, color: theme.colors.textFaint, marginTop: 3, fontFamily: theme.fonts.body },
  fbest: { fontSize: 9, color: theme.colors.textFaint, marginTop: 5, fontFamily: theme.fonts.body },

  searchRow: { marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 13 },
  sic: { color: theme.colors.textFaint, fontSize: 13 },
  
  filterScroll: { marginBottom: 16 },
  fchip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, marginRight: 7 },
  fchipActive: { backgroundColor: theme.colors.tealSoft, borderColor: 'rgba(29,158,117,0.4)' },
  fchipText: { fontSize: 11, fontWeight: '700', color: theme.colors.textDim, fontFamily: theme.fonts.body },
  fchipTextActive: { color: theme.colors.teal },

  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginHorizontal: -5 },
  gameCell: { width: '50%', paddingHorizontal: 5, marginBottom: 10 },
  gameCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 15, padding: 12 },
  gic: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gtitle: { fontSize: 12, fontWeight: '700', marginBottom: 4, color: theme.colors.text, fontFamily: theme.fonts.body },
  gdesc: { fontSize: 9.5, color: theme.colors.textFaint, lineHeight: 12.8, marginBottom: 7, minHeight: 26, fontFamily: theme.fonts.body },
  gbest: { fontSize: 9, color: theme.colors.textFaint, fontFamily: theme.fonts.body },

  moreNote: { textAlign: 'center', fontSize: 11, color: theme.colors.textFaint, paddingTop: 16, paddingBottom: 4, fontFamily: theme.fonts.body }
});
