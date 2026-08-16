import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AppNotification } from '../types';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { GlassSurface } from './stitchUi';
import { ScreenHeader } from './screenChrome';

const ICONS: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  order: 'bicycle-outline',
  promo: 'pricetag-outline',
  reward: 'gift-outline',
};

function notificationStyle(type: AppNotification['type'], C: ThemeColors, read: boolean) {
  if (read) {
    return {
      iconBg: C.surfaceContainer,
      iconColor: C.primaryContainer,
      stripe: 'transparent' as const,
    };
  }
  switch (type) {
    case 'order':
      return { iconBg: C.primaryContainer, iconColor: C.onPrimary, stripe: C.primaryContainer };
    case 'promo':
      return { iconBg: C.primaryContainer, iconColor: C.onPrimary, stripe: C.accent };
    case 'reward':
      return { iconBg: C.primaryContainer, iconColor: C.onPrimary, stripe: C.secondary };
    default:
      return { iconBg: C.primaryContainer, iconColor: C.onPrimary, stripe: C.primaryContainer };
  }
}

type Props = {
  C: ThemeColors;
  notifications: AppNotification[];
  onBack: () => void;
  onOpenOrder?: (orderId: string) => void;
  onMarkAllRead: () => void;
};

export function NotificationsScreen({
  C,
  notifications,
  onBack,
  onOpenOrder,
  onMarkAllRead,
}: Props) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={styles.scroll}>
      <ScreenHeader
        C={C}
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        onBack={onBack}
        right={
          unread > 0 ? (
            <Pressable onPress={onMarkAllRead} hitSlop={8}>
              <Text style={[styles.markAll, { color: C.primaryContainer }]}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <GlassSurface level="sheet" style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: C.secondaryContainer }]}>
            <Ionicons name="notifications-off-outline" size={22} color={C.primaryContainer} />
          </View>
          <Text style={[styles.emptyTitle, { color: C.text }]}>No notifications yet</Text>
          <Text style={[styles.emptySub, { color: C.textMuted }]}>
            Order updates and promos will show up here.
          </Text>
        </GlassSurface>
      ) : (
        notifications.map((n) => {
          const visual = notificationStyle(n.type, C, n.read);
          return (
            <Pressable
              key={n.id}
              onPress={() => {
                if (n.orderId && onOpenOrder) onOpenOrder(n.orderId);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, marginBottom: 8 }]}
            >
              <GlassSurface
                level="sheet"
                style={[
                  styles.card,
                  !n.read && { borderWidth: 1, borderColor: C.primaryContainer },
                ]}
              >
              {!n.read ? (
                <View style={[styles.unreadStripe, { backgroundColor: visual.stripe }]} />
              ) : null}
              <View style={[styles.iconWrap, { backgroundColor: visual.iconBg }]}>
                <Ionicons name={ICONS[n.type]} size={16} color={visual.iconColor} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  {!n.read ? (
                    <View style={[styles.unreadPill, { backgroundColor: C.secondaryContainer }]}>
                      <Text style={[styles.unreadPillText, { color: C.primaryContainer }]}>New</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.body, { color: C.textMuted }]} numberOfLines={2}>
                  {n.body}
                </Text>
                <Text style={[styles.time, { color: C.textFaint }]}>{n.time}</Text>
              </View>
              {n.orderId ? (
                <Ionicons name="chevron-forward" size={16} color={C.textFaint} style={styles.chevron} />
              ) : null}
              </GlassSurface>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 20, backgroundColor: 'transparent' },
  markAll: { fontFamily: FONTS.semiBold, fontSize: 13 },
  empty: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 16 },
  emptySub: { fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  unreadStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  cardBody: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.semiBold, fontSize: 14, flex: 1 },
  unreadPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unreadPillText: { fontFamily: FONTS.semiBold, fontSize: 10, letterSpacing: 0.3 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  time: { fontFamily: FONTS.medium, fontSize: 11, marginTop: 6 },
  chevron: { marginLeft: 4 },
});
