# Edubite Monorepo Architecture

Welcome to the **Edubite** repository. The project is organized into dedicated **Frontend** and **Backend** directories.

---

## 📁 Repository Directory Structure

```
edubite-monorepo/
│
├── 🎨 FRONTEND (`/frontend` & `/apps`)
│   ├── mobile/              <-- Expo / React Native Mobile Application
│   │   ├── app/(tabs)/      # Screen components (Home, DailyDose, FunBrain, Habits, Profile)
│   │   ├── lib/supabase.ts  # Supabase frontend read client
│   │   └── hooks/           # useEdubiteData custom hook
│   └── ui/                  <-- Shared Design System & Component Library (@edubite/ui)
│
├── ⚙️ BACKEND (`/backend`)
│   ├── supabase/            <-- Supabase Cloud Database Specifications
│   │   ├── schema.sql       # Table DDLs (edubite_*, profiles, user_roles)
│   │   └── rls_policies.sql # Security RLS Policies
│   └── api/                 <-- Shared Backend Client & Type Definitions (@edubite/api)
│
└── 📦 PACKAGES (`/packages`)
    └── config/              <-- Shared Monorepo Configs & Tooling
```

---

## 🚀 Quick Start Commands

### Frontend Commands
```bash
# Run Mobile App in Expo Dev Server
npm run start --workspace=mobile

# Run Mobile App on Android
npm run android --workspace=mobile
```

---

## 🔒 Security & Environment
- **Public Client Key**: Configured in `apps/mobile/.env`.
- **Read-Only Mode**: Frontend performs `.select()` queries using Supabase `anon` key only.
