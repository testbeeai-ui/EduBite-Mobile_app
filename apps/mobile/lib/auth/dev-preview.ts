/**
 * Master switch for the Google login gate.
 *
 * Toggle in apps/mobile/.env (and eas.json preview/dev env when building APK):
 *   EXPO_PUBLIC_SKIP_AUTH=1   → enter app without Google (score UI still works)
 *   EXPO_PUBLIC_SKIP_AUTH=0   → Google login required
 *
 * Restart Metro / rebuild APK after changing. Production EAS profile should stay 0.
 */
export function isSkipLoginForPreviewEnabled(
  _isDev: boolean,
  raw: string | undefined,
): boolean {
  const v = raw?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export const SKIP_LOGIN_FOR_PREVIEW = isSkipLoginForPreviewEnabled(
  typeof __DEV__ !== 'undefined' && __DEV__,
  process.env.EXPO_PUBLIC_SKIP_AUTH,
);
