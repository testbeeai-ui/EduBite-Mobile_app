# Edubite Frontend (`/frontend`)

This directory contains the user-facing frontend application and shared UI component system.

## Structure

```
frontend/
├── mobile/     # Edubite Mobile App (Expo Router / React Native)
│   ├── app/            # File-based navigation tab screens
│   ├── lib/            # Supabase frontend data client
│   └── hooks/          # React hooks (useEdubiteData)
└── ui/         # Shared UI Design System (@edubite/ui)
    ├── src/components/ # Shared buttons, cards, progress bars, & options
    └── src/theme/      # Master color palette & typography
```

## Running the Mobile Frontend

```bash
# Start Expo development server
npm run start --workspace=mobile

# Or target specific platforms
npm run android --workspace=mobile
npm run ios --workspace=mobile
npm run web --workspace=mobile
```
