import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND_ASSETS } from '../brand';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
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
    <View style={[styles.pickupHeader, { backgroundColor: C.primary, paddingTop: insets.top + 8 }]}>
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
        <Pressable onPress={onNotifyPress} style={styles.pickupHeaderAction}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
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
      <LinearGradient
        colors={[C.primary, C.primaryContainer, '#2a4a1c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loyaltyGradient}
      >
        <View style={styles.loyaltyTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.loyaltyHello}>Hello, {name.split(' ')[0]}!</Text>
            <View style={styles.loyaltyPointsRow}>
              <Text style={styles.loyaltyPoints}>{points.toLocaleString()}</Text>
              <Image source={BRAND_ASSETS.icon} style={styles.loyaltyIcon} contentFit="cover" />
            </View>
          </View>
        </View>
        <View style={[styles.loyaltyFooter, { backgroundColor: C.secondaryContainer }]}>
          <Ionicons name="gift-outline" size={18} color={C.primaryContainer} />
          <Text style={[styles.loyaltyFooterText, { color: C.primaryContainer }]} numberOfLines={1}>
            {subtitle}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={C.primaryContainer} />
        </View>
      </LinearGradient>
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
      style={[styles.orderFab, { backgroundColor: C.primaryContainer, bottom }]}
    >
      <Text style={styles.orderFabText}>Order Now</Text>
      <Ionicons name="arrow-forward" size={18} color={C.onPrimary} />
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
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: C.surfaceLowest,
          borderTopColor: C.outlineVariant,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {items.map(({ key, label, icon, iconOutline }) => {
        const active = tab === key;
        return (
          <Pressable key={key} onPress={() => onTab(key)} style={styles.bottomNavItem}>
            <View>
              {key === 'cart' && cartCount > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: C.error }]}>
                  <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
              <Ionicons name={active ? icon : iconOutline} size={22} color={active ? C.primary : C.textFaint} />
            </View>
            <Text style={[styles.bottomNavLabel, { color: active ? C.primary : C.textFaint }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
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
    <Pressable onPress={onPress} style={[styles.menuRow, { borderBottomColor: C.outlineVariant }]}>
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
      <Pressable onPress={onAdd} style={[styles.menuRowAdd, { backgroundColor: C.primaryContainer }]}>
        <Ionicons name="add" size={20} color={C.onPrimary} />
      </Pressable>
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
          <View style={[styles.accountCard, { backgroundColor: C.surfaceLowest, borderColor: C.outlineVariant }]}>
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
                  size={20}
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
                <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
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
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifyDotText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 9 },
  loyaltyOuter: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  loyaltyGradient: { borderRadius: 16, overflow: 'hidden' },
  loyaltyTop: { padding: 20, paddingBottom: 24 },
  loyaltyHello: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONTS.medium,
    fontSize: 15,
    marginBottom: 8,
  },
  loyaltyPointsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loyaltyPoints: {
    color: '#fff',
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    letterSpacing: -0.5,
  },
  loyaltyIcon: { width: 36, height: 36, borderRadius: 10 },
  loyaltyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loyaltyFooterText: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 13 },
  orderFab: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 40,
    shadowColor: '#1e4112',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  orderFabText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    zIndex: 50,
  },
  bottomNavItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  bottomNavLabel: { fontFamily: FONTS.medium, fontSize: 11 },
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  accountMenu: { gap: 20 },
  accountSection: { gap: 8 },
  accountSectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  accountCard: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accountRowLabel: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 15 },
  screenTitleBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  screenTitleBarText: { fontFamily: FONTS.semiBold, fontSize: 17 },
});
