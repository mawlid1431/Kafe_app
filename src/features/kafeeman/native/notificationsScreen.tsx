import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AppNotification } from '../types';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW } from '../theme';
import { FONTS } from './fonts';
import { ScreenHeader } from './screenChrome';
import { GlassCard } from './stitchUi';

const ICONS: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  order: 'bicycle',
  promo: 'pricetag',
  reward: 'gift',
};

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
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader
        C={C}
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        onBack={onBack}
        right={
          unread > 0 ? (
            <Pressable onPress={onMarkAllRead}>
              <Text style={[styles.markAll, { color: C.primaryContainer }]}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <GlassCard level="sheet" style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={40} color={C.textFaint} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>No notifications yet</Text>
          <Text style={[styles.emptySub, { color: C.textMuted }]}>
            Order updates and promos will show up here.
          </Text>
        </GlassCard>
      ) : (
        notifications.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => {
              if (n.orderId && onOpenOrder) onOpenOrder(n.orderId);
            }}
          >
            <GlassCard
              level="sheet"
              style={[
                styles.card,
                STITCH_SHADOW,
                !n.read && { borderColor: C.primaryContainer, borderWidth: 1 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: C.secondaryContainer }]}>
                <Ionicons name={ICONS[n.type]} size={20} color={C.primaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: C.text }]}>{n.title}</Text>
                  {!n.read && <View style={[styles.unreadDot, { backgroundColor: C.primaryContainer }]} />}
                </View>
                <Text style={[styles.body, { color: C.textMuted }]}>{n.body}</Text>
                <Text style={[styles.time, { color: C.textFaint }]}>{n.time}</Text>
              </View>
            </GlassCard>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 24 },
  markAll: { fontFamily: FONTS.semiBold, fontSize: 13 },
  empty: { padding: 32, alignItems: 'center', gap: 8, marginTop: 24 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 16, marginTop: 8 },
  emptySub: { fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center' },
  card: { flexDirection: 'row', gap: 12, padding: 14, marginBottom: 10, borderRadius: 18 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: FONTS.semiBold, fontSize: 15, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontFamily: FONTS.regular, fontSize: 13, marginTop: 4, lineHeight: 18 },
  time: { fontFamily: FONTS.regular, fontSize: 11, marginTop: 8 },
});
