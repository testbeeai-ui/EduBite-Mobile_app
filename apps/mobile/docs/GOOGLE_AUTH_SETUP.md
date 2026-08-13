# Google Sign-In setup (native ID token + Expo Go browser OAuth)

## Mental model

| Thing | Example | Role |
| --- | --- | --- |
| Web OAuth Client ID | `167530443868-….apps.googleusercontent.com` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / native `webClientId` |
| Android OAuth Client ID | different `….apps.googleusercontent.com` | Package `com.edubite.app` + SHA-1; also listed in Supabase |
| Native ID token | JWT from `GoogleSignin.signIn()` | `supabase.auth.signInWithIdToken` (dev/prod builds) |
| Browser OAuth | Expo Go / fallback | `signInWithOAuth` + `WebBrowser.openAuthSessionAsync` |

The Client ID string is **not** the ID token.

## Flows

1. **Development / preview / production APK** — native Google Sign-In → ID token → Supabase.
2. **Expo Go** — system browser Google OAuth (PKCE) → callback → `exchangeCodeForSession`.

Set `EXPO_PUBLIC_SKIP_AUTH=0` (and restart Metro) to show LoginGate.

## Google Cloud

```text
Google Cloud
│
├── Web OAuth Client
│   └── 167530443868-kniil90rorooo9i3vu80sqmtlo3sqqi2.apps.googleusercontent.com
│
└── Android OAuth Client
    └── <another-client-id>.apps.googleusercontent.com
        ├── Package name: com.edubite.app
        └── SHA-1: development / upload keystore fingerprint
```

Verify the Web entry’s **Application type** is **Web application**.

```bash
cd apps/mobile
npx eas credentials -p android
# or local debug:
keytool -list -v -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -storepass android -keypass android
```

## Supabase

Authentication → Providers → Google:

1. Authorized Client IDs: `WEB_CLIENT_ID,ANDROID_CLIENT_ID`
2. Client secret: Web secret only
3. Enable **Skip nonce check** (native Original API)

Authentication → URL Configuration → Redirect URLs must include:

- `edubite://auth/callback` (native builds)
- Your Expo Go callback from Metro (`[auth] starting browser Google OAuth` logs `redirectTo`), e.g. `exp://192.168.x.x:8081/--/auth/callback`

## App env

```env
EXPO_PUBLIC_SKIP_AUTH=0
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=167530443868-kniil90rorooo9i3vu80sqmtlo3sqqi2.apps.googleusercontent.com
```

## Builds

Project: [@edublast/edubite-mobile](https://expo.dev/accounts/edublast/projects/edubite-mobile).

| Profile | Needs Metro `:8081`? | Use |
| --- | --- | --- |
| `development` | Yes | Coding with hot reload |
| `preview` | **No** — JS inside APK | Live / QA on phones |
| `production` | **No** — AAB for Play Store | Store release |

```bash
cd apps/mobile
npx eas-cli build --profile development --platform android
npm run start --workspace=mobile
```

Also set EAS env for:
`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## Security notes

- Never put Google Client Secret in the app.
- Keep Supabase **Authorized Client IDs** limited to Web + this app’s Android (and iOS when ready) clients.
- **Skip nonce check** is required for the current RN Google Sign-In Original API.
- Learner gate requires Google provider (not email/anonymous).
