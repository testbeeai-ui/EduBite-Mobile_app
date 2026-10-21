import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@edubite/ui';
import type { LearnerQuestion } from '../../lib/content/today-questions';

/**
 * Result review matching the website: your pick and the correct option.
 */
export function AnswerReviewList({
  questions,
  answers,
}: {
  questions: LearnerQuestion[];
  answers: Array<number | null | undefined>;
}) {
  if (questions.length === 0) {
    return <Text style={styles.empty}>Loading review…</Text>;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Review Answers</Text>
      <Text style={styles.sub}>
        Your selections, with the correct option marked.
      </Text>
      {questions.map((item, idx) => {
        const selectedIdx = answers[idx];
        const hasAnswer = selectedIdx !== undefined && selectedIdx !== null;
        const known = item.correct !== null && item.correct !== undefined;
        const isRight = known && hasAnswer ? selectedIdx === item.correct : null;

        return (
          <View key={item.id || `q-${idx}`} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.qLabel}>
                Question {idx + 1}
                {item.tag ? ` · ${item.tag}` : ''}
              </Text>
              {!hasAnswer ? (
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>Unanswered</Text>
                </View>
              ) : isRight === true ? (
                <View style={styles.badgeTeal}>
                  <Text style={styles.badgeTealText}>Correct</Text>
                </View>
              ) : isRight === false ? (
                <View style={styles.badgeWrong}>
                  <Text style={styles.badgeWrongText}>Incorrect</Text>
                </View>
              ) : (
                <View style={styles.badgeTeal}>
                  <Text style={styles.badgeTealText}>Answered</Text>
                </View>
              )}
            </View>

            <Text style={styles.prompt}>{item.text}</Text>

            <View style={styles.opts}>
              {item.opts.map((opt, oIdx) => {
                const isUserSelection = selectedIdx === oIdx;
                const isCorrectOption = known && oIdx === item.correct;
                return (
                  <View
                    key={`${item.id}-${oIdx}`}
                    style={[
                      styles.opt,
                      isCorrectOption && styles.optRight,
                      isUserSelection && !isCorrectOption && styles.optWrong,
                    ]}
                  >
                    <View style={styles.optLeft}>
                      <Text style={styles.optNum}>{oIdx + 1}.</Text>
                      <Text
                        style={[
                          styles.optText,
                          isCorrectOption && styles.optTextRight,
                          isUserSelection && !isCorrectOption && styles.optTextWrong,
                        ]}
                      >
                        {opt}
                      </Text>
                    </View>
                    {isCorrectOption ? (
                      <Text style={styles.markRight}>Correct</Text>
                    ) : null}
                    {isUserSelection && !isCorrectOption ? (
                      <Text style={styles.markWrong}>Your pick</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, gap: 12 },
  heading: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fonts.heading,
  },
  sub: {
    fontSize: 11,
    color: theme.colors.textFaint,
    marginBottom: 6,
    fontFamily: theme.fonts.body,
  },
  empty: {
    marginTop: 16,
    textAlign: 'center',
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  qLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  badgeMuted: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },
  badgeMutedText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.body,
  },
  badgeTeal: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.tealSoft,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.25)',
  },
  badgeTealText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.teal,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.body,
  },
  badgeWrong: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(220, 80, 100, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220, 80, 100, 0.3)',
  },
  badgeWrongText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.pink,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.body,
  },
  prompt: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 19,
    marginBottom: 10,
    fontFamily: theme.fonts.body,
  },
  opts: { gap: 7 },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    backgroundColor: theme.colors.cardHi,
  },
  optPicked: {
    borderColor: 'rgba(55,138,221,0.35)',
    backgroundColor: theme.colors.blueSoft,
  },
  optRight: {
    borderColor: 'rgba(29,158,117,0.45)',
    backgroundColor: theme.colors.tealSoft,
  },
  optWrong: {
    borderColor: 'rgba(220, 80, 100, 0.45)',
    backgroundColor: 'rgba(220, 80, 100, 0.1)',
  },
  optLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flex: 1 },
  optNum: {
    fontSize: 10,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
    marginTop: 1,
  },
  optText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 17,
    fontFamily: theme.fonts.body,
  },
  optTextPicked: { color: theme.colors.blue, fontWeight: '700' },
  optTextRight: { color: theme.colors.teal, fontWeight: '700' },
  optTextWrong: { color: theme.colors.pink, fontWeight: '700' },
  markPicked: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.blue,
    fontFamily: theme.fonts.body,
  },
  markRight: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },
  markWrong: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.pink,
    fontFamily: theme.fonts.body,
  },
});
