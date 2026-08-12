# Google Sign-In setup (native ID token → Supabase)

## Mental model

| Thing | Example | Role |
| --- | --- | --- |
| Web OAuth Client ID | `167530443868-….apps.googleusercontent.com` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `GoogleSignin.configure({ webClientId })` |
| Android OAuth Client ID | different `….apps.googleusercontent.com` | Package `com.edubite.app` + SHA-1; also listed in Supabase |
| ID token | JWT from `GoogleSignin.signIn()` | Passed to `supabase.auth.signInWithIdToken` |

The Client ID string is **not** the ID token.

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

Get SHA-1 after creating a keystore / EAS credentials, e.g.:

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
3. Enable **Skip nonce check** (Original `@react-native-google-signin/google-signin` API does not send a custom nonce)

## App env

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=167530443868-kniil90rorooo9i3vu80sqmtlo3sqqi2.apps.googleusercontent.com
```

## Development build (required)

Expo Go cannot load this native module. Project: [@edublast/edubite-mobile](https://expo.dev/accounts/edublast/projects/edubite-mobile).

```bash
cd apps/mobile
npx eas-cli build --profile development --platform android
# install the APK, then open Edubite (not Expo Go):
npm run start --workspace=mobile
```

Or locally with Android Studio / SDK:

```bash
cd apps/mobile
npx expo run:android
```

When signing in you should see Metro logs: `Google idToken obtained` → `session created` — with **no** navigation to `edublast.in`.

## Security notes

- Never put Google Client Secret in the app.
- Keep Supabase **Authorized Client IDs** limited to Web + this app’s Android (and iOS when ready) clients.
- **Skip nonce check** is required for the current RN Google Sign-In Original API; treat ID-token leakage as high risk until a nonce-capable path lands.
- Learner gate requires `app_metadata` Google provider (not email/anonymous).
