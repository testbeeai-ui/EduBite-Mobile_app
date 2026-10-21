import React from 'react';
import { Image } from 'react-native';

const LOGO = require('../../assets/edubite-logo.png');
/** Transparent lockup, about 613×235. */
const RATIO = 235 / 613;

const WIDTH = {
  bar: 112,
  menu: 220,
  login: 280,
} as const;

export function BrandLogo({
  place,
  accessibilityLabel = 'eduBite',
}: {
  place: keyof typeof WIDTH;
  accessibilityLabel?: string;
}) {
  const width = WIDTH[place];
  return (
    <Image
      source={LOGO}
      accessibilityLabel={accessibilityLabel}
      resizeMode="contain"
      style={{ width, height: Math.round(width * RATIO) }}
    />
  );
}
