import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND_ASSETS, LOGO_GREEN, LOGO_GREEN_DARK, LOGO_GREEN_LIGHT } from '../brand';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW, STITCH_SHADOW_FLOAT } from '../theme';
import { FONTS } from './fonts';
import { GlassSurface } from './stitchUi';
import { AppImage } from './ui';

export function AppPickupHeader({
  C,
  orderType,
  branch,
  onPress,
  onNotifyPress,
  notifyCount = 0,
}: {
  C: ThemeColors;
  orderType: 'delivery' | 'pickup';
  branch: string;
  onPress?: () => void;
  onNotifyPress?: () => void;
  notifyCount?: number;
}) {
  const insets = useSafeAreaInsets();
  const mode = orderType === 'delivery' ? 'Delivery' : 'Pickup';
  const eta = orderType === 'delivery' ? '30–45 min' : 'Today, ASAP';

  return (
    <View style={[styles.pickupHeader, { backgroundColor: C.primaryContainer, paddingTop: insets.top + 8 }]}>
      <View style={styles.pickupHeaderRow}>
        <Pressable onPress={onPress} style={styles.pickupHeaderMain}>
          <Text style={styles.pickupHeaderMode}>
            {mode} · {eta}
          </Text>
          <View style={styles.pickupHeaderBranchRow}>
            <Text style={styles.pickupHeaderBranch} numberOfLines={1}>
              {branch}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.85)" />
          </View>
        </Pressable>
        <Pressable onPress={onNotifyPress} style={styles.pickupHeaderAction} hitSlop={6}>
          <Ionicons name="notifications-outline" size={18} color="#fff" />
          {notifyCount > 0 && (
            <View style={[styles.notifyDot, { backgroundColor: C.error }]}>
              <Text style={styles.notifyDotText}>{notifyCount > 9 ? '9+' : notifyCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function LoyaltyHeroCard({
  C,
  name,
  points,
  subtitle,
  onPress,
}: {
  C: ThemeColors;
  name: string;
  points: number;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.loyaltyOuter}>
      <View style={[styles.loyaltyCard, { backgroundColor: C.primaryContainer }]}>
        <View style={styles.loyaltyTop}>
          <Text style={styles.loyaltyLabel}>Your points</Text>
          <Text style={styles.loyaltyHello}>Hello, {name.split(' ')[0]}</Text>
          <View style={styles.loyaltyPointsRow}>
            <Text style={styles.loyaltyPoints}>{points.toLocaleString()}</Text>
            <Image source={BRAND_ASSETS.icon} style={styles.loyaltyIcon} contentFit="cover" />
          </View>
        </View>
        <View style={[styles.loyaltyFooter, { borderTopColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name="gift-outline" size={18} color="#fff" />
          <Text style={styles.loyaltyFooterText} numberOfLines={1}>
            {subtitle}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.85)" />
        </View>
      </View>
    </Pressable>
  );
}

export function OrderNowFab({
  C,
  onPress,
  bottom = 88,
}: {
  C: ThemeColors;
  onPress: () => void;
  bottom?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.orderFabOuter, { bottom, opacity: pressed ? 0.92 : 1 }]}
    >
      <GlassSurface level="float" strong style={styles.orderFabGlass}>
        <LinearGradient
          colors={[C.primaryContainer, `${C.primaryContainer}E8`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.orderFabInner}>
          <Text style={styles.orderFabText}>Order Now</Text>
          <Ionicons name="arrow-forward" size={18} color={C.onPrimary} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

export function AppBottomNav({
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
  const insets = useSafeAreaInsets();
  const items = [
    { key: 'home', label: 'Home', icon: 'home' as const, iconOutline: 'home-outline' as const },
    { key: 'menu', label: 'Menu', icon: 'cafe' as const, iconOutline: 'cafe-outline' as const },
    { key: 'orders', label: 'Orders', icon: 'receipt' as const, iconOutline: 'receipt-outline' as const },
    { key: 'cart', label: 'Cart', icon: 'bag' as const, iconOutline: 'bag-outline' as const },
    { key: 'profile', label: 'Account', icon: 'person' as const, iconOutline: 'person-outline' as const },
  ];

  return (
    <View style={[styles.bottomNavOuter, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <GlassSurface level="float" strong style={styles.bottomNavGlass}>
        <View style={styles.bottomNavInner}>
          {items.map(({ key, label, icon, iconOutline }) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => onTab(key)}
                style={[styles.bottomNavItem, active && styles.bottomNavItemActive]}
              >
                <View>
                  {key === 'cart' && cartCount > 0 && (
                    <View style={[styles.cartBadge, { backgroundColor: C.error }]}>
                      <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                  <Ionicons name={active ? icon : iconOutline} size={20} color={active ? C.primary : C.textFaint} />
                </View>
                <Text style={[styles.bottomNavLabel, { color: active ? C.primary : C.textFaint }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

export function LiveDeliveryBanner({
  C,
  orderId,
  branch,
  etaLabel,
  onPress,
}: {
  C: ThemeColors;
  orderId: string;
  branch: string;
  etaLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.liveDeliveryBanner,
        { backgroundColor: C.primaryContainer, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.liveDeliveryLeft}>
        <View style={styles.liveDeliveryIcon}>
          <Ionicons name="map-outline" size={16} color={C.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.liveDeliveryTitle}>Live delivery map</Text>
          <Text style={styles.liveDeliverySub} numberOfLines={1}>
            {orderId} · {branch}
          </Text>
        </View>
      </View>
      <View style={styles.liveDeliveryRight}>
        <Text style={styles.liveDeliveryEta}>{etaLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color={C.onPrimary} />
      </View>
    </Pressable>
  );
}

export function SectionHeading({
  C,
  title,
  actionLabel,
  onAction,
}: {
  C: ThemeColors;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionHeadingTitle, { color: C.text }]}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.sectionHeadingAction, { color: C.primaryContainer }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MenuListRow({
  C,
  name,
  price,
  image,
  badge,
  onPress,
  onAdd,
}: {
  C: ThemeColors;
  name: string;
  price: number;
  image: string;
  badge?: string;
  onPress?: () => void;
  onAdd?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRowOuter, { opacity: pressed ? 0.92 : 1 }]}
    >
      <GlassSurface level="sheet" style={styles.menuRow}>
      <View style={styles.menuRowImageWrap}>
        <AppImage uri={image} style={styles.menuRowImage} />
        {badge ? (
          <View style={[styles.menuRowBadge, { backgroundColor: C.primaryContainer }]}>
            <Text style={styles.menuRowBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.menuRowBody}>
        <Text style={[styles.menuRowName, { color: C.text }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.menuRowPrice, { color: C.primaryContainer }]}>RM {price.toFixed(2)}</Text>
      </View>
      <Pressable onPress={onAdd} style={[styles.menuRowAdd, { borderColor: C.primaryContainer }]}>
        <Ionicons name="add" size={16} color={C.primaryContainer} />
      </Pressable>
      </GlassSurface>
    </Pressable>
  );
}

export function UnderlineTabBar<T extends string>({
  C,
  tabs,
  active,
  onChange,
}: {
  C: ThemeColors;
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <View style={[styles.underlineTabs, { borderBottomColor: C.outlineVariant }]}>
      {tabs.map((tab) => {
        const selected = tab === active;
        return (
          <Pressable key={tab} onPress={() => onChange(tab)} style={styles.underlineTab}>
            <Text
              style={[
                styles.underlineTabText,
                { color: selected ? C.primaryContainer : C.textMuted },
              ]}
            >
              {tab}
            </Text>
            {selected ? <View style={[styles.underlineTabIndicator, { backgroundColor: C.primaryContainer }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function StoreInfoBanner({
  C,
  branch,
  orderType,
  onPress,
}: {
  C: ThemeColors;
  branch: string;
  orderType: 'delivery' | 'pickup';
  onPress?: () => void;
}) {
  const wait = orderType === 'delivery' ? '30–45 minutes' : '5–10 minutes';
  return (
    <View style={styles.storeBannerWrap}>
      <View style={styles.storeBannerTop}>
        <Text style={[styles.storeBannerName, { color: C.text }]}>{branch}</Text>
        <View style={[styles.openBadge, { backgroundColor: C.secondaryContainer }]}>
          <Text style={[styles.openBadgeText, { color: C.primaryContainer }]}>Open</Text>
        </View>
        <Pressable onPress={onPress}>
          <Text style={[styles.storeBannerChange, { color: C.primaryContainer }]}>Change</Text>
        </Pressable>
      </View>
      <View style={[styles.waitBanner, { backgroundColor: `${C.secondaryContainer}88` }]}>
        <Ionicons name="time-outline" size={16} color={C.primaryContainer} />
        <Text style={[styles.waitBannerText, { color: C.primaryContainer }]}>
          Estimated waiting time {wait}
        </Text>
      </View>
    </View>
  );
}

type AccountRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export function AccountMenu({
  C,
  sections,
}: {
  C: ThemeColors;
  sections: { title: string; rows: AccountRow[] }[];
}) {
  return (
    <View style={styles.accountMenu}>
      {sections.map((section) => (
        <View key={section.title} style={styles.accountSection}>
          <Text style={[styles.accountSectionTitle, { color: C.textFaint }]}>{section.title}</Text>
          <GlassSurface level="sheet" style={styles.accountCard}>
            {section.rows.map((row, index) => (
              <Pressable
                key={row.label}
                onPress={row.onPress}
                style={[
                  styles.accountRow,
                  index < section.rows.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.outlineVariant,
                  },
                ]}
              >
                <Ionicons
                  name={row.icon}
                  size={18}
                  color={row.destructive ? C.error : C.primaryContainer}
                />
                <Text
                  style={[
                    styles.accountRowLabel,
                    { color: row.destructive ? C.error : C.text },
                  ]}
                >
                  {row.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
              </Pressable>
            ))}
          </GlassSurface>
        </View>
      ))}
    </View>
  );
}

export function OrderTypeChoiceCard({
  icon,
  title,
  subtitle,
  gradientColors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  gradientColors: readonly [string, string, ...string[]];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.orderTypeOuter, { opacity: pressed ? 0.94 : 1 }]}
    >
      <GlassSurface level="float" strong style={styles.orderTypeGlass}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.orderTypeRow}>
          <View style={styles.orderTypeIconRing}>
            <Ionicons name={icon} size={22} color="#fff" />
          </View>
          <View style={styles.orderTypeCopy}>
            <Text style={styles.orderTypeTitle}>{title}</Text>
            <Text style={styles.orderTypeSub}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.85)" />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

export function ScreenTitleBar({
  C,
  title,
  children,
}: {
  C: ThemeColors;
  title: string;
  children?: ReactNode;
}) {
  return (
    <View style={[styles.screenTitleBar, { borderBottomColor: C.outlineVariant }]}>
      <Text style={[styles.screenTitleBarText, { color: C.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pickupHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  pickupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pickupHeaderMain: { flex: 1 },
  pickupHeaderMode: {
    color: '#fff',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  pickupHeaderBranchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pickupHeaderBranch: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: FONTS.regular,
    fontSize: 13,
    flex: 1,
  },
  pickupHeaderAction: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifyDotText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 8 },
  loyaltyOuter: { marginBottom: 16 },
  loyaltyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...STITCH_SHADOW,
  },
  loyaltyTop: { padding: 20, paddingBottom: 16, gap: 4 },
  loyaltyLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  loyaltyHello: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 18 },
  loyaltyPointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  loyaltyPoints: {
    color: '#fff',
    fontFamily: FONTS.display,
    fontSize: 36,
    letterSpacing: -0.5,
  },
  loyaltyIcon: { width: 32, height: 32, borderRadius: 8 },
  loyaltyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  loyaltyFooterText: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: '#fff' },
  orderFabOuter: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 40,
    ...STITCH_SHADOW_FLOAT,
  },
  orderFabGlass: {
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 44,
  },
  orderFabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  orderFabText: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 15 },
  bottomNavOuter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 50,
  },
  bottomNavGlass: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  bottomNavInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 4,
  },
  bottomNavItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6, borderRadius: 20 },
  bottomNavItemActive: { backgroundColor: 'rgba(96,128,112,0.08)' },
  bottomNavLabel: { fontFamily: FONTS.medium, fontSize: 10 },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 1,
  },
  cartBadgeText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 9 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeadingTitle: { fontFamily: FONTS.bold, fontSize: 20 },
  sectionHeadingAction: { fontFamily: FONTS.semiBold, fontSize: 14 },
  menuRowOuter: { marginBottom: 10 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  menuRowImageWrap: { position: 'relative' },
  menuRowImage: { width: 72, height: 72, borderRadius: 12 },
  menuRowBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuRowBadgeText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 9 },
  menuRowBody: { flex: 1, gap: 6 },
  menuRowName: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 20 },
  menuRowPrice: { fontFamily: FONTS.bold, fontSize: 15 },
  menuRowAdd: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  underlineTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  underlineTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  underlineTabText: { fontFamily: FONTS.semiBold, fontSize: 14 },
  underlineTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 3,
    borderRadius: 2,
  },
  storeBannerWrap: { paddingBottom: 12 },
  storeBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  storeBannerName: { fontFamily: FONTS.bold, fontSize: 18 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  openBadgeText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  storeBannerChange: { fontFamily: FONTS.semiBold, fontSize: 13 },
  waitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  waitBannerText: { fontFamily: FONTS.medium, fontSize: 13 },
  liveDeliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  liveDeliveryLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveDeliveryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDeliveryTitle: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 14 },
  liveDeliverySub: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.regular, fontSize: 11, marginTop: 1 },
  liveDeliveryRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  liveDeliveryEta: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 12 },
  accountMenu: { gap: 20 },
  accountSection: { gap: 8 },
  accountSectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  accountCard: { borderRadius: 16, overflow: 'hidden' },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accountRowLabel: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 15 },
  orderTypeOuter: { marginBottom: 12, ...STITCH_SHADOW_FLOAT },
  orderTypeGlass: { borderRadius: 18, overflow: 'hidden' },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  orderTypeIconRing: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  orderTypeCopy: { flex: 1, gap: 2 },
  orderTypeTitle: { color: '#fff', fontFamily: FONTS.bold, fontSize: 17 },
  orderTypeSub: { color: 'rgba(255,255,255,0.82)', fontFamily: FONTS.regular, fontSize: 13 },
  screenTitleBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  screenTitleBarText: { fontFamily: FONTS.semiBold, fontSize: 17 },
});
