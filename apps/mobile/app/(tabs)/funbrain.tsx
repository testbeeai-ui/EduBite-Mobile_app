import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme, ProgressTrack, CountdownTimer, QuizOption, SubjectPills, OptionState } from '@edubite/ui';
import { useRouter } from 'expo-router';
import { useEdubiteData } from '../../hooks/useEdubiteData';

const defaultQuestions = [
  { subject:"gk", tag:"General Knowledge",
    text:"A person who studies ancient inscriptions is called:",
    opts:["Numismatist","Epigraphist","Cartographer","Anthropologist"], correct:1 },
  { subject:"quantitative", tag:"Quantitative Ability",
    text:"A train travels 180 km in 3 hours. What is its speed?",
    opts:["40 km/h","60 km/h","90 km/h","30 km/h"], correct:1 },
  { subject:"analytical", tag:"Analytical Ability",
    text:"Which number comes next: 2, 6, 12, 20, 30, ?",
    opts:["40","42","36","44"], correct:1 },
  { subject:"verbal", tag:"Verbal Ability",
    text:"Choose the synonym of ‘Eloquent’:",
    opts:["Articulate","Silent","Confused","Rude"], correct:0 },
  { subject:"gk", tag:"General Knowledge",
    text:"Which is the smallest planet in our solar system?",
    opts:["Earth","Venus","Mercury","Mars"], correct:2 },
  { subject:"quantitative", tag:"Quantitative Ability",
    text:"What is 15% of 200?",
    opts:["20","30","35","25"], correct:1 },
];

export default function FunBrainScreen() {
  const router = useRouter();
  const { rewardMap, funBrainQuestions } = useEdubiteData();
  const basePoints = rewardMap['funbrain.base_points']?.amount ?? 10;

  const activeQuestions = funBrainQuestions.length > 0
    ? funBrainQuestions.map(q => ({
        subject: (q.tag || '').toLowerCase().includes('verb') ? 'verbal' : (q.tag || '').toLowerCase().includes('quant') ? 'quantitative' : 'analytical',
        tag: q.tag || 'FunBrain Sprint',
        text: q.q,
        opts: q.opts || [],
        correct: q.correct ?? 0,
      }))
    : defaultQuestions;

  // Quiz State
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(360);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) return;
    
    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isFinished]);

  const selectAnswer = (i: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOpt(i);
    
    const q = activeQuestions[idx];
    if (i === q.correct) {
      setCorrectCount(prev => prev + 1);
    }
    
    // TODO: Read-only mode - sprint completion write disabled
    setTimeout(() => {
      if (idx < activeQuestions.length - 1) {
        setIdx(prev => prev + 1);
        setAnswered(false);
        setSelectedOpt(null);
      } else {
        setIsFinished(true);
      }
    }, 700);
  };

  const currentQ = activeQuestions[idx] || activeQuestions[0];

  const getOptionState = (optIndex: number): OptionState => {
    if (!answered) return 'default';
    if (optIndex === currentQ.correct) return 'correct';
    if (optIndex === selectedOpt) return 'wrong';
    return 'default';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>FUNCTION 02 · DAILY SPRINT</Text>
      </View>
      
      <Text style={styles.title}>FunBrain</Text>
      
      <Text style={styles.subtitle}>
        {isFinished ? "Nice work — see your sprint results below." : "FunBrain sprint in progress — answer questions before time runs out."}
      </Text>

      {!isFinished ? (
        <View style={styles.quizCard}>
          <View style={styles.qtop}>
            <Text style={styles.qcount}>{idx + 1}/{activeQuestions.length}</Text>
            <ProgressTrack progress={(idx + 1) / activeQuestions.length} />
            <CountdownTimer totalSeconds={totalSeconds} />
          </View>

          <Text style={[styles.qtag, { 
            color: currentQ.subject === 'verbal' ? theme.colors.amber : 
                   currentQ.subject === 'quantitative' ? theme.colors.blue : 
                   currentQ.subject === 'analytical' ? theme.colors.purple : theme.colors.teal 
          }]}>
            {currentQ.tag}
          </Text>
          
          <Text style={styles.qtext}>{currentQ.text}</Text>

          <View style={styles.optsGrid}>
            {currentQ.opts.map((opt, i) => (
              <QuizOption 
                key={i} 
                label={opt} 
                state={getOptionState(i)} 
                onPress={() => selectAnswer(i)} 
                disabled={answered} 
              />
            ))}
          </View>

          <SubjectPills subjects={['verbal', 'quantitative', 'analytical', 'gk']} activeSubject={currentQ.subject} />
        </View>
      ) : (
        <View style={styles.completeCard}>
          <View style={styles.completeWrap}>
            <View style={styles.completeIcon}><Text style={styles.completeIconText}>⚡</Text></View>
            <Text style={styles.completeTitle}>Sprint complete!</Text>
            <Text style={styles.completeSub}>{activeQuestions.length}/{activeQuestions.length} answered across Verbal, Quant, Analytical & GK.</Text>
            
            <View style={styles.completeStats}>
              <View style={styles.cstat}>
                <Text style={styles.cv}>{correctCount}/{activeQuestions.length}</Text>
                <Text style={styles.ck}>CORRECT</Text>
              </View>
              <View style={styles.cstat}>
                <Text style={styles.cv}>+{correctCount * basePoints}</Text>
                <Text style={styles.ck}>RDM EARNED</Text>
              </View>
              <View style={styles.cstat}>
                <Text style={styles.cv}>{Math.floor(totalSeconds / 60)}:{totalSeconds % 60 < 10 ? '0' : ''}{totalSeconds % 60}</Text>
                <Text style={styles.ck}>TIME LEFT</Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={() => router.navigate('/')} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
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
    paddingBottom: 26,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.amber,
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11.5,
    color: theme.colors.textDim,
    marginBottom: 16,
    fontFamily: theme.fonts.body,
  },
  quizCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  qtop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  qscore: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  qcount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  trackWrapper: {
    marginBottom: 18,
    flexDirection: 'row', // to make ProgressTrack take full width
  },
  qtag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  qtext: {
    fontSize: 15.5,
    fontWeight: '700',
    lineHeight: 21.7, // 15.5 * 1.4
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  optsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5, // offset padding
  },
  optCell: {
    width: '50%',
    paddingHorizontal: 5,
  },
  completeCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  completeWrap: {
    alignItems: 'center',
    paddingTop: 26,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.amberSoft,
    borderColor: 'rgba(239,159,39,0.35)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  completeIconText: {
    fontSize: 28,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
  },
  completeSub: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 6,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  completeStats: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 20,
    width: '100%',
  },
  cstat: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  cv: {
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 15,
    color: theme.colors.text,
  },
  ck: {
    fontSize: 8.5,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    marginTop: 2,
    fontFamily: theme.fonts.body,
  },
  doneBtn: {
    width: '100%',
    padding: 13,
    borderRadius: 13,
    backgroundColor: theme.colors.amber, // solid fallback
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#3A2404',
    fontWeight: '800',
    fontSize: 13.5,
    fontFamily: theme.fonts.body,
  }
});
