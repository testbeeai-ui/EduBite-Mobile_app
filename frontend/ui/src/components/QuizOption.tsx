import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export type OptionState = 'default' | 'correct' | 'wrong';

interface QuizOptionProps {
  label: string;
  state: OptionState;
  onPress: () => void;
  disabled: boolean;
}

export const QuizOption = ({ label, state, onPress, disabled }: QuizOptionProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.opt,
        state === 'correct' && styles.optCorrect,
        state === 'wrong' && styles.optWrong,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optText,
          state === 'correct' && styles.optTextCorrect,
          state === 'wrong' && styles.optTextWrong,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  opt: {
    width: '100%',
    backgroundColor: theme.colors.cardHi,
    borderColor: theme.colors.border,
    borderWidth: 1.5,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  optCorrect: {
    borderColor: theme.colors.teal,
    backgroundColor: theme.colors.tealSoft,
  },
  optWrong: {
    borderColor: theme.colors.pink,
    backgroundColor: theme.colors.pinkSoft,
  },
  optText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  optTextCorrect: {
    color: theme.colors.teal,
  },
  optTextWrong: {
    color: theme.colors.pink,
  },
});
