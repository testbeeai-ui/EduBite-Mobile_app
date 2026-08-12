import { Vibration } from 'react-native';

function buzz(pattern: number | number[]) {
  try {
    Vibration.vibrate(pattern);
  } catch {
    /* web / unsupported */
  }
}

/** Same API as Edubite web sfx — vibration-backed on native. */
export const sfx = {
  tap: (on: boolean) => {
    if (on) buzz(10);
  },
  correct: (on: boolean) => {
    if (on) buzz(20);
  },
  wrong: (on: boolean) => {
    if (on) buzz(40);
  },
  win: (on: boolean) => {
    if (on) buzz([0, 30, 40, 30]);
  },
  tick: (on: boolean) => {
    if (on) buzz(8);
  },
};
