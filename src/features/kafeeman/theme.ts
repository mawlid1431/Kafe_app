/** Artisanal Sage brand tokens — design.md */
import { FONTS } from './native/fonts';

/** Soft ambient occlusion tinted with forest green (design.md Level 2). */
export const STITCH_SHADOW = {
  shadowColor: '#355927',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
} as const;

export const STITCH_SHADOW_FLOAT = {
  shadowColor: '#355927',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 28,
  elevation: 8,
} as const;

/** Official Kafe Eman — Artisanal Sage palette (design.md). */
export const BRAND = {
  bg: '#f9faf2',
  surface: '#f9faf2',
  surfaceLow: '#f3f4ec',
  surfaceContainer: '#edefe6',
  surfaceLowest: '#ffffff',
  text: '#191c18',
  textMuted: '#43493e',
  textFaint: '#73796d',
  onBackground: '#191c18',
  onSurface: '#191c18',
  onSurfaceVariant: '#43493e',
  primary: '#1e4112',
  onPrimary: '#ffffff',
  primaryDark: '#1e4112',
  primaryContainer: '#355927',
  onPrimaryContainer: '#ffffff',
  secondary: '#546348',
  onSecondary: '#ffffff',
  secondaryContainer: '#d5e5c3',
  onSecondaryContainer: '#58674c',
  accent: '#a8d293',
  tertiaryFixed: '#e9e1d6',
  tertiaryFixedDim: '#cdc5bb',
  tertiaryContainer: '#545048',
  onTertiaryFixed: '#1e1b15',
  onTertiaryContainer: '#c9c2b8',
  outline: '#73796d',
  outlineVariant: '#c3c9bb',
  inverseSurface: '#2e312c',
  inverseOnSurface: '#f0f2e9',
  glass: 'rgba(249,250,242,0.70)',
  glassStrong: 'rgba(249,250,242,0.85)',
  glassInset: 'rgba(233,225,214,0.55)',
  glassBorder: 'rgba(195,201,187,0.65)',
  glassBorderStrong: 'rgba(163,180,148,0.55)',
  glassInnerRim: 'rgba(255,255,255,0.55)',
  navBg: 'rgba(249,250,242,0.78)',
  inputBg: '#e9e1d6',
  inputBorder: '#c3c9bb',
  error: '#ba1a1a',
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusMax: 32,
} as const;

/** @deprecated Artisanal Sage is light-only; kept for type compatibility. */
export const LIGHT = BRAND;

/** @deprecated Artisanal Sage is light-only. */
export const DARK = BRAND;

export type ThemeColors = typeof BRAND;

/** Layout rhythm — design.md 8px base */
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

/** Typography scale — Plus Jakarta Sans (design.md) */
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
