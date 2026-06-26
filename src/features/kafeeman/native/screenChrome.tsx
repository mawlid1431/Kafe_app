import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ThemeColors } from '../theme';
import { SPACING, TYPE } from '../theme';
import { FONTS } from './fonts';
import { GlassCard, StitchPillButton } from './stitchUi';

export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function ScreenHeader({
  C,
  title,
  subtitle,
  onBack,
  right,
}: {
  C: ThemeColors;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={[styles.backBtn, { backgroundColor: C.glassStrong }]} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: C.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.headerSub, { color: C.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View style={styles.backSpacer} />}
    </View>
  );
}

export function TabScreenHeader({
  C,
  title,
  subtitle,
}: {
  C: ThemeColors;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.tabHeader}>
      <Text style={[TYPE.screenTitle, { color: C.primary }]}>{title}</Text>
      {subtitle ? <Text style={[TYPE.caption, { color: C.textMuted, marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function StitchStoreBar({
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
  const eta = orderType === 'delivery' ? '30–45 min' : '5–10 min';
  const mode = orderType === 'delivery' ? 'Delivery' : 'Pickup';

  return (
    <Pressable onPress={onPress}>
      <GlassCard level="sheet" style={styles.storeBar}>
        <View style={[styles.storeIcon, { backgroundColor: C.tertiaryFixed }]}>
          <Ionicons name={orderType === 'delivery' ? 'bicycle' : 'storefront'} size={18} color={C.primaryContainer} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[TYPE.label, { color: C.text }]} numberOfLines={1}>
            {branch}
          </Text>
          <Text style={[TYPE.caption, { color: C.textMuted }]}>
            {mode} · {eta}
          </Text>
        </View>
        <Text style={[TYPE.label, { color: C.primary }]}>Change</Text>
        <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
      </GlassCard>
    </Pressable>
  );
}

export function StitchEmptyState({
  C,
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  C: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <GlassCard level="sheet" style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: C.secondaryContainer }]}>
        <Ionicons name={icon} size={32} color={C.primary} />
      </View>
      <Text style={[TYPE.sectionTitle, { color: C.text, textAlign: 'center', marginTop: 16 }]}>{title}</Text>
      <Text style={[TYPE.body, { color: C.textMuted, textAlign: 'center', marginTop: 8 }]}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={{ width: '100%', marginTop: 20 }}>
          <StitchPillButton label={actionLabel} onPress={onAction} C={C} />
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screen,
    paddingTop: 8,
    paddingBottom: SPACING.md,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { width: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: FONTS.display, fontSize: 20, textAlign: 'center' },
  headerSub: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2, textAlign: 'center' },
  tabHeader: { paddingHorizontal: SPACING.screen, paddingTop: 8, paddingBottom: SPACING.md },
  storeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: SPACING.md,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 32, marginTop: SPACING.lg },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
