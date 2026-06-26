# Plan: Kafe Eman — iOS App Prototype (Figma-Quality UI)

## Context
The user has a full coffee shop app architecture ("Kafe Eman") and wants a Figma-prototype-quality web UI that simulates the entire iOS app — all screens, navigable, with premium mobile design. This acts as a living prototype/design system reference, not a production app.

## Aesthetic Stance
- **Kinetic + Liquid Glass** — dark espresso ground (#0d0906) with warm amber/caramel liquid glass cards using `backdrop-filter: blur`. iOS-native feel.
- **Typography**: `Playfair Display` (display/headings, high-contrast serif for brand) + `Plus Jakarta Sans` (UI body, labels, buttons)
- **Palette**: Deep espresso `#0d0906` background → amber `#C8842A` primary → cream `#F5EDD8` text → frosted `rgba(255,255,255,0.08)` glass cards
- **Radius**: 28–32px (very rounded, iOS-native)
- **Motion**: CSS transitions + motion/react spring animations on screen transitions

## Architecture

### Container
- Full viewport centered with an iPhone 14 Pro frame (390×844 logical px)
- Phone bezel, Dynamic Island, home indicator rendered in React
- All screens render inside the phone frame
- Screen navigation via `useState` (currentScreen)

### Screens (17 total, all implemented)
1. **Splash** — Animated coffee logo, app name, warm gradient BG
2. **Onboarding** — 3 slides with swipeable dots, Skip/Next/Get Started
3. **Auth** — Login / Sign Up / Apple / Guest options
4. **Sign Up** — Full name, email, password form
5. **OTP Verification** — 6-digit code input UI
6. **Profile Setup** — DOB, gender, profile image, birthday privacy
7. **Branch Selection** — Cards for Alor Setar / Penang / KL
8. **Order Type** — Delivery vs Pickup choice cards
9. **Home** — Greeting, search, promo carousel, featured drinks, rewards summary
10. **Menu** — Category tabs (Coffee/Tea/Cold/Pastries…), product grid with cards
11. **Product Detail** — Full image, customizations (sugar/ice/milk), Add to Cart
12. **Cart** — Items list, qty adjust, promo code, total breakdown
13. **Checkout** — Order summary, payment methods (Apple Pay / Card / TNG)
14. **Order Success** — Animated ✓, order ID, estimated time, Track button
15. **Orders** — Active / Preparing / Completed tabs
16. **Profile** — Avatar, points, membership tier, settings sections
17. **Rewards** — Points balance, tier progress (Bronze→Silver→Gold→Platinum), perks

### Bottom Navigation
Present on screens 9–17 (Home, Menu, Cart, Orders, Profile)
- Icons: Home / Menu (coffee) / Cart (badge) / Orders / Profile
- Active state with amber glow

## Files to Modify

### `src/styles/fonts.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
```

### `src/styles/theme.css`
Update `:root` tokens:
- `--background: #0d0906`
- `--foreground: #F5EDD8`
- `--primary: #C8842A`
- `--primary-foreground: #0d0906`
- `--card: rgba(255,255,255,0.07)`
- `--border: rgba(255,255,255,0.12)`
- `--radius: 1.75rem`
- `--muted: rgba(255,255,255,0.05)`
- `--muted-foreground: rgba(245,237,216,0.55)`
- `--accent: #E8A94A`

### `src/app/App.tsx`
Single file, ~1200–1500 lines. Complete self-contained prototype:
- `useState` for `currentScreen`, `currentTab`, `onboardingSlide`, `cartItems`, `selectedCategory`
- Mock data: menu items (10+), categories, orders, rewards tiers
- All 17 screens as components/JSX blocks
- Liquid glass card utility: `bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-[28px]`
- Unsplash images for coffee drinks (warm-toned, cropped square)
- iPhone frame wrapper with Dynamic Island

## Unsplash Images to Use
- Hero coffee: `photo-1495474472287-4d71bcdd2085` (coffee closeup)
- Latte: `photo-1509042239860-f550ce710b93`
- Cold brew: `photo-1461023058943-07fcbe16d735`
- Pastry: `photo-1558961363-fa8fdf82db35`
- Branch/cafe: `photo-1501339847302-ac426a4a7cbb`

## Verification
After implementation:
- Phone frame visible centered on page
- Clicking "Get Started" advances from splash → onboarding → auth
- Bottom nav switches between Home / Menu / Cart / Orders / Profile
- Add to Cart on product detail increments cart badge
- All 17 screens reachable through natural navigation flow
- No TypeScript errors, no layout overflow outside phone frame
