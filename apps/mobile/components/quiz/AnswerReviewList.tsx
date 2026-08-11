import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@edubite/ui';
import type { LearnerQuestion } from '../../lib/content/today-questions';

/**
 * Learner review without answer keys.
 * Shows your picks only — server grading owns correctness / RDM.
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
        Your selections for today. Official scoring is applied on the server.
      </Text>
      {questions.map((item, idx) => {
        const selectedIdx = answers[idx];
        const hasAnswer = selectedIdx !== undefined && selectedIdx !== null;

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
                return (
                  <View
                    key={`${item.id}-${oIdx}`}
                    style={[styles.opt, isUserSelection && styles.optPicked]}
                  >
                    <View style={styles.optLeft}>
                      <Text style={styles.optNum}>{oIdx + 1}.</Text>
                      <Text
                        style={[styles.optText, isUserSelection && styles.optTextPicked]}
                      >
                        {opt}
                      </Text>
                    </View>
                    {isUserSelection ? (
                      <Text style={styles.markPicked}>Your Pick</Text>
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
  markPicked: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.blue,
    fontFamily: theme.fonts.body,
  },
});
