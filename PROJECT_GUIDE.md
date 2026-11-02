# YYJCPL Jobs – Mobile App (Candidate + Recruiter)

One React Native CLI app. After OTP login the user's **role** decides which app opens:

| Role      | Flow |
|-----------|------|
| Candidate | Profile → Resume → Search jobs → Apply → Track → Shortlisted → Interview → Selected → Placed |
| Recruiter | Company profile → Post job (admin approves) → Applications → Search candidates → Shortlist → Schedule interview → Select |
| Admin     | Separate **web panel** (not in this app) – verification, job approvals, placements, complaints, subscriptions, payments, notifications, reports |

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the current implementation status, complete product scope, and recommended delivery phases.

---

## ★ Rule #1 – Responsive design (mandatory)

Every size goes through `src/theme/responsive.ts` so the UI looks the same on every device.

| Use                | For                                     |
|--------------------|-----------------------------------------|
| `scale(n)`         | widths, horizontal padding/margin, icons, radius |
| `vs(n)`            | heights, vertical spacing               |
| `ms(n)`            | sizes that should grow less on tablets  |
| `font(n)`          | font sizes                              |
| `spacing`, `sizes`, `radius`, `typography` | ready-made tokens (prefer these) |

- Never hard-code numbers like `padding: 16` or `fontSize: 14`.
- Use `<AppText>` (caps system font scaling) instead of `<Text>`.
- Layout with flexbox (`flex`, `gap`, `flexDirection`); no absolute positioning for layout.
- Design base size is **375 × 812**. Change `BASE_WIDTH/BASE_HEIGHT` if your Figma frame differs.
- Test every screen on: small phone (~5"), large phone (~6.7"), tablet.

## ★ Rule #2 – Every screen = Header + Main + Footer

```tsx
<ScreenLayout
  title="Job Details"                       // HEADER (back button automatic)
  footer={<AppButton title="Apply" />}>     // FOOTER (sticky, optional)
  {/* MAIN – scrollable, keyboard-safe */}
</ScreenLayout>
```
Tab screens use `showBack={false} edges={['top']}`.

---

## Folder structure

```
src/
├── app/                  AppProvider (providers) + RootNavigator (role switch)
├── theme/                ★ responsive.ts, colors, spacing, typography
├── layout/               ★ ScreenLayout + header/ main/ footer/
├── components/
│   ├── common/           AppText, AppButton, AppInput, Card, Loader, EmptyState
│   ├── jobs/             JobCard, StatusBadge (shared by both roles)
│   └── animated/         Lottie / Rive / Skia / 3D wrappers (later)
├── navigation/           types.ts, Auth/Candidate/Recruiter navigators, tab styles
├── modules/              ← feature code lives here
│   ├── auth/             screens (RoleSelect, Login, Otp), schemas, api
│   ├── candidate/        home, jobs, applications, interviews, profile, resume, schemas, api
│   ├── recruiter/        dashboard, jobs, applications, candidates, shortlist,
│   │                     interviews, company, subscription, schemas, api
│   └── shared/           notifications, settings, complaints, api
├── store/                Redux store, typed hooks, authSlice, baseApi (RTK Query)
├── services/             secureStorage (Keychain), firebase/*, payments, documentPicker
├── constants/            roles, applicationStatus (pipeline)
├── types/                domain models (User, Job, JobApplication, Interview, …)
├── config/               env (API base URL)
├── hooks/                useResponsive
├── utils/                formatters
└── assets/               images, icons, fonts, lottie, rive, models
```

### Adding a new screen
1. Create `src/modules/<role>/<feature>/<Name>Screen.tsx` using `ScreenLayout`.
2. Add the route + params to `src/navigation/types.ts`.
3. Register it in the matching navigator.
4. API calls → add endpoints in `src/modules/<role>/api/*.ts` (`injectEndpoints`).
5. Forms → Zod schema in `src/modules/<role>/schemas/`, use React Hook Form `Controller` + `AppInput`.

---

## Delivery status

The mobile app foundation and feature screens are in place; backend delivery, end-to-end workflows, and release readiness are tracked in [the roadmap](./docs/ROADMAP.md). In particular, screen/API-client code does not mean the production backend or its data flows are complete.

---

## Commands

```bash
npm start                 # Metro bundler
npm run android           # build + run on emulator/device
npx tsc --noEmit          # type check
npm run lint              # ESLint
npm test                  # Jest
```

**Dev tip:** the Login screen has a *"Skip login (dev only)"* button so you can browse the
candidate/recruiter apps before the backend exists. Logout is in Settings. Remove it before release.
