import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useEdubiteData } from '../../hooks/useEdubiteData';

const researchArticles = [
  { id: '1', type: 'doc', icon: '📄', title: 'Does AI Harm Critical Thinking?', source: 'DUKE UNIVERSITY · CENTER FOR TEACHING AND LEARNING', desc: 'Explains how relying on AI for writing and research tasks was linked to weaker reasoning and argumentation in university students.' },
  { id: '2', type: 'doc', icon: '📄', title: 'Increased AI Use Linked to Eroding Critical Thinking Skills', source: 'PHYS.ORG', desc: 'Covers a 2025 study finding that heavier AI tool usage correlates with cognitive offloading and lower critical-thinking scores.' },
  { id: '3', type: 'video', icon: '▶️', title: 'AI Might Be Reshaping How Students Learn — At a Cost', source: 'YOUTUBE', desc: 'A news segment on research showing STEM-leaning students are the most likely to over-rely on AI tools.' },
  { id: '4', type: 'video', icon: '▶️', title: 'How to Use AI to Teach Critical Thinking (Not Replace It)', source: 'YOUTUBE', desc: 'A practical look at where the line sits between AI as a study aid and AI as a substitute for thinking.' },
];

export default function AIIntegrityScreen() {
  const { gameState } = useEdubiteData();

  const [signedMorning, setSignedMorning] = useState(false);
  const [signedNight, setSignedNight] = useState(false);

  useEffect(() => {
    if (gameState?.payload?.signedMorning) setSignedMorning(true);
    if (gameState?.payload?.signedNight) setSignedNight(true);
  }, [gameState]);

  const handleSignMorning = () => {
    // TODO: Read-only mode - pledge signing mutation disabled
    console.log('TODO: Read-only mode - morning pledge signed');
    setSignedMorning(true);
  };

  const handleSignNight = () => {
    // TODO: Read-only mode - pledge signing mutation disabled
    console.log('TODO: Read-only mode - night pledge signed');
    setSignedNight(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>INTEGRITY LAYER</Text>
      </View>
      <Text style={styles.title}>AI — Use It to Learn, Not to Skip Learning</Text>
      <Text style={styles.subtitle}>Morning and night pledges — open either anytime. Each plays a 60-second reel for today.</Text>

      <View style={styles.infoCard}>
        <Text style={styles.iic}>🤖</Text>
        <Text style={styles.infoText}>
          AI can explain a concept beautifully — but if it's doing the thinking <Text style={{ fontStyle: 'italic', color: theme.colors.text }}>for</Text> you, the exam is where that gap shows up. Growing research links heavy AI reliance to weaker independent reasoning, especially in students. The two pledges below are a daily checkpoint, not a restriction: use AI to understand, never to skip the struggle that builds the skill.
        </Text>
      </View>

      {/* Morning Pledge */}
      <View style={styles.pledgeCard}>
        <View style={styles.pledgeTop}>
          <Text style={styles.pledgeIc}>🌅</Text>
          <Text style={styles.pledgeTime}>8:00 AM · MORNING PLEDGE</Text>
        </View>
        <Text style={styles.pledgeAvail}>Available anytime · today's reel</Text>
        <Text style={styles.pledgeName}>The learning pledge</Text>
        <View style={[styles.pledgeQuote, styles.pledgeQuoteMorning]}>
          <Text style={styles.pledgeQuoteText}>“I will only use AI to learn but will never use AI to solve a problem or a challenge or while taking a test.”</Text>
        </View>
        <TouchableOpacity onPress={handleSignMorning} disabled={signedMorning} style={styles.signBtnWrap}>
          {signedMorning ? (
            <View style={[styles.signBtn, styles.signBtnSigned]}>
              <Text style={styles.signBtnTextSigned}>✓ Pledge signed for today</Text>
            </View>
          ) : (
            <LinearGradient colors={[theme.colors.amber, '#f7c15c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.signBtn}>
              <Text style={styles.signBtnTextMorning}>Sign the 8AM pledge →</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {/* Night Pledge */}
      <View style={styles.pledgeCard}>
        <View style={styles.pledgeTop}>
          <Text style={styles.pledgeIc}>🌙</Text>
          <Text style={styles.pledgeTime}>10:00 PM · NIGHT PLEDGE</Text>
        </View>
        <Text style={styles.pledgeAvail}>Available anytime · today's reel</Text>
        <Text style={styles.pledgeName}>The integrity pledge</Text>
        <View style={[styles.pledgeQuote, styles.pledgeQuoteNight]}>
          <Text style={styles.pledgeQuoteText}>“I did not use AI for any of my assignments — whether given by my school/college or tutor/mentor or coaching institution, or even those I attempted on my own.”</Text>
        </View>
        <TouchableOpacity onPress={handleSignNight} disabled={signedNight} style={styles.signBtnWrap}>
          {signedNight ? (
            <View style={[styles.signBtn, styles.signBtnSigned]}>
              <Text style={styles.signBtnTextSigned}>✓ Pledge signed for today</Text>
            </View>
          ) : (
            <LinearGradient colors={[theme.colors.purple, theme.colors.pink]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.signBtn}>
              <Text style={styles.signBtnTextNight}>Sign the 10PM pledge →</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.secHeading}>The research on AI overuse</Text>

      {researchArticles.map(article => (
        <View key={article.id} style={styles.articleCard}>
          <View style={styles.articleIc}>
            <Text style={{ fontSize: 15 }}>{article.icon}</Text>
          </View>
          <View style={styles.articleBody}>
            <View style={styles.articleTop}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleArrow}>↗</Text>
            </View>
            <Text style={styles.articleSource}>{article.source}</Text>
            <Text style={styles.articleDesc}>{article.desc}</Text>
          </View>
        </View>
      ))}

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
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.amber },
  eyebrowText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: theme.colors.amber, fontFamily: theme.fonts.body },
  title: { fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 7, color: theme.colors.text, fontFamily: theme.fonts.heading },
  subtitle: { fontSize: 12, color: theme.colors.textDim, lineHeight: 18, marginBottom: 16, fontFamily: theme.fonts.body },

  infoCard: { flexDirection: 'row', gap: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 14, marginBottom: 18 },
  iic: { fontSize: 20 },
  infoText: { fontSize: 12, color: theme.colors.textDim, lineHeight: 19.2, flex: 1, fontFamily: theme.fonts.body },

  pledgeCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 16, marginBottom: 14 },
  pledgeTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  pledgeIc: { fontSize: 20 },
  pledgeTime: { fontSize: 11, fontWeight: '700', color: theme.colors.textDim, fontFamily: theme.fonts.body },
  pledgeAvail: { fontSize: 10.5, color: theme.colors.teal, marginVertical: 2, marginBottom: 8, paddingLeft: 30, fontFamily: theme.fonts.body },
  pledgeName: { fontSize: 15, fontWeight: '700', marginBottom: 10, paddingLeft: 30, color: theme.colors.text, fontFamily: theme.fonts.body },
  
  pledgeQuote: { paddingVertical: 11, paddingHorizontal: 13, borderRadius: 10, backgroundColor: theme.colors.cardAlt, marginBottom: 14, borderLeftWidth: 3 },
  pledgeQuoteMorning: { borderLeftColor: theme.colors.amber },
  pledgeQuoteNight: { borderLeftColor: theme.colors.purple },
  pledgeQuoteText: { fontSize: 12, fontStyle: 'italic', lineHeight: 18.6, color: theme.colors.textDim, fontFamily: theme.fonts.body },
  
  signBtnWrap: { borderRadius: 13, overflow: 'hidden' },
  signBtn: { width: '100%', padding: 13, alignItems: 'center', justifyContent: 'center' },
  signBtnSigned: { backgroundColor: theme.colors.tealSoft, borderWidth: 1, borderColor: 'rgba(29,158,117,0.4)', borderRadius: 13 },
  signBtnTextMorning: { fontWeight: '800', fontSize: 13, color: '#2A1A02', fontFamily: theme.fonts.body },
  signBtnTextNight: { fontWeight: '800', fontSize: 13, color: '#2A0E1E', fontFamily: theme.fonts.body },
  signBtnTextSigned: { fontWeight: '800', fontSize: 13, color: theme.colors.teal, fontFamily: theme.fonts.body },

  secHeading: { fontSize: 14, fontWeight: '700', marginVertical: 20, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, color: theme.colors.text, fontFamily: theme.fonts.body },

  articleCard: { flexDirection: 'row', gap: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 15, padding: 13, marginBottom: 10 },
  articleIc: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.cardHi, alignItems: 'center', justifyContent: 'center' },
  articleBody: { flex: 1 },
  articleTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  articleTitle: { flex: 1, fontSize: 12.5, fontWeight: '700', lineHeight: 16.87, color: theme.colors.text, fontFamily: theme.fonts.body },
  articleArrow: { color: theme.colors.textFaint, fontSize: 12, fontFamily: theme.fonts.body },
  articleSource: { fontSize: 9.5, fontWeight: '700', color: theme.colors.teal, letterSpacing: 0.3, marginTop: 3, marginBottom: 6, fontFamily: theme.fonts.body },
  articleDesc: { fontSize: 11, color: theme.colors.textFaint, lineHeight: 16.5, fontFamily: theme.fonts.body },
});
