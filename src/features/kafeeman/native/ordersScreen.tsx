import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatOrderDate, orderStatusLabel } from '../data';
import { UnderlineTabBar } from './appShell';
import { formatRM } from './payments';
import { StitchEmptyState } from './screenChrome';
import { AppImage } from './ui';
import { FONTS } from './fonts';
import type { ThemeColors } from '../theme';
import type { OrderRecord } from '../types';

export type OrderFilterTab = 'All' | 'Ongoing' | 'Completed' | 'Canceled';

type Props = {
  C: ThemeColors;
  orders: OrderRecord[];
  orderTab: OrderFilterTab;
  onTabChange: (tab: OrderFilterTab) => void;
  onTrack: (order: OrderRecord) => void;
  onReorder: (order: OrderRecord) => void;
  onBrowseMenu?: () => void;
};

function filterOrders(orders: OrderRecord[], tab: OrderFilterTab): OrderRecord[] {
  switch (tab) {
    case 'Ongoing':
      return orders.filter((o) => o.status === 'active');
    case 'Completed':
      return orders.filter((o) => o.status === 'delivered');
    case 'Canceled':
      return orders.filter((o) => o.status === 'cancelled');
    default:
      return orders;
  }
}

function statusBadge(order: OrderRecord, C: ThemeColors) {
  if (order.status === 'cancelled') {
    return { label: 'Order Canceled', color: '#b42318', bg: '#fef3f2' };
  }
  if (order.status === 'delivered') {
    return { label: 'Completed', color: C.primaryContainer, bg: C.secondaryContainer };
  }
  return {
    label: orderStatusLabel(order.trackingStep, order.orderType),
    color: C.primaryContainer,
    bg: C.secondaryContainer,
  };
}

export function OrdersScreen({ C, orders, orderTab, onTabChange, onTrack, onReorder, onBrowseMenu }: Props) {
  const list = filterOrders(orders, orderTab);

  return (
    <View style={styles.root}>
      <UnderlineTabBar
        C={C}
        tabs={['All', 'Ongoing', 'Completed', 'Canceled'] as const}
        active={orderTab}
        onChange={onTabChange}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {list.length === 0 ? (
          <StitchEmptyState
            C={C}
            icon="receipt-outline"
            title={`No ${orderTab === 'All' ? '' : orderTab.toLowerCase()} orders`}
            message={
              orderTab === 'Ongoing'
                ? 'Place an order from the menu to see live tracking here.'
                : 'Your orders will appear here once you place one.'
            }
            actionLabel="Browse menu"
            onAction={onBrowseMenu}
          />
        ) : (
          <>
            {list.map((order) => {
              const badge = statusBadge(order, C);
              const itemCount = order.items.reduce((sum, line) => sum + line.qty, 0);
              const mode = order.orderType === 'delivery' ? 'Delivery' : 'Pickup';
              return (
                <Pressable
                  key={order.id}
                  onPress={() => onTrack(order)}
                  style={[styles.orderRow, { borderBottomColor: C.outlineVariant }]}
                >
                  {order.items[0] ? (
                    <AppImage uri={order.items[0].item.image} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: C.surfaceContainer }]} />
                  )}
                  <View style={styles.orderBody}>
                    <Text style={[styles.branch, { color: C.text }]} numberOfLines={1}>
                      {order.branch}
                    </Text>
                    <View style={styles.metaRow}>
                      <Ionicons
                        name={order.orderType === 'delivery' ? 'bicycle-outline' : 'bag-outline'}
                        size={12}
                        color={C.textMuted}
                      />
                      <Text style={[styles.meta, { color: C.textMuted }]}>
                        {mode} · {itemCount} item{itemCount === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                    {order.status === 'active' && order.orderType === 'delivery' ? (
                      <Pressable
                        onPress={() => onTrack(order)}
                        style={[styles.mapLink, { borderColor: C.primaryContainer }]}
                      >
                        <Ionicons name="map-outline" size={12} color={C.primaryContainer} />
                        <Text style={[styles.mapLinkText, { color: C.primaryContainer }]}>Live map</Text>
                      </Pressable>
                    ) : null}
                    <Text style={[styles.date, { color: C.textFaint }]}>{formatOrderDate(order.createdAt)}</Text>
                  </View>
                  <View style={styles.orderAside}>
                    <Text style={[styles.price, { color: C.primaryContainer }]}>{formatRM(order.total)}</Text>
                    <Pressable onPress={() => onReorder(order)} style={styles.reorderLink}>
                      <Text style={[styles.reorderText, { color: C.primaryContainer }]}>Reorder</Text>
                      <Ionicons name="chevron-forward" size={12} color={C.primaryContainer} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
            <Text style={[styles.endLabel, { color: C.textFaint }]}>End of the list</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 120, paddingHorizontal: 20, backgroundColor: 'transparent' },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 52, height: 52, borderRadius: 8 },
  orderBody: { flex: 1, gap: 4 },
  branch: { fontFamily: FONTS.bold, fontSize: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontFamily: FONTS.regular, fontSize: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: 10 },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  mapLinkText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  date: { fontFamily: FONTS.regular, fontSize: 11 },
  orderAside: { alignItems: 'flex-end', gap: 6, paddingTop: 2 },
  price: { fontFamily: FONTS.bold, fontSize: 14 },
  reorderLink: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  reorderText: { fontFamily: FONTS.semiBold, fontSize: 12 },
  endLabel: {
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: 13,
    marginTop: 28,
    marginBottom: 12,
  },
});
