/** Kafe Eman brand tokens — colors sampled from logo (#608070 sage). */
import { LOGO_GREEN, LOGO_GREEN_DARK, LOGO_GREEN_LIGHT, LOGO_GREEN_SOFT } from './brand';
import { FONTS } from './native/fonts';

export const STITCH_SHADOW = {
  shadowColor: LOGO_GREEN_DARK,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 4,
} as const;

export const STITCH_SHADOW_FLOAT = {
  shadowColor: LOGO_GREEN_DARK,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
  shadowRadius: 28,
  elevation: 8,
} as const;

/** Official palette — anchored to logo sage green, not generic forest green. */
export const BRAND = {
  bg: '#f7f9f7',
  surface: '#f7f9f7',
  surfaceLow: '#f0f3f1',
  surfaceContainer: '#e8ede9',
  surfaceLowest: '#ffffff',
  text: '#1a211e',
  textMuted: '#3f4d48',
  textFaint: '#6b7a74',
  onBackground: '#1a211e',
  onSurface: '#1a211e',
  onSurfaceVariant: '#3f4d48',
  /** Headings, strong text on light surfaces */
  primary: LOGO_GREEN_DARK,
  onPrimary: '#ffffff',
  primaryDark: '#3d5249',
  /** Logo green — buttons, FABs, active nav, live banners */
  primaryContainer: LOGO_GREEN,
  onPrimaryContainer: '#ffffff',
  secondary: LOGO_GREEN_LIGHT,
  onSecondary: '#ffffff',
  secondaryContainer: LOGO_GREEN_SOFT,
  onSecondaryContainer: LOGO_GREEN_DARK,
  accent: '#8fa898',
  tertiaryFixed: '#e9e1d6',
  tertiaryFixedDim: '#cdc5bb',
  tertiaryContainer: '#545048',
  onTertiaryFixed: '#1e1b15',
  onTertiaryContainer: '#c9c2b8',
  outline: '#6b7a74',
  outlineVariant: '#c5cec8',
  inverseSurface: '#2e312c',
  inverseOnSurface: '#f0f2e9',
  /** Savings, live status, positive deltas — same family as logo */
  success: LOGO_GREEN,
  successMuted: LOGO_GREEN_SOFT,
  onSuccess: '#ffffff',
  glass: 'rgba(247,249,247,0.72)',
  glassStrong: 'rgba(247,249,247,0.88)',
  glassInset: 'rgba(228,235,230,0.6)',
  glassBorder: 'rgba(197,206,200,0.65)',
  glassBorderStrong: 'rgba(143,168,152,0.45)',
  glassInnerRim: 'rgba(255,255,255,0.55)',
  navBg: 'rgba(247,249,247,0.82)',
  inputBg: '#e9e1d6',
  inputBorder: '#c5cec8',
  error: '#ba1a1a',
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusMax: 32,
} as const;

export const LIGHT = BRAND;
export const DARK = BRAND;

export type ThemeColors = typeof BRAND;

export const SPACING = {
  xs: 4,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  screen: 16,
  section: 24,
  gutter: 24,
} as const;

export const TYPE = {
  screenTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.28,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
  },
} as const;

export function useBrandTheme(): ThemeColors {
  return BRAND;
}
