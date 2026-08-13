import * as Linking from 'expo-linking';
import {
  MOBILE_AUTH_CALLBACK_PATH,
  resolveAuthRedirectUri,
} from './redirect';
import { isRunningInExpoGo } from './runtime';

/**
 * OAuth redirect for browser / Expo Go PKCE flow.
 * Native builds use the stable custom scheme; Expo Go uses Linking.createURL
 * (exp://…/--/auth/callback) which must be allowlisted in Supabase Redirect URLs.
 */
export function getAuthRedirectUri(): string {
  return resolveAuthRedirectUri({
    envRedirect: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL,
    runningInExpoGo: isRunningInExpoGo(),
    expoGoRedirectUri: Linking.createURL(MOBILE_AUTH_CALLBACK_PATH),
  });
}
