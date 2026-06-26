# Kafe Eman — iOS Installation

**iOS native app only.** Expo SDK 54 · React Native · TypeScript · Bun.

---

## Prerequisites

| Tool | Notes |
|------|--------|
| [Bun](https://bun.sh) | ≥ 1.1.x — package manager |
| iPhone | With **Expo Go** (SDK 54) for dev preview |
| Mac (optional) | For `expo run:ios` simulator + App Store builds |
| [EAS CLI](https://docs.expo.dev/build/setup/) | For `.ipa` builds |

```bash
powershell -c "irm bun.sh/install.ps1 | iex"   # Windows — install Bun
```

> Use **Bun only** (`npm` / `yarn` / `pnpm` are blocked).

---

## Run on iPhone (Expo Go)

```bash
cd mobile
bun install
bun run dev
```

1. Install **Expo Go** from the App Store (must be SDK **54**).
2. iPhone and computer on the **same Wi‑Fi**.
3. Scan the **QR code** in the terminal (Camera app → open in Expo Go).

> **On Windows:** you cannot run the iOS Simulator (that needs a Mac + Xcode). Use **Expo Go on a real iPhone** — that is the normal dev flow.

Different network:

```bash
bun run start:tunnel
```

---

## iOS builds (EAS)

```bash
bunx eas-cli login
bun run build:ios          # preview — install via link
bun run build:ios:prod     # production — TestFlight / App Store
```

EAS project: `@devmalitos/kafeeman`  
ID: `e7337a07-750d-4b0d-96a5-d78bcc7977dc`

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Expo for iOS + QR code |
| `bun run start:tunnel` | Expo tunnel (any network) |
| `bun run ios` | Run on iOS simulator (macOS) |
| `bun run build:ios` | EAS preview build |
| `bun run build:ios:prod` | EAS production build |
| `bun run typecheck` | TypeScript check |

---

## What was removed

This repo is **iOS-only**. The following are not part of this project:

- Web app / browser preview
- Android builds
- WebView wrapper
- shadcn / MUI / Tailwind / Leaflet web UI

All UI lives in `src/features/kafeeman/App.tsx` using React Native.
