# Kafe Eman

Native **iOS** coffee ordering app for **Kafe Eman** (Malaysia). Built with Expo SDK 54, React Native, and TypeScript — a real native app (not a WebView), styled with the Stitch **Liquid Glass Coffee** design system.

**Repository:** [github.com/mawlid1431/Kafe_app](https://github.com/mawlid1431/Kafe_app)

## Features

- **Onboarding & auth** — splash, onboarding slides, sign up / login, OTP, profile setup, branch picker
- **Home** — time-based greeting, store bar (branch + delivery/pickup), search, promo banners, offers, rewards teaser, order again
- **Menu & product detail** — categories, favourites, sugar/ice customization, add to cart with haptics + toasts
- **Cart & checkout** — promo codes, variant-safe quantities, order summary, TNG / card / FPX payment flows
- **Orders** — active & past tabs, live tracking map, reorder
- **Rewards** — points balance, tiers, redeem rewards, history
- **Favourites** — save drinks and reorder quickly
- **Profile** — loyalty card, settings, help, logout
- **Liquid glass UI** — `expo-blur` glass surfaces, polished empty states, image loading skeletons

## Quick start

**Requirements:** [Bun](https://bun.sh) 1.1+, Node 18+, [Expo Go](https://expo.dev/go) on iPhone (SDK 54)

```bash
bun install
cp .env.example .env.local   # optional — see Environment
bun run dev
```

Scan the QR code with **Expo Go** on your iPhone (same Wi‑Fi as your dev machine).

If LAN does not work (e.g. Windows → iPhone):

```bash
bun run start:tunnel
```

Press **`r`** in the terminal to reload after code changes.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Expo dev server (LAN) |
| `bun run start:tunnel` | Start with tunnel (remote device testing) |
| `bun run ios` | Run on iOS simulator (macOS only) |
| `bun run typecheck` | TypeScript check |
| `bun run lint` | ESLint |
| `bun run build:ios` | EAS preview build |
| `bun run build:ios:prod` | EAS production build |

## Environment

Create `.env.local` (not committed to git):

```env
EAS_PROJECT_ID=your-eas-project-id
EXPO_USE_BUN=1
```

Get `EAS_PROJECT_ID` from [expo.dev](https://expo.dev) after linking the project, or copy from `app.json` → `extra.eas.projectId`.

## Build for iPhone (TestFlight / App Store)

```bash
bunx eas-cli login
bun run build:ios          # internal preview
bun run build:ios:prod     # production
```

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for full setup.

## Stack

| Layer | Technology |
|-------|------------|
| Platform | **iOS only** |
| Framework | Expo 54 + Expo Router |
| UI | React Native (native components) |
| Design | Stitch Liquid Glass + `expo-blur` |
| Language | TypeScript (strict) |
| Package manager | **Bun** (npm/yarn/pnpm not supported) |
| Builds | EAS (`eas.json`) |

## Project structure

```
app/
  _layout.tsx              App shell, fonts, splash
  index.tsx                → Kafe Eman entry
src/features/kafeeman/
  App.tsx                  Main app (screens & state)
  data.ts                  Menu, branches, promos, rewards
  theme.ts                 Brand colors, spacing, typography
  types.ts                 Shared types
  lib/
    promos.ts              Promo validation & discounts
    haptics.ts             Tactile feedback helpers
  native/
    stitchUi.tsx           Liquid glass UI kit
    feedback.tsx           Toast notifications
    screenChrome.tsx       Headers, empty states, store bar
    payments.tsx           Checkout & payment screens
    ordersScreen.tsx       Order history
    rewardsScreen.tsx      Points & rewards
    favoritesScreen.tsx    Saved drinks
    orderTracking.tsx      Live order map
    ui.tsx                 Shared primitives (images, buttons)
assets/images/             App icon & splash
stitch_kafe_eman_mobile_app/  Stitch design reference (HTML/screens)
docs/                      Installation & guidelines
```

## Demo promo codes

| Code | Effect |
|------|--------|
| `WELCOME10` | 10% off |
| `KEAMAN15` | 15% off (min spend) |
| `FREESHIP` | Free delivery |
| `BOGO50` | BOGO 50% off |

## Design reference

UI is based on the Stitch **Liquid Glass Coffee** mockups in `stitch_kafe_eman_mobile_app/`. See `stitch_kafe_eman_mobile_app/liquid_glass_coffee_aesthetic/DESIGN.md` for tokens and elevation levels.

## License

Private project — © Kafe Eman / devmalitos.
