import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatOrderDate, PICKUP_ORDER_STEPS } from '../data';
import { pointsToRmDiscount } from '../lib/promos';
import type { OrderRecord } from '../types';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW } from '../theme';
import { formatRM } from './payments';
import { ScreenHeader } from './screenChrome';
import { GlassCard, GlassSurface, StitchPillButton } from './stitchUi';
import { AppImage } from './ui';
import { FONTS } from './fonts';

function etaForPickup(step: number): string {
  if (step >= 3) return 'Collected';
  if (step >= 2) return 'Ready now';
  if (step >= 1) return '5–8 mins';
  return '10–12 mins';
}

function statusForPickup(step: number): string {
  if (step >= 3) return 'Thanks for picking up at the branch';
  if (step >= 2) return 'Your order is ready at the counter';
  if (step >= 1) return 'Barista is preparing your order';
  return 'Order confirmed — we’ll start preparing soon';
}

export function PickupOrderScreen({
  C,
  order,
  onBack,
  onDone,
}: {
  C: ThemeColors;
  order: OrderRecord;
  onBack: () => void;
  onDone: () => void;
}) {
  const step = order.trackingStep;
  const isActive = order.status === 'active';
  const eta = etaForPickup(step);
  const status = statusForPickup(step);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader C={C} title="Pickup order" subtitle={order.id} onBack={onBack} />

        <View style={[styles.modeBadge, { backgroundColor: C.secondaryContainer }]}>
          <Ionicons name="storefront" size={16} color={C.primaryContainer} />
          <Text style={[styles.modeBadgeText, { color: C.primary }]}>Self pickup</Text>
        </View>

        <GlassSurface style={[styles.hero, STITCH_SHADOW]} strong>
          <Text style={[styles.eta, { color: C.primary }]}>{eta}</Text>
          <Text style={[styles.etaSub, { color: C.textMuted }]}>{status}</Text>
        </GlassSurface>

        <GlassCard level="sheet" style={styles.section}>
          <View style={styles.branchRow}>
            <View style={[styles.branchIcon, { backgroundColor: C.tertiaryFixed }]}>
              <Ionicons name="location" size={18} color={C.primaryContainer} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionLabel, { color: C.textFaint }]}>Pickup branch</Text>
              <Text style={[styles.branchName, { color: C.text }]}>{order.branch}</Text>
              <Text style={[styles.branchMeta, { color: C.textMuted }]}>
                {formatOrderDate(order.createdAt)} · Paid via {order.payMethod.toUpperCase()}
              </Text>
            </View>
          </View>
        </GlassCard>

        {order.orderNote ? (
          <GlassCard level="sheet" style={styles.section}>
            <View style={styles.noteRow}>
              <Ionicons name="chatbox-ellipses-outline" size={18} color={C.primaryContainer} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: C.textFaint }]}>Your note</Text>
                <Text style={[styles.noteText, { color: C.text }]}>{order.orderNote}</Text>
              </View>
            </View>
          </GlassCard>
        ) : null}

        <Text style={[styles.sectionTitle, { color: C.primary }]}>Order items</Text>
        {order.items.map((line) => (
          <GlassCard key={`${line.item.id}-${line.sugar}-${line.ice}`} level="sheet" style={styles.lineCard}>
            <View style={styles.lineRow}>
              <AppImage uri={line.item.image} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: C.text }]}>{line.item.name}</Text>
                <Text style={[styles.itemMeta, { color: C.textMuted }]}>
                  {line.sugar} · {line.ice}
                </Text>
                <Text style={[styles.itemQty, { color: C.textFaint }]}>Qty {line.qty}</Text>
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
              <Text style={{ color: C.textMuted }}>Discount</Text>
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
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={[styles.totalLabel, { color: C.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: C.primary }]}>{formatRM(order.total)}</Text>
          </View>
          <Text style={[styles.points, { color: C.accent }]}>+{order.pointsEarned} points earned</Text>
        </GlassCard>

        <Text style={[styles.sectionTitle, { color: C.primary }]}>Order progress</Text>
        <GlassCard level="sheet" style={styles.timelineCard}>
          {PICKUP_ORDER_STEPS.map((s, i) => {
            const done = i <= step;
            const active = isActive && i === step;
            return (
              <View key={s.key} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  {i < PICKUP_ORDER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: i < step ? C.primaryContainer : C.surfaceContainer },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        borderColor: active ? C.accent : done ? C.primaryContainer : C.outlineVariant,
                        backgroundColor: done ? C.primaryContainer : C.surfaceLowest,
                      },
                      active && styles.timelineDotActive,
                    ]}
                  >
                    {done && !active && <Ionicons name="checkmark" size={12} color={C.onPrimary} />}
                    {active && <View style={[styles.timelineDotInner, { backgroundColor: C.accent }]} />}
                  </View>
                </View>
                <View style={styles.timelineBody}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      { color: active ? C.primary : done ? C.text : C.textFaint },
                      active && { fontFamily: FONTS.bold },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text style={[styles.timelineSub, { color: C.textMuted }]}>{s.sub}</Text>
                </View>
              </View>
            );
          })}
        </GlassCard>

        {isActive && step >= PICKUP_ORDER_STEPS.length - 1 ? (
          <StitchPillButton label="Done" onPress={onDone} C={C} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120 },
  modeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  modeBadgeText: { fontFamily: FONTS.semiBold, fontSize: 12 },
  hero: { borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center' },
  eta: { fontFamily: FONTS.display, fontSize: 34, textAlign: 'center' },
  etaSub: { fontFamily: FONTS.regular, fontSize: 15, textAlign: 'center', marginTop: 6 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, marginBottom: 10, marginTop: 4 },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  branchRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  branchIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchName: { fontFamily: FONTS.semiBold, fontSize: 16, marginTop: 2 },
  branchMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 4 },
  noteRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  noteText: { fontFamily: FONTS.regular, fontSize: 14, marginTop: 4, lineHeight: 20 },
  lineCard: { marginBottom: 10 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 15 },
  itemMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  itemQty: { fontFamily: FONTS.regular, fontSize: 11, marginTop: 4 },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryTotal: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15 },
  totalValue: { fontFamily: FONTS.display, fontSize: 20 },
  points: { fontFamily: FONTS.semiBold, fontSize: 12, marginTop: 8 },
  timelineCard: { marginBottom: 24 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 52 },
  timelineRail: { width: 24, alignItems: 'center' },
  timelineLine: {
    position: 'absolute',
    top: 22,
    bottom: -8,
    width: 2,
    left: 11,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    zIndex: 1,
  },
  timelineDotActive: {
    shadowColor: '#ffba38',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4 },
  timelineBody: { flex: 1, paddingTop: 2 },
  timelineLabel: { fontFamily: FONTS.semiBold, fontSize: 14 },
  timelineSub: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
});
