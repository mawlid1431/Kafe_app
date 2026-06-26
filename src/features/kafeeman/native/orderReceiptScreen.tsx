import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatOrderDate } from '../data';
import { pointsToRmDiscount } from '../lib/promos';
import type { OrderRecord } from '../types';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW } from '../theme';
import { formatRM } from './payments';
import { ScreenHeader } from './screenChrome';
import { GlassCard, GlassSurface, StitchPillButton } from './stitchUi';
import { AppImage } from './ui';
import { FONTS } from './fonts';

export function OrderReceiptScreen({
  C,
  order,
  onBack,
  onReorder,
}: {
  C: ThemeColors;
  order: OrderRecord;
  onBack: () => void;
  onReorder: () => void;
}) {
  const cancelled = order.status === 'cancelled';
  const delivered = order.status === 'delivered';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader C={C} title="Order receipt" subtitle={order.id} onBack={onBack} />

        <GlassSurface style={[styles.statusCard, STITCH_SHADOW]} strong>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: cancelled ? '#ffdad6' : C.secondaryContainer },
            ]}
          >
            <Ionicons
              name={cancelled ? 'close-circle' : 'checkmark-circle'}
              size={32}
              color={cancelled ? C.error : C.primaryContainer}
            />
          </View>
          <Text style={[styles.statusTitle, { color: C.text }]}>
            {cancelled ? 'Order cancelled' : delivered ? 'Order completed' : 'Order details'}
          </Text>
          <Text style={[styles.statusSub, { color: C.textMuted }]}>
            {formatOrderDate(order.createdAt)} · {order.branch} ·{' '}
            {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
          </Text>
        </GlassSurface>

        {order.orderNote ? (
          <GlassCard level="sheet" style={styles.section}>
            <Text style={[styles.label, { color: C.textFaint }]}>Your note</Text>
            <Text style={[styles.note, { color: C.text }]}>{order.orderNote}</Text>
          </GlassCard>
        ) : null}

        <Text style={[styles.sectionTitle, { color: C.primary }]}>Items</Text>
        {order.items.map((line) => (
          <GlassCard key={`${line.item.id}-${line.sugar}`} level="sheet" style={styles.lineCard}>
            <View style={styles.lineRow}>
              <AppImage uri={line.item.image} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: C.text }]}>{line.item.name}</Text>
                <Text style={[styles.itemMeta, { color: C.textMuted }]}>
                  {line.sugar} · {line.ice} · Qty {line.qty}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: C.primary }]}>
                {formatRM(line.item.price * line.qty)}
              </Text>
            </View>
          </GlassCard>
        ))}

        <GlassCard level="sheet" style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={{ color: C.textMuted }}>Subtotal</Text>
            <Text style={{ color: C.text }}>{formatRM(order.subtotal)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: C.textMuted }}>Promo discount</Text>
              <Text style={{ color: '#22c55e' }}>-{formatRM(order.discount)}</Text>
            </View>
          )}
          {(order.pointsRedeemed ?? 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: C.textMuted }}>Points used</Text>
              <Text style={{ color: '#22c55e' }}>
                -{formatRM(pointsToRmDiscount(order.pointsRedeemed ?? 0))}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={{ color: C.textMuted }}>
              {order.orderType === 'delivery' ? 'Delivery fee' : 'Pickup'}
            </Text>
            <Text style={{ color: C.text }}>
              {order.deliveryFee > 0 ? formatRM(order.deliveryFee) : 'Free'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: C.text }]}>Total paid</Text>
            <Text style={[styles.totalValue, { color: C.primary }]}>{formatRM(order.total)}</Text>
          </View>
          <Text style={[styles.payMeta, { color: C.textFaint }]}>
            Paid via {order.payMethod.toUpperCase()}
            {!cancelled && order.pointsEarned > 0 ? ` · +${order.pointsEarned} pts earned` : ''}
          </Text>
        </GlassCard>
      </ScrollView>

      {!cancelled && (
        <View style={[styles.footer, { borderTopColor: C.glassBorder }]}>
          <StitchPillButton label="Order again" onPress={onReorder} C={C} icon="refresh" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 100, paddingHorizontal: 24 },
  statusCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16 },
  statusIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontFamily: FONTS.bold, fontSize: 20, marginTop: 12 },
  statusSub: { fontFamily: FONTS.regular, fontSize: 13, marginTop: 6, textAlign: 'center' },
  section: { marginBottom: 12, padding: 14 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, marginBottom: 10 },
  label: { fontFamily: FONTS.semiBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  note: { fontFamily: FONTS.regular, fontSize: 14, marginTop: 6, lineHeight: 20 },
  lineCard: { marginBottom: 8 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: 14 },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 15 },
  itemMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15 },
  totalValue: { fontFamily: FONTS.display, fontSize: 20 },
  payMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 8 },
  footer: { padding: 20, paddingBottom: 28, borderTopWidth: 1, backgroundColor: 'rgba(249,250,242,0.95)' },
});
