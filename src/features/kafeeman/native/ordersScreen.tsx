import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatOrderDate, orderStatusLabel } from '../data';
import { formatRM } from './payments';
import { StitchEmptyState, TabScreenHeader } from './screenChrome';
import { GlassCard } from './stitchUi';
import { AppImage } from './ui';
import { FONTS } from './fonts';
import type { ThemeColors } from '../theme';
import type { OrderRecord } from '../types';

type Props = {
  C: ThemeColors;
  orders: OrderRecord[];
  orderTab: 'Active' | 'Past';
  onTabChange: (tab: 'Active' | 'Past') => void;
  onTrack: (order: OrderRecord) => void;
  onReorder: (order: OrderRecord) => void;
  onBrowseMenu?: () => void;
};

function orderSummary(order: OrderRecord): string {
  const first = order.items[0];
  if (!first) return 'Order';
  const extra = order.items.length > 1 ? ` +${order.items.length - 1} more` : '';
  return `${first.item.name} × ${first.qty}${extra}`;
}

export function OrdersScreen({ C, orders, orderTab, onTabChange, onTrack, onReorder, onBrowseMenu }: Props) {
  const active = orders.filter((o) => o.status === 'active');
  const past = orders.filter((o) => o.status !== 'active');
  const list = orderTab === 'Active' ? active : past;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <TabScreenHeader C={C} title="My Orders" subtitle="Track active orders or reorder favourites" />
      <View style={styles.tabRow}>
        {(['Active', 'Past'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => onTabChange(t)}
            style={[
              styles.tabBtn,
              { backgroundColor: orderTab === t ? C.primaryContainer : C.inputBg },
            ]}
          >
            <Text
              style={{
                color: orderTab === t ? C.onPrimary : C.textMuted,
                fontFamily: FONTS.bold,
                fontSize: 14,
              }}
            >
              {t}
              {t === 'Active' && active.length > 0 ? ` (${active.length})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      {list.length === 0 ? (
        <StitchEmptyState
          C={C}
          icon="receipt-outline"
          title={orderTab === 'Active' ? 'No active orders' : 'No past orders yet'}
          message={
            orderTab === 'Active'
              ? 'Place an order from the menu to see live tracking here.'
              : 'Your completed orders will appear here.'
          }
          actionLabel="Browse menu"
          onAction={onBrowseMenu}
        />
      ) : (
        list.map((order) => {
          const isActive = order.status === 'active';
          const status = orderStatusLabel(order.trackingStep, order.orderType);
          const tapHint = isActive
            ? order.orderType === 'delivery'
              ? 'Tap to track on map'
              : 'Tap for pickup status'
            : 'Tap for order details';
          return (
            <Pressable key={order.id} onPress={() => onTrack(order)}>
              <GlassCard level="sheet" style={{ marginBottom: 12 }}>
              <View style={styles.orderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderId, { color: C.textFaint }]}>{order.id}</Text>
                  <Text style={[styles.orderName, { color: C.text }]}>{orderSummary(order)}</Text>
                  <Text style={[styles.orderMeta, { color: C.textMuted }]}>
                    {formatOrderDate(order.createdAt)} · {order.branch} ·{' '}
                    {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                  </Text>
                </View>
                {order.items[0] && (
                  <AppImage uri={order.items[0].item.image} style={styles.thumb} />
                )}
              </View>
              <View style={styles.orderFooter}>
                <View>
                  <Text style={[styles.status, { color: isActive ? C.accent : '#22c55e' }]}>
                    {status} · {tapHint}
                  </Text>
                  <Text style={[styles.total, { color: C.primary }]}>{formatRM(order.total)}</Text>
                </View>
                <Pressable
                  onPress={() => onReorder(order)}
                  style={[styles.reorderBtn, { borderColor: C.outlineVariant }]}
                >
                  <Ionicons name="refresh" size={16} color={C.primary} />
                  <Text style={[styles.reorderText, { color: C.primary }]}>Reorder</Text>
                </Pressable>
              </View>
              </GlassCard>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 24, paddingTop: 8 },
  title: { fontFamily: FONTS.bold, fontSize: 28, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  emptyCard: { padding: 32, borderRadius: 24, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 16, marginTop: 8 },
  emptySub: { fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center' },
  orderCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  orderId: { fontFamily: FONTS.regular, fontSize: 11, marginBottom: 4 },
  orderName: { fontFamily: FONTS.bold, fontSize: 16 },
  orderMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 4 },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  orderFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  status: { fontFamily: FONTS.semiBold, fontSize: 12 },
  total: { fontFamily: FONTS.bold, fontSize: 16, marginTop: 4 },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  reorderText: { fontFamily: FONTS.semiBold, fontSize: 13 },
});
