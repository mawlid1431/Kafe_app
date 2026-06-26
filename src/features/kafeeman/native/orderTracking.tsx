import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';

import type { OrderStatus } from '../types';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW_FLOAT } from '../theme';
import { FONTS } from './fonts';
import { GlassSurface, StitchPillButton } from './stitchUi';
import { AppImage } from './ui';

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBHSGsXQBQcCkKsW5GzjvJVXrGVIaPyQooSj6tOIrYKYZi2jKOMXm8dJaxJ9KyIbWzJQNrhKh1TO4GOU_7bInep7v3U4oTqjdQhLKwnOR6YIc4HfzUGOZOsWzb959QoPCGbPACdlPPpUcFI9zH-IkvPy8NNBnXx1d61-Y0TZETsia3pS-snD2xrj0ke8nRjIOTdYPOKRMnp9cMXuobOB7lXjzRCy65pqZcEzDO5qTt-4IirSSGmjWbEAqajbna5kRWwNW0OAK-UQWG8';

const RIDER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAzHgLdX0YOS86mh9XCTI25Jfp3B3rtaFkqo1rw3sPXHIShW94u6XXZG9O-FdMjYyfoadG3VgRfdyTaanH3J9ITMzmy4rOSudki5us3xLhgu3e4nsx6xaOIvQYX_9nWLo7Hfe3S7wpRwr8O2lrJtL5xZGDREa-IHHvd2SiKWRg8DxgYhWiBd60plNflKjjY6g1Y_UO0RTF5V1BkhTtEUQN3dcddi1YCsxXeRCMVHZaH-TTf81qWW0ibkVdpCcTWsgdD2vs7XVSVlYbw';

const STEPS: { key: OrderStatus; label: string; sub: string }[] = [
  { key: 'placed', label: 'Order Placed', sub: '10:42 AM' },
  { key: 'preparing', label: 'Brewing', sub: 'Your order is being prepared' },
  { key: 'on-the-way', label: 'On the Way', sub: 'Rider is heading to you' },
  { key: 'arrived', label: 'Delivered', sub: 'Enjoy your coffee!' },
];

function etaForStep(step: number, orderType: 'delivery' | 'pickup'): string {
  if (orderType === 'pickup') {
    return step >= 3 ? 'Ready now' : step >= 2 ? '3 mins' : '8 mins';
  }
  if (step >= 3) return 'Arrived';
  if (step >= 2) return '8 mins';
  if (step >= 1) return '15 mins';
  return '25 mins';
}

function statusLine(step: number, orderType: 'delivery' | 'pickup'): string {
  if (orderType === 'pickup') {
    return step >= 3 ? 'Ready for pickup' : step >= 2 ? 'Order is ready' : 'Barista is crafting your drink';
  }
  if (step >= 3) return 'Delivered';
  if (step >= 2) return 'Rider is on the way';
  if (step >= 1) return 'Your coffee is brewing';
  return 'Order confirmed';
}

export function OrderTrackingScreen({
  C,
  orderRef,
  trackingStep,
  orderType,
  branchName,
  onBack,
  onDone,
}: {
  C: ThemeColors;
  orderRef: string;
  trackingStep: number;
  orderType: 'delivery' | 'pickup';
  branchName: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const eta = etaForStep(trackingStep, orderType);
  const status = statusLine(trackingStep, orderType);
  const showRider = orderType === 'delivery' && trackingStep >= 2;

  return (
    <View style={styles.root}>
      <AppImage uri={MAP_IMAGE} style={StyleSheet.absoluteFillObject} />
      <View style={styles.mapOverlay} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Path
            d="M 22,78 Q 42,58 52,48 T 78,22"
            stroke={C.primary}
            strokeWidth={0.8}
            strokeDasharray="2 2"
            fill="none"
            opacity={0.55}
          />
          <Circle cx={22} cy={78} r={2.2} fill={C.primaryContainer} />
          <Circle cx={78} cy={22} r={2.2} fill={C.accent} />
        </Svg>
      </View>

      <View style={styles.mapHeader}>
        <Pressable onPress={onBack} style={[styles.headerBtn, { borderColor: C.glassBorderStrong }]}>
          <Ionicons name="arrow-back" size={22} color={C.textMuted} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.orderId, { color: C.textMuted }]}>ORDER #{orderRef.replace('KE-', '')}</Text>
          <Text style={[styles.headerTitle, { color: C.primary }]}>Live Tracking</Text>
        </View>
        <Pressable style={[styles.headerBtn, { borderColor: C.glassBorderStrong }]}>
          <Ionicons name="help-circle-outline" size={22} color={C.textMuted} />
        </Pressable>
      </View>

      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.primaryContainer }]} />
          <Text style={[styles.legendText, { color: C.text }]}>{branchName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.accent }]} />
          <Text style={[styles.legendText, { color: C.text }]}>
            {orderType === 'delivery' ? 'Your address' : 'Pickup counter'}
          </Text>
        </View>
      </View>

      <GlassSurface style={[styles.sheet, STITCH_SHADOW_FLOAT]} strong intensity={55}>
        <View style={styles.handle} />
        <Text style={[styles.eta, { color: C.primary }]}>{eta}</Text>
        <Text style={[styles.etaSub, { color: C.textMuted }]}>{status}</Text>

        {showRider && (
          <View style={[styles.riderCard, { borderColor: C.glassBorderStrong, backgroundColor: C.glassStrong }]}>
            <View style={styles.riderLeft}>
              <AppImage uri={RIDER_AVATAR} style={styles.riderAvatar} />
              <View>
                <Text style={[styles.riderName, { color: C.text }]}>Ahmad</Text>
                <View style={styles.riderRating}>
                  <Ionicons name="star" size={14} color={C.onTertiaryContainer} />
                  <Text style={{ color: C.onTertiaryContainer, fontFamily: FONTS.semiBold, fontSize: 12 }}>4.9</Text>
                </View>
              </View>
            </View>
            <View style={styles.riderActions}>
              <Pressable style={[styles.riderBtn, { borderColor: C.outlineVariant, backgroundColor: C.surfaceLowest }]}>
                <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
              </Pressable>
              <Pressable style={[styles.riderBtn, { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer }]}>
                <Ionicons name="call" size={18} color={C.onPrimary} />
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.timeline}>
          {STEPS.map((step, i) => {
            const done = i <= trackingStep;
            const active = i === trackingStep;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  {i < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: i < trackingStep ? C.primaryContainer : C.surfaceContainer },
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
                    {step.label}
                  </Text>
                  <Text style={[styles.timelineSub, { color: C.textMuted }]}>{step.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {trackingStep >= STEPS.length - 1 && (
          <StitchPillButton label="Done" onPress={onDone} C={C} />
        )}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ece0dc' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.95 },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    zIndex: 2,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
  },
  headerCenter: { alignItems: 'center' },
  orderId: { fontFamily: FONTS.semiBold, fontSize: 11, letterSpacing: 1.2 },
  headerTitle: { fontFamily: FONTS.display, fontSize: 22 },
  mapLegend: {
    position: 'absolute',
    top: 72,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    maxHeight: '58%',
  },
  handle: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d3c3c0',
  },
  eta: { fontFamily: FONTS.display, fontSize: 36, textAlign: 'center' },
  etaSub: { fontFamily: FONTS.regular, fontSize: 16, textAlign: 'center', marginBottom: 16 },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  riderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  riderAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  riderName: { fontFamily: FONTS.semiBold, fontSize: 14 },
  riderRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  riderActions: { flexDirection: 'row', gap: 8 },
  riderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeline: { gap: 4, marginBottom: 8 },
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
