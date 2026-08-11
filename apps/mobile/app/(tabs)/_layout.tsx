import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { PillNav, theme } from '@edubite/ui';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname back to pill key
  const activeRoute = pathname === '/' ? 'index' : pathname.replace('/', '');

  return (
    <View style={styles.container}>
      <PillNav 
        activeRoute={activeRoute} 
        onPillPress={(key) => {
          if (key === 'index') {
            router.navigate('/');
          } else {
            router.navigate(`/${key}` as any);
          }
        }} 
      />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
  }
});
