import React from 'react';
import { Slot } from 'expo-router';
import { AppHeader, PhoneShell } from '@edubite/ui';

export default function RootLayout() {
  return (
    <PhoneShell>
      <AppHeader onOpenDrawer={() => console.log('Open drawer')} />
      <Slot />
    </PhoneShell>
  );
}
