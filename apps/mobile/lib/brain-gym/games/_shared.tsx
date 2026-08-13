import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

/** Dark theme palette shared by every Brain Gym game screen. */
export const COLORS = {
  bg: "#0E1117",
  surface: "#141A23",
  surface2: "#1B2431",
  line: "rgba(255,255,255,0.09)",
  text: "#EAEEF3",
  textDim: "#8B93A1",
  blue: "#60A5FA",
  purple: "#A78BFA",
  teal: "#2DD4BF",
  amber: "#FBBF24",
  pink: "#F472B6",
  red: "#F87171",
  green: "#34D399",
} as const;

/**
 * Full play-area shell — fills GameShell body so games aren't stuck at the top
 * with dead black below.
 */
export function PlayStage({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.stage, style]}>{children}</View>;
}

export function GameBoard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.board, style]}>{children}</View>;
}

export function StatusLine({ children }: { children: React.ReactNode }) {
  return <Text style={styles.statusLine}>{children}</Text>;
}

export function HudPill({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.hudPill}>
      {typeof children === "string" ? (
        <Text style={styles.hudPillText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

/** Wraps children into an N-column grid using percentage widths. */
export function GridWrap({
  children,
  columns,
  gap = 8,
  style,
}: {
  children: React.ReactNode;
  columns: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const items = React.Children.toArray(children);
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }, style]}>
      {items.map((child, i) => (
        <View key={i} style={{ width: `${100 / columns}%`, padding: gap / 2 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function CellButton({
  children,
  onPress,
  disabled,
  selected,
  style,
  textStyle,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        selected && styles.cellSelected,
        pressed && !disabled && styles.cellPressed,
        disabled && styles.cellDisabled,
        style,
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={[styles.cellText, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function ChoiceButton({
  children,
  onPress,
  disabled,
  selected,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && !disabled && styles.cellPressed,
        disabled && styles.cellDisabled,
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.choiceText, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
  color = COLORS.teal,
  textColor = "#04141C",
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
  textColor?: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: color, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function Pill({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, style]}>
      {typeof children === "string" ? <Text style={styles.pillText}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  board: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(20,26,35,0.95)",
    padding: 16,
    width: "100%",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  statusLine: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDim,
    marginBottom: 12,
  },
  hudPill: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(127,119,221,0.14)",
    borderWidth: 1,
    borderColor: "rgba(127,119,221,0.28)",
    marginBottom: 14,
  },
  hudPillText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  cell: {
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  cellSelected: {
    borderColor: COLORS.teal,
    backgroundColor: "rgba(45,212,191,0.18)",
  },
  cellPressed: {
    opacity: 0.75,
  },
  cellDisabled: {
    opacity: 0.55,
  },
  cellText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 20,
  },
  choice: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  choiceSelected: {
    borderColor: COLORS.teal,
    backgroundColor: "rgba(45,212,191,0.14)",
  },
  choiceText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontWeight: "800",
    fontSize: 15,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
  },
  pillText: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: "700",
  },
});
