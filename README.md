# Edubite Monorepo Architecture

## Quick start

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Fill EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
# Enable Anonymous Auth in Supabase (Brain Gym uses silent device sessions — no login screen)

npm run start --workspace=mobile
```

## Brain Gym (native)

- Hub + all **15** games run **on-device** (React Native Modal popup shell).
- No WebView, no sign-in page.
- Progress: silent anonymous Supabase session → `edubite_apply_brain_gym_mutation` → `edubite_brain_gym_progress` (with AsyncStorage offline cache).

Key paths:
- `apps/mobile/app/(tabs)/braingym.tsx`
- `apps/mobile/components/brain-gym/`
- `apps/mobile/lib/brain-gym/`
