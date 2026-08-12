import Constants from 'expo-constants';

/** True when running inside Expo Go (no custom native modules). */
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}
