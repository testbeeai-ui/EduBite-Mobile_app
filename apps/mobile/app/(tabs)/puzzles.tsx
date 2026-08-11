import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useEdubiteData } from '../../hooks/useEdubiteData';

export default function PuzzlesScreen() {
  const { gameState } = useEdubiteData();
  const streak = gameState?.payload?.streak ?? 0;

  const [hintVisible, setHintVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [workText, setWorkText] = useState('');
  
  // Timer State (23h 57m 49s)
  const [totalSeconds, setTotalSeconds] = useState(23 * 3600 + 57 * 60 + 49);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => n < 10 ? `0${n}` : n;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const handleLockAttempt = () => {
    // TODO: Read-only mode - puzzle answer submission disabled
    console.log('TODO: Read-only mode - puzzle answer lock attempt');
    if (!isLocked) {
      setIsLocked(true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* Hero Section */}
      <View style={styles.hero}>
        <LinearGradient
          colors={['rgba(239,159,39,0.14)', 'transparent']}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>FUNCTION 03B · ONE A DAY</Text>
        </View>
        <Text style={styles.heroTitle}>Puzzles</Text>
        <Text style={styles.heroDesc}>One Class XI / XII brain-bender each day. Work it out today — the official answer opens tomorrow.</Text>
        
        <View style={styles.heroPills}>
          <View style={[styles.hpill, styles.hpillAmber]}><Text style={[styles.hpillText, styles.hpillTextAmber]}>🔥 {streak}d streak</Text></View>
          <View style={styles.hpill}><Text style={styles.hpillText}>ⓘ</Text></View>
          <View style={styles.hpill}><Text style={styles.hpillText}>🎓 0 solved days</Text></View>
          <View style={[styles.hpill, styles.hpillTeal]}><Text style={[styles.hpillText, styles.hpillTextTeal]}>📅 Aug 8</Text></View>
        </View>
      </View>

      {/* Today's Puzzle */}
      <View style={styles.card}>
        <View style={styles.ptitleRow}>
          <Text style={styles.ptitle}>Mathematics Olympiad</Text>
          <View style={styles.diffPill}><Text style={styles.diffPillText}>Medium</Text></View>
        </View>
        
        <Text style={styles.qtext}>In how many ways can 20 identical chocolates be distributed among 4 children such that each child receives at least 2 but no more than 8 chocolates?</Text>

        <TouchableOpacity style={styles.hintLink} onPress={() => setHintVisible(!hintVisible)}>
          <Text style={styles.hintLinkText}>💡 Peek a hint</Text>
        </TouchableOpacity>
        
        {hintVisible && (
          <View style={styles.hintReveal}>
            <Text style={styles.hintRevealText}>Hint reveals a starting approach here — full hint content lives in this space.</Text>
          </View>
        )}

        <Text style={styles.workLabel}>YOUR WORKING & ANSWER</Text>
        <TextInput
          style={styles.workArea}
          placeholder="Scratch your reasoning here... official answer unlocks tomorrow."
          placeholderTextColor={theme.colors.textFaint}
          multiline
          textAlignVertical="top"
          value={workText}
          onChangeText={setWorkText}
          editable={!isLocked}
        />

        <TouchableOpacity onPress={handleLockAttempt} disabled={isLocked} style={styles.lockBtnWrap}>
          <LinearGradient 
            colors={isLocked ? [theme.colors.cardHi, theme.colors.cardHi] : [theme.colors.amber, '#c9820f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockBtn}
          >
            <Text style={[styles.lockBtnText, isLocked && styles.lockBtnTextLocked]}>
              {isLocked ? "Attempt locked ✓" : "Lock in attempt"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {isLocked && (
          <Text style={styles.lockNote}>✓ Attempt locked — come back tomorrow for the reveal</Text>
        )}
      </View>

      {/* Countdown */}
      <View style={styles.card}>
        <Text style={styles.unlocksNote}>Come back tomorrow to compare your attempt with the reveal.</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.unlocksLbl}>UNLOCKS IN</Text>
          <Text style={styles.countdownVal}>🕐 {formatTime(totalSeconds)}</Text>
        </View>
        <View style={styles.sealedBoxWrap}>
          <View style={styles.sealedBox}>
            <Text style={styles.sealedBoxText}>SEALED UNTIL AUG 8 ENDS</Text>
          </View>
        </View>
      </View>

      {/* Yesterday's Reveal */}
      <View style={styles.card}>
        <View style={styles.revealHead}>
          <Text style={styles.revealHeadIcon}>🔓</Text>
          <Text style={styles.revealHeadText}>Yesterday's reveal</Text>
        </View>
        <Text style={styles.revealMeta}>Aug 7 · Class XI · Math</Text>
        <Text style={styles.revealTitle}>The Candle Puzzle</Text>
        <Text style={styles.revealQ}>Two candles have equal lengths. One burns completely in four hours and the other in five hours. They are lit together. After how much time will one candle be exactly twice as long as the other?</Text>
        
        <View style={styles.answerBox}>
          <Text style={styles.answerLbl}>OFFICIAL ANSWER</Text>
          <Text style={styles.answerText}>After 10/3 hours (3 hours 20 minutes). At that moment the slower-burning candle is twice as long as the faster one.</Text>
        </View>
        
        <Text style={styles.revealFoot}>You didn't lock an attempt yesterday — still handy to read the solution.</Text>
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
    paddingBottom: 26,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 18,
    paddingTop: 16,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(239,159,39,0.22)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.amber },
  eyebrowText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: theme.colors.amber, fontFamily: theme.fonts.body },
  heroTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text, fontFamily: theme.fonts.heading, marginBottom: 9 },
  heroDesc: { fontSize: 12, color: theme.colors.textDim, lineHeight: 18, marginBottom: 14, fontFamily: theme.fonts.body },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  hpill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: theme.colors.cardHi, borderWidth: 1, borderColor: theme.colors.border },
  hpillAmber: { borderColor: 'rgba(239,159,39,0.3)' },
  hpillTeal: { borderColor: 'rgba(29,158,117,0.3)' },
  hpillText: { fontSize: 10, fontWeight: '700', color: theme.colors.textDim, fontFamily: theme.fonts.body },
  hpillTextAmber: { color: theme.colors.amber },
  hpillTextTeal: { color: theme.colors.teal },

  card: { marginHorizontal: 16, marginBottom: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 16 },
  
  ptitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ptitle: { fontSize: 15.5, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  diffPill: { backgroundColor: theme.colors.amberSoft, borderWidth: 1, borderColor: 'rgba(239,159,39,0.3)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 },
  diffPillText: { fontSize: 9, fontWeight: '800', color: theme.colors.amber, fontFamily: theme.fonts.body },
  qtext: { fontSize: 13, lineHeight: 20.15, color: theme.colors.text, marginBottom: 14, fontFamily: theme.fonts.body },
  
  hintLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  hintLinkText: { fontSize: 12, fontWeight: '700', color: theme.colors.amber, fontFamily: theme.fonts.body },
  hintReveal: { backgroundColor: theme.colors.cardHi, borderWidth: 1, borderColor: theme.colors.borderSoft, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, marginTop: -8, marginBottom: 16 },
  hintRevealText: { fontSize: 11, color: theme.colors.textDim, fontFamily: theme.fonts.body },
  
  workLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, color: theme.colors.textFaint, marginBottom: 8, fontFamily: theme.fonts.body },
  workArea: { width: '100%', minHeight: 100, backgroundColor: theme.colors.cardHi, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 13, padding: 12, fontSize: 12, color: theme.colors.text, fontFamily: theme.fonts.body, marginBottom: 14 },
  
  lockBtnWrap: { borderRadius: 13, overflow: 'hidden' },
  lockBtn: { width: '100%', padding: 13, alignItems: 'center', justifyContent: 'center' },
  lockBtnText: { color: '#2A1A02', fontWeight: '800', fontSize: 13, fontFamily: theme.fonts.body },
  lockBtnTextLocked: { color: theme.colors.textFaint },
  lockNote: { textAlign: 'center', fontSize: 10.5, color: theme.colors.teal, marginTop: 9, fontFamily: theme.fonts.body },
  
  unlocksNote: { fontSize: 11.5, color: theme.colors.textDim, lineHeight: 17.25, marginBottom: 14, fontFamily: theme.fonts.body },
  countdownBox: { alignItems: 'center', backgroundColor: theme.colors.cardHi, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 10, marginBottom: 12 },
  unlocksLbl: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, color: theme.colors.textFaint, marginBottom: 8, fontFamily: theme.fonts.body },
  countdownVal: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 24, color: theme.colors.amber },
  
  sealedBoxWrap: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  sealedBox: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 10, backgroundColor: theme.colors.cardHi }, // we can't easily do repeating diagonal gradient in pure RN without expo-linear-gradient trickery or SVG, but using solid cardHi is close.
  sealedBoxText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, color: theme.colors.amber, fontFamily: theme.fonts.body },

  revealHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  revealHeadIcon: { fontSize: 14 },
  revealHeadText: { fontSize: 14, fontWeight: '700', color: theme.colors.teal, fontFamily: theme.fonts.body },
  revealMeta: { fontSize: 10.5, color: theme.colors.textFaint, marginBottom: 8, fontFamily: theme.fonts.body },
  revealTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 9, fontFamily: theme.fonts.body },
  revealQ: { fontSize: 12.5, lineHeight: 19.37, color: theme.colors.textDim, marginBottom: 14, fontFamily: theme.fonts.body },
  answerBox: { backgroundColor: theme.colors.tealSoft, borderWidth: 1, borderColor: 'rgba(29,158,117,0.3)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 13, marginBottom: 10 },
  answerLbl: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.4, color: theme.colors.teal, marginBottom: 6, fontFamily: theme.fonts.body },
  answerText: { fontSize: 12, lineHeight: 18, color: theme.colors.text, fontFamily: theme.fonts.body },
  revealFoot: { fontSize: 10.5, color: theme.colors.textFaint, fontStyle: 'italic', fontFamily: theme.fonts.body }
});
