/** Shared measurements for floating bottom nav + cart / FAB stacking. */
export const BOTTOM_NAV_BAR_HEIGHT = 64;
export const BOTTOM_NAV_SIDE_INSET = 16;
export const FLOATING_CHROME_GAP = 10;
export const FLOATING_BAR_HEIGHT = 52;

export function bottomNavClearance(insets: { bottom: number }) {
  return BOTTOM_NAV_BAR_HEIGHT + Math.max(insets.bottom, 10);
}

/** Bottom offset for cart bar / Order Now FAB — sits just above the glass tab bar. */
export function floatingChromeBottom(insets: { bottom: number }, gap = FLOATING_CHROME_GAP) {
  return bottomNavClearance(insets) + gap;
}

/** ScrollView padding so last items clear floating chrome. */
export function scrollPaddingAboveChrome(
  insets: { bottom: number },
  opts: { hasNav?: boolean; hasFloatingBar?: boolean } = {},
) {
  const { hasNav = true, hasFloatingBar = false } = opts;
  const base = hasNav ? bottomNavClearance(insets) + 16 : insets.bottom + 32;
  return hasFloatingBar ? base + FLOATING_BAR_HEIGHT + 12 : base + 24;
}
