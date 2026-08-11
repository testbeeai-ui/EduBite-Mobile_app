import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@edubite/ui';
import { BrainGymHub } from '../../components/brain-gym/BrainGymHub';
import { BrainGymProvider } from '../../lib/brain-gym/hooks/useBrainGym';

/** Native on-device Brain Gym — hub + popup games + DB progress (no web, no login UI). */
export default function BrainGymScreen() {
  return (
    <View style={styles.root}>
      <BrainGymProvider>
        <BrainGymHub />
      </BrainGymProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
});
