/** Liquid Glass brand tokens — stitch_kafe_eman_mobile_app / DESIGN.md */
import { FONTS } from './native/fonts';

export const STITCH_SHADOW = {
  shadowColor: '#3E2723',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 24,
  elevation: 4,
} as const;

export const STITCH_SHADOW_FLOAT = {
  shadowColor: '#3E2723',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.1,
  shadowRadius: 32,
  elevation: 8,
} as const;

/** Official Kafe Eman Stitch brand — always light (porcelain + deep roast). */
export const BRAND = {
  bg: '#f9f9f9',
  surface: '#f9f9f9',
  surfaceLow: '#f3f3f3',
  surfaceContainer: '#eeeeee',
  surfaceLowest: '#ffffff',
  text: '#1a1c1c',
  textMuted: '#504442',
  textFaint: '#827472',
  onBackground: '#1a1c1c',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#504442',
  primary: '#271310',
  onPrimary: '#ffffff',
  primaryDark: '#3e2723',
  primaryContainer: '#3e2723',
  onPrimaryContainer: '#ffffff',
  secondary: '#655d5a',
  onSecondary: '#ffffff',
  secondaryContainer: '#ece0dc',
  onSecondaryContainer: '#6b6360',
  accent: '#ffba38',
  tertiaryFixed: '#ffdeac',
  tertiaryFixedDim: '#ffba38',
  tertiaryContainer: '#3e2900',
  onTertiaryFixed: '#281900',
  onTertiaryContainer: '#c48900',
  outline: '#827472',
  outlineVariant: '#d3c3c0',
  inverseSurface: '#2f3131',
  inverseOnSurface: '#f1f1f1',
  glass: 'rgba(255,255,255,0.52)',
  glassStrong: 'rgba(255,255,255,0.68)',
  glassInset: 'rgba(255,255,255,0.42)',
  glassBorder: 'rgba(255,255,255,0.55)',
  glassBorderStrong: 'rgba(255,255,255,0.72)',
  glassInnerRim: 'rgba(255,255,255,0.65)',
  navBg: 'rgba(255,255,255,0.78)',
  inputBg: '#f3f3f3',
  inputBorder: '#d3c3c0',
  error: '#ba1a1a',
  radiusXl: 24,
  radiusMax: 32,
} as const;

/** @deprecated Stitch brand is light-only; kept for type compatibility. */
export const LIGHT = BRAND;

/** @deprecated Stitch brand is light-only. */
export const DARK = BRAND;

export type ThemeColors = typeof BRAND;

/** Layout rhythm — DESIGN.md 8px base */
export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  screen: 24,
  section: 16,
} as const;

/** Typography scale — single source for screen titles */
export const TYPE = {
  screenTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

export function useBrandTheme(): ThemeColors {
  return BRAND;
}
