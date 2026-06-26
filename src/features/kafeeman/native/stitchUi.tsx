import type { ReactNode } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ThemeColors } from '../theme';
import { BRAND, STITCH_SHADOW, STITCH_SHADOW_FLOAT } from '../theme';
import { FONTS } from './fonts';
import { AppImage } from './ui';

const PROFILE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDvzH4M7oRxmV4mngbleG0YurwR6hD6-doVQk_wPOopSN0PiInmnnrEC69izXPZ0TNcaf-IAiqmkQ3dh3Nl9Vg3ScuPyeYSVfVpDxayOG-FBmX8hdZ8vbWskUewZCRkQZd0k-KAQKOUIxaCvKi4MU4f7p3V2BthU6lm6S80HKk5WDDqEZd4VAEBoIoE9GHfnhqZYsVUPnLCL8GU0-h1YOpPwbIdClRPbuVp6lyThrErkPPB39g_PlJhc7oCCe1-GD1cPpDld7d0-ffX';

export { PROFILE_AVATAR };

export const STITCH_AUTH_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANoa6ZcdyiTO4ljjg4kxR5KKcBo_9eJcGd5Z_gQ7VRcoYw9xU0ev6FSDZebA2jOUTubX9Wk7pS1ubZg4MyDWoTN8OG4I567_L0ZeGW0HBOuwaYqO0xLP7RMRyE3uBS6U0ZOiKngG5-Rc73rZpi36ZQKE7ZTS094SdXGmU5KucyOWVVX7P8QpdW2yroYpclMz0-dlEp2yMfp6073UJ1w6C2AIDrzFGrIwS2JUw_nDrVfgAw-e_1Xej4Jp23cA18GTzqzRPb-jbV3dus';

/** DESIGN.md elevation levels — sheet (cards), float (nav/modals), inset (inputs). */
export type GlassLevel = 'sheet' | 'float' | 'inset';

const GLASS_LEVEL: Record<
  GlassLevel,
  { intensity: number; strong: boolean; blur: boolean; overlay: keyof typeof BRAND | 'glassInset' }
> = {
  sheet: { intensity: 40, strong: false, blur: true, overlay: 'glass' },
  float: { intensity: 60, strong: true, blur: true, overlay: 'glassStrong' },
  inset: { intensity: 32, strong: false, blur: true, overlay: 'glassInset' },
};

export function LiquidGlassBackground({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <LinearGradient
        colors={['#f9f9f9', '#f5ede9', '#f9f9f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(62,39,35,0.07)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.55 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['transparent', 'rgba(62,39,35,0.05)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.75, y: 0.35 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

export function GlassSurface({
  children,
  style,
  intensity,
  strong,
  level = 'sheet',
  blur,
  noShadow,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  strong?: boolean;
  level?: GlassLevel;
  blur?: boolean;
  noShadow?: boolean;
}) {
  const preset = GLASS_LEVEL[level];
  const blurIntensity = intensity ?? preset.intensity;
  const isStrong = strong ?? preset.strong;
  const useBlur = blur ?? preset.blur;
  const overlayKey = isStrong ? 'glassStrong' : preset.overlay;
  const overlay = BRAND[overlayKey as keyof typeof BRAND] as string;
  const shadow =
    noShadow ? undefined : level === 'float' || isStrong ? STITCH_SHADOW_FLOAT : STITCH_SHADOW;

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            backgroundColor: overlay,
            borderWidth: 1,
            borderColor: BRAND.glassBorderStrong,
            overflow: 'hidden',
          },
          shadow,
          style,
        ]}
      >
        <View style={styles.glassInnerRim} />
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.glassWrap, shadow, style]}>
      {useBlur && (
        <BlurView intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFillObject} />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlay }]} />
      <View style={styles.glassInnerRim} pointerEvents="none" />
      <View style={[styles.glassContent, layoutFromStyle(style)]}>{children}</View>
    </View>
  );
}

export function GlassCard({
  children,
  style,
  level = 'sheet',
  noPadding,
  blur,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  level?: GlassLevel;
  noPadding?: boolean;
  blur?: boolean;
}) {
  return (
    <GlassSurface
      level={level}
      blur={blur}
      style={[
        {
          borderRadius: BRAND.radiusXl,
          padding: noPadding ? 0 : 16,
          borderWidth: 1,
          borderColor: BRAND.glassBorderStrong,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </GlassSurface>
  );
}

export function GlassSearchBar({
  C,
  value,
  onChangeText,
  placeholder,
  onClear,
  autoCapitalize,
}: {
  C: ThemeColors;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <GlassSurface level="inset" style={styles.glassSearchWrap}>
      <View style={styles.glassSearchInner}>
        <Ionicons name="search" size={20} color={C.outline} />
        <TextInput
          placeholder={placeholder ?? 'Search...'}
          placeholderTextColor={C.outline}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          style={[styles.glassSearchInput, { color: C.text }]}
        />
        {value.length > 0 && onClear && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={C.outline} />
          </Pressable>
        )}
      </View>
    </GlassSurface>
  );
}

export function GlassInputField({
  C,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  C: ThemeColors;
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text style={[styles.glassFieldLabel, { color: C.textMuted }]}>{label}</Text>
      ) : null}
      <GlassSurface level="inset" style={styles.glassFieldWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textFaint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.glassFieldInput, { color: C.text }]}
        />
      </GlassSurface>
    </View>
  );
}

function layoutFromStyle(style?: StyleProp<ViewStyle>): ViewStyle {
  const flat = StyleSheet.flatten(style) ?? {};
  return {
    flexDirection: flat.flexDirection,
    alignItems: flat.alignItems,
    justifyContent: flat.justifyContent,
    gap: flat.gap,
    flex: flat.flex,
    flexGrow: flat.flexGrow,
    flexShrink: flat.flexShrink,
    alignSelf: flat.alignSelf,
  };
}

export function StitchTopBar({
  C,
  onAvatarPress,
  onNotifyPress,
}: {
  C: ThemeColors;
  onAvatarPress?: () => void;
  onNotifyPress?: () => void;
}) {
  return (
    <GlassSurface level="float" style={styles.topBar}>
      <Pressable onPress={onAvatarPress} style={styles.avatarRing}>
        <AppImage uri={PROFILE_AVATAR} style={styles.avatar} />
      </Pressable>
      <Text style={[styles.brandTitle, { color: C.primary }]}>KAFE EMAN</Text>
      <Pressable onPress={onNotifyPress} style={styles.iconBtn}>
        <Ionicons name="notifications-outline" size={22} color={C.textMuted} />
      </Pressable>
    </GlassSurface>
  );
}

export function StitchBottomNav({
  C,
  tab,
  cartCount,
  onTab,
}: {
  C: ThemeColors;
  tab: string;
  cartCount: number;
  onTab: (key: string) => void;
}) {
  const items = [
    { key: 'home', label: 'Home', icon: 'home' as const, iconOutline: 'home-outline' as const },
    { key: 'menu', label: 'Menu', icon: 'cafe' as const, iconOutline: 'cafe-outline' as const },
    { key: 'cart', label: 'Cart', icon: 'bag' as const, iconOutline: 'bag-outline' as const },
    { key: 'orders', label: 'Orders', icon: 'receipt' as const, iconOutline: 'receipt-outline' as const },
    { key: 'profile', label: 'Profile', icon: 'person' as const, iconOutline: 'person-outline' as const },
  ];

  return (
    <View style={styles.navOuter}>
      <GlassSurface level="float" style={styles.floatingNav}>
        <View style={styles.navInner}>
          {items.map(({ key, label, icon, iconOutline }) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => onTab(key)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <View>
                  {key === 'cart' && cartCount > 0 && (
                    <View style={[styles.navBadge, { backgroundColor: C.error }]}>
                      <Text style={styles.navBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                  <Ionicons
                    name={active ? icon : iconOutline}
                    size={22}
                    color={active ? C.primary : C.secondary}
                    style={{ opacity: active ? 1 : 0.6 }}
                  />
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? C.primary : C.secondary, opacity: active ? 1 : 0.6 },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

export function StitchFeaturedCard({
  C,
  name,
  price,
  image,
  rating,
  onPress,
  onAdd,
  isFavorite,
  onToggleFavorite,
}: {
  C: ThemeColors;
  name: string;
  price: number;
  image: string;
  rating?: number;
  onPress?: () => void;
  onAdd?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.featuredOuter, STITCH_SHADOW]}>
      <GlassSurface level="sheet" style={styles.featuredCard} intensity={40}>
        <View style={styles.featuredImageWrap}>
          <AppImage uri={image} style={styles.featuredImage} />
          {onToggleFavorite && (
            <Pressable onPress={onToggleFavorite} style={styles.favBtn}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#e11d48' : '#fff'} />
            </Pressable>
          )}
          {rating != null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={C.accent} />
              <Text style={[styles.ratingText, { color: C.text }]}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.featuredBody}>
          <Text style={[styles.featuredName, { color: C.text }]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.featuredFooter}>
            <Text style={[styles.featuredPrice, { color: C.primary }]}>RM {price.toFixed(2)}</Text>
            <Pressable onPress={onAdd} style={[styles.addCircle, { backgroundColor: C.primaryContainer }]}>
              <Ionicons name="add" size={18} color={C.onPrimary} />
            </Pressable>
          </View>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

export function StitchMenuCard({
  C,
  name,
  price,
  image,
  width,
  onPress,
  onAdd,
  isFavorite,
  onToggleFavorite,
}: {
  C: ThemeColors;
  name: string;
  price: number;
  image: string;
  width: number;
  onPress?: () => void;
  onAdd?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const cardHeight = Math.round(width * (4 / 3));

  return (
    <Pressable onPress={onPress} style={[styles.menuCardOuter, { width }, STITCH_SHADOW]}>
      <View style={[styles.menuCard, { width, height: cardHeight }]}>
        <AppImage uri={image} style={styles.menuCardImage} />
        {onToggleFavorite && (
          <Pressable onPress={onToggleFavorite} style={styles.menuFavBtn}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={isFavorite ? '#e11d48' : '#fff'} />
          </Pressable>
        )}
        <GlassSurface level="sheet" blur={false} strong style={styles.menuCardPlate}>
          <Text style={[styles.menuCardName, { color: C.text }]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.menuCardFooter}>
            <Text style={[styles.menuCardPrice, { color: C.primaryContainer }]}>RM {price.toFixed(2)}</Text>
            <Pressable onPress={onAdd} style={[styles.addCircleSm, { backgroundColor: C.primaryContainer }]}>
              <Ionicons name="add" size={16} color={C.onPrimary} />
            </Pressable>
          </View>
        </GlassSurface>
      </View>
    </Pressable>
  );
}

export function StitchCategoryChip({
  C,
  label,
  active,
  icon,
  onPress,
}: {
  C: ThemeColors;
  label: string;
  active: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chipOuter, active && STITCH_SHADOW]}>
      {active ? (
        <GlassSurface style={[styles.chip, styles.chipActive]} strong intensity={50}>
          {icon && <Ionicons name={icon} size={16} color={C.tertiaryContainer} />}
          <Text style={[styles.chipTextActive, { color: C.tertiaryContainer }]}>{label}</Text>
        </GlassSurface>
      ) : (
        <View style={[styles.chip, styles.chipInactive, { backgroundColor: BRAND.surfaceLow, borderColor: BRAND.outlineVariant }]}>
          <Text style={[styles.chipText, { color: C.secondary }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function StitchPromoBanner({
  title,
  sub,
  image,
  badge = 'Special Offer',
  code,
  C,
  onPress,
}: {
  title: string;
  sub: string;
  image: string;
  badge?: string;
  code?: string;
  C: ThemeColors;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.promoOuter, STITCH_SHADOW_FLOAT]}>
      <AppImage uri={image} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={[`${C.primary}CC`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.promoContent}>
        <View style={styles.promoBadge}>
          <Text style={[styles.promoBadgeText, { color: C.accent }]}>{badge}</Text>
        </View>
        <Text style={styles.promoTitle}>{title}</Text>
        <Text style={styles.promoSub}>{sub}</Text>
        {code ? (
          <View style={styles.promoCodeChip}>
            <Text style={styles.promoCodeText}>Use code {code}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export function StitchPillButton({
  label,
  onPress,
  C,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress?: () => void;
  C: ThemeColors;
  variant?: 'primary' | 'outline' | 'apple';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const bg =
    variant === 'primary'
      ? C.primaryContainer
      : variant === 'apple'
        ? C.inverseSurface
        : C.surfaceLowest;
  const color =
    variant === 'outline'
      ? C.primary
      : variant === 'apple'
        ? C.inverseOnSurface
        : C.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillBtn,
        styles.pillBtnFull,
        {
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: variant === 'outline' ? C.outline : 'transparent',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && STITCH_SHADOW,
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />}
      <Text style={[styles.pillBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function StitchOptionPill({
  label,
  active,
  onPress,
  C,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  C: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionPill,
        active
          ? { backgroundColor: C.accent, shadowColor: C.accent, shadowOpacity: 0.3, shadowRadius: 12, elevation: 3 }
          : { backgroundColor: 'rgba(238,238,238,0.5)' },
      ]}
    >
      <Text
        style={[
          styles.optionPillText,
          { color: active ? C.onTertiaryFixed : C.textMuted, fontFamily: active ? FONTS.bold : FONTS.regular },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function StitchFloatingCart({
  C,
  count,
  onPress,
}: {
  C: ThemeColors;
  count: number;
  onPress: () => void;
}) {
  if (count <= 0) return null;
  return (
    <View style={styles.floatingCartWrap} pointerEvents="box-none">
      <Pressable onPress={onPress} style={[styles.floatingCart, STITCH_SHADOW_FLOAT]}>
        <GlassSurface level="float" style={styles.floatingCartInner} strong>
          <View style={[styles.floatingCartIcon, { backgroundColor: C.accent }]}>
            <Ionicons name="bag" size={16} color={C.tertiaryContainer} />
          </View>
          <Text style={[styles.floatingCartText, { color: C.primaryContainer }]}>
            {count} item{count !== 1 ? 's' : ''} in cart
          </Text>
          <Ionicons name="arrow-forward" size={18} color={C.secondary} />
        </GlassSurface>
      </Pressable>
    </View>
  );
}

/** Fixed CTA bar — use `aboveNav` on tab screens so it sits above the floating bottom nav. */
export function StitchStickyFooter({
  children,
  aboveNav,
}: {
  children: ReactNode;
  aboveNav?: boolean;
}) {
  return (
    <View style={[styles.stickyFooter, aboveNav && styles.stickyFooterAboveNav]} pointerEvents="box-none">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassWrap: { overflow: 'hidden' },
  glassContent: { zIndex: 1, position: 'relative' },
  glassInnerRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: BRAND.glassInnerRim,
    zIndex: 2,
  },
  glassSearchWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.glassBorderStrong,
    overflow: 'hidden',
  },
  glassSearchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  glassSearchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  glassFieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    marginBottom: 6,
  },
  glassFieldWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.glassBorderStrong,
    overflow: 'hidden',
  },
  glassFieldInput: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatar: { width: '100%', height: '100%' },
  brandTitle: {
    fontFamily: FONTS.display,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  navOuter: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    zIndex: 50,
  },
  floatingNav: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  navInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 72,
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  navItemActive: {
    backgroundColor: 'rgba(62,39,35,0.08)',
    borderWidth: 1,
    borderColor: BRAND.outlineVariant,
  },
  navLabel: { fontSize: 10, fontFamily: FONTS.semiBold, marginTop: 2 },
  navBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  navBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONTS.bold,
    lineHeight: 12,
  },
  featuredOuter: { width: 256, marginRight: 16 },
  featuredCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    gap: 16,
  },
  featuredImageWrap: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: { width: '100%', height: '100%' },
  favBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ratingText: { fontSize: 12, fontFamily: FONTS.semiBold },
  featuredBody: { gap: 8 },
  featuredName: { fontFamily: FONTS.semiBold, fontSize: 14 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPrice: { fontFamily: FONTS.display, fontSize: 20 },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCardOuter: { marginBottom: 4 },
  menuCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#fff',
  },
  menuCardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  menuFavBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  menuCardPlate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND.glassBorderStrong,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  menuCardName: { fontFamily: FONTS.semiBold, fontSize: 14, marginBottom: 4 },
  menuCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuCardPrice: { fontFamily: FONTS.semiBold, fontSize: 16 },
  addCircleSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOuter: { marginRight: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  chipActive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  chipInactive: {
    borderWidth: 1,
  },
  chipText: { fontFamily: FONTS.semiBold, fontSize: 14 },
  chipTextActive: { fontFamily: FONTS.semiBold, fontSize: 14 },
  promoOuter: {
    height: 192,
    borderRadius: 24,
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  promoBadgeText: { fontFamily: FONTS.semiBold, fontSize: 12, letterSpacing: 0.5 },
  promoTitle: {
    color: '#fff',
    fontFamily: FONTS.display,
    fontSize: 24,
    marginBottom: 4,
  },
  promoSub: { color: 'rgba(255,255,255,0.9)', fontFamily: FONTS.regular, fontSize: 14, maxWidth: '70%' },
  promoCodeChip: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,186,56,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promoCodeText: { fontFamily: FONTS.bold, fontSize: 11, color: '#281900' },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  pillBtnFull: { width: '100%', alignSelf: 'stretch' },
  pillBtnText: { fontFamily: FONTS.semiBold, fontSize: 14, letterSpacing: 0.5 },
  optionPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  optionPillText: { fontSize: 14 },
  floatingCartWrap: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
  },
  floatingCart: { borderRadius: 999, overflow: 'hidden' },
  floatingCartInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  floatingCartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCartText: { fontFamily: FONTS.semiBold, fontSize: 14 },
  stickyFooter: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    zIndex: 45,
  },
  stickyFooterAboveNav: {
    bottom: 104,
  },
});
