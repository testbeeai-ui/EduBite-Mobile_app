// Registered Expo scheme — must match app.json expo.scheme.
export const MOBILE_AUTH_SCHEME = 'edubite';

// Path segment for optional deep-link recovery — edubite://auth/callback
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;

/**
 * Pure redirect resolver — Expo Go vs native scheme.
 * Pass `expoGoRedirectUri` from Linking.createURL at the call site.
 */
export function resolveAuthRedirectUri(args: {
  envRedirect?: string | null;
  runningInExpoGo: boolean;
  expoGoRedirectUri: string;
  stableRedirectUri?: string;
}): string {
  const fromEnv = args.envRedirect?.trim();
  if (fromEnv) return fromEnv;
  if (args.runningInExpoGo) return args.expoGoRedirectUri;
  return args.stableRedirectUri ?? STABLE_MOBILE_AUTH_REDIRECT;
}
