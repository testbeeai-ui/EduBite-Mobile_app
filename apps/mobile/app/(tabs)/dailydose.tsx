import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme, ProgressTrack, CountdownTimer, QuizOption, SubjectPills, OptionState } from '@edubite/ui';
import { useRouter } from 'expo-router';
import { useEdubiteData } from '../../hooks/useEdubiteData';

const defaultQuestions = [
  { subject:"chemistry", tag:"Chemistry · Mole Concept",
    text:"How many moles are in 44 g of CO₂? (Molar mass = 44 g/mol)",
    opts:["0.5 mol","1 mol","2 mol","4 mol"], correct:1 },
  { subject:"maths", tag:"Maths · Quadratic Equations",
    text:"Find the roots of x² − 5x + 6 = 0.",
    opts:["x = 2, 3","x = 1, 6","x = −2, −3","x = 5, 6"], correct:0 },
  { subject:"physics", tag:"Physics · Laws of Motion",
    text:"A 2 kg block is pushed with a 10 N force. Find its acceleration.",
    opts:["5 m/s²","0.2 m/s²","20 m/s²","2 m/s²"], correct:0 },
  { subject:"physics", tag:"Physics · Current Electricity",
    text:"Two capacitors of 5 µF and 3 µF are connected in series. Find the equivalent capacitance.",
    opts:["3.76 µF","2.88 µF","1.88 µF","8 µF"], correct:2 },
  { subject:"chemistry", tag:"Chemistry · Periodic Table",
    text:"Which element has atomic number 11?",
    opts:["Magnesium","Sodium","Neon","Potassium"], correct:1 },
];

export default function DailyDoseScreen() {
  const router = useRouter();
  const { rewardMap, dailyDoseQuestions } = useEdubiteData();
  const dosePerCorrect = rewardMap['dose.per_correct']?.amount ?? 10;

  const activeQuestions = dailyDoseQuestions.length > 0
    ? dailyDoseQuestions.map(q => ({
        subject: (q.tag || '').toLowerCase().includes('chem') ? 'chemistry' : (q.tag || '').toLowerCase().includes('math') ? 'maths' : 'physics',
        tag: q.tag || 'DailyDose Question',
        text: q.q,
        opts: q.opts || [],
        correct: q.correct ?? 0,
      }))
    : defaultQuestions;

  const [activeClass, setActiveClass] = useState('c11');
  
  // Quiz State
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(240);
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
    
    // TODO: Read-only mode - quiz attempt mutations disabled
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
        <Text style={styles.eyebrowText}>FUNCTION 01</Text>
      </View>
      
      <View style={styles.headRow}>
        <Text style={styles.title}>DailyDose</Text>
        <View style={styles.classToggle}>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeClass === 'c11' && styles.toggleBtnActive]} 
            onPress={() => setActiveClass('c11')}
          >
            <Text style={[styles.toggleBtnText, activeClass === 'c11' && styles.toggleBtnTextActive]}>Class 11th</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeClass === 'c12' && styles.toggleBtnActive]} 
            onPress={() => setActiveClass('c12')}
          >
            <Text style={[styles.toggleBtnText, activeClass === 'c12' && styles.toggleBtnTextActive]}>Class 12th</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {isFinished ? "Nice work — see your results below." : "DailyDose in progress — finish before the timer ends."}
      </Text>

      {!isFinished ? (
        <View style={styles.quizCard}>
          <View style={styles.qtop}>
            <Text style={styles.qcount}>{idx + 1}/{activeQuestions.length}</Text>
            <ProgressTrack progress={(idx + 1) / activeQuestions.length} />
            <CountdownTimer totalSeconds={totalSeconds} />
          </View>

          <Text style={[styles.qtag, { 
            color: currentQ.subject === 'physics' ? theme.colors.teal : 
                   currentQ.subject === 'chemistry' ? theme.colors.purple : theme.colors.amber 
          }]}>
            {currentQ.tag}
          </Text>
          
          <Text style={styles.qtext}>{currentQ.text}</Text>

          <View style={styles.opts}>
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

          <SubjectPills subjects={['physics', 'chemistry', 'maths']} activeSubject={currentQ.subject} />
        </View>
      ) : (
        <View style={styles.completeCard}>
          <View style={styles.completeWrap}>
            <View style={styles.completeIcon}><Text style={styles.completeIconText}>🎉</Text></View>
            <Text style={styles.completeTitle}>Today's dose complete!</Text>
            <Text style={styles.completeSub}>You answered {activeQuestions.length}/{activeQuestions.length} questions across Physics, Chemistry & Maths.</Text>
            
            <View style={styles.completeStats}>
              <View style={styles.cstat}>
                <Text style={styles.cv}>{correctCount}/{activeQuestions.length}</Text>
                <Text style={styles.ck}>CORRECT</Text>
              </View>
              <View style={styles.cstat}>
                <Text style={styles.cv}>+{correctCount * dosePerCorrect}</Text>
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
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
  },
  classToggle: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.cardHi,
  },
  toggleBtnText: {
    color: theme.colors.textFaint,
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
  toggleBtnTextActive: {
    color: theme.colors.text,
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
    padding: 16,
  },
  qtop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  qcount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  qtag: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 9,
    fontFamily: theme.fonts.body,
  },
  qtext: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21.75, // 15 * 1.45
    marginBottom: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  opts: {
    // container for options
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
    paddingTop: 14,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.tealSoft,
    borderColor: 'rgba(29,158,117,0.35)',
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
    backgroundColor: theme.colors.teal, // using solid teal instead of gradient for simplicity, or we can use expo-linear-gradient
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#08130F',
    fontWeight: '800',
    fontSize: 13.5,
    fontFamily: theme.fonts.body,
  }
});
