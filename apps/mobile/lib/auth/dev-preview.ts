/**
 * Local Expo Go preview: skip the Google login gate.
 * Production / release builds never honor this (`__DEV__` is false).
 *
 * Toggle in apps/mobile/.env:
 *   EXPO_PUBLIC_SKIP_AUTH=1   → enter the app without Google
 *   EXPO_PUBLIC_SKIP_AUTH=0   → login gate on (restart Expo)
 */
export function isSkipLoginForPreviewEnabled(
  isDev: boolean,
  raw: string | undefined,
): boolean {
  if (!isDev) return false;
  const v = raw?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export const SKIP_LOGIN_FOR_PREVIEW = isSkipLoginForPreviewEnabled(
  typeof __DEV__ !== 'undefined' && __DEV__,
  process.env.EXPO_PUBLIC_SKIP_AUTH,
);
