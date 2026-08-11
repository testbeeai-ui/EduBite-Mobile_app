import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

export const PhoneShell = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.phoneShell}>
          <View style={styles.notch} />
          <View style={styles.phoneScreen}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.nativeContainer}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#05070A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  phoneShell: {
    width: 390,
    height: 844, // Hardcoded for preview match
    maxWidth: '100%',
    borderWidth: 10,
    borderColor: '#05070a',
    borderRadius: 46,
    backgroundColor: '#000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.55,
    shadowRadius: 90,
    elevation: 10,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -60, // half of 120
    width: 120,
    height: 26,
    backgroundColor: '#05070a',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 40,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  nativeContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
});
