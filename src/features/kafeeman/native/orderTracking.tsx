import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ORDER_STEPS, RIDER_CONTACT } from '../data';
import { LOGO_GREEN } from '../brand';
import { hapticLight, hapticMedium } from '../lib/haptics';
import type { OrderRecord } from '../types';
import type { ThemeColors } from '../theme';
import { BRAND } from '../theme';
import { FONTS } from './fonts';
import { formatRM } from './payments';
import { RiderChatSheet } from './riderChatSheet';
import { StitchPillButton, GlassSurface } from './stitchUi';
import { TrackingMap, type LiveTrackingState } from './trackingMap';
import { AppImage } from './ui';

const RIDER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAzHgLdX0YOS86mh9XCTI25Jfp3B3rtaFkqo1rw3sPXHIShW94u6XXZG9O-FdMjYyfoadG3VgRfdyTaanH3J9ITMzmy4rOSudki5us3xLhgu3e4nsx6xaOIvQYX_9nWLo7Hfe3S7wpRwr8O2lrJtL5xZGDREa-IHHvd2SiKWRg8DxgYhWiBd60plNflKjjY6g1Y_UO0RTF5V1BkhTtEUQN3dcddi1YCsxXeRCMVHZaH-TTf81qWW0ibkVdpCcTWsgdD2vs7XVSVlYbw';

const STEP_LABELS = ['Placed', 'Preparing', 'On the way', 'Delivered'];

function useMemoLiveAge(updatedAt: number | undefined, now: Date): string {
  if (!updatedAt) return 'Updating…';
  const seconds = Math.max(0, Math.floor((now.getTime() - updatedAt) / 1000));
  if (seconds < 5) return 'Updated just now';
  if (seconds < 60) return `Updated ${seconds}s ago`;
  return `Updated ${Math.floor(seconds / 60)}m ago`;
}

function etaLabel(step: number, liveMinutes?: number): string {
  if (step >= 3) return 'Arrived';
  if (step >= 2 && liveMinutes != null) return liveMinutes <= 1 ? '< 1 min' : `${liveMinutes} min`;
  if (step >= 2) return '8 min';
  if (step >= 1) return '15 min';
  return '25 min';
}

function statusForDelivery(step: number): string {
  if (step >= 3) return 'Your order has been delivered';
  if (step >= 2) return `${RIDER_CONTACT.name} is heading to you with your order`;
  if (step >= 1) return 'Your coffee is being prepared at the branch';
  return 'Order confirmed — we’ll start preparing soon';
}

async function dialRider(phone: string) {
  const normalized = phone.replace(/[\s-]/g, '');
  const urls = [`telprompt:${normalized}`, `tel:${normalized}`];
  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      // try next scheme
    }
  }
  return false;
}

/** Live map tracking — delivery orders only (Foodpanda-style). */
export function DeliveryTrackingScreen({
  C,
  order,
  onBack,
  onDone,
  onCancel,
}: {
  C: ThemeColors;
  order: OrderRecord;
  onBack: () => void;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [chatOpen, setChatOpen] = useState(false);
  const [liveTracking, setLiveTracking] = useState<LiveTrackingState | null>(null);
  const [liveClock, setLiveClock] = useState(() => new Date());
  const trackingStep = order.trackingStep;
  const eta = etaLabel(trackingStep, liveTracking?.etaMinutes);
  const status = statusForDelivery(trackingStep);
  const isActive = order.status === 'active';
  const riderLive = isActive && trackingStep >= 2;
  const canCancel = isActive && trackingStep < 2;

  useEffect(() => {
    if (!isActive || trackingStep < 2) return;
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isActive, trackingStep]);

  const liveUpdatedLabel = useMemoLiveAge(liveTracking?.updatedAt, liveClock);

  const handleLiveUpdate = useCallback((state: LiveTrackingState) => {
    setLiveTracking(state);
  }, []);

  const callRider = useCallback(async () => {
    void hapticMedium();
    const ok = await dialRider(RIDER_CONTACT.phone);
    if (!ok) {
      Alert.alert('Call rider', `Dial ${RIDER_CONTACT.phone}`, [{ text: 'OK' }]);
    }
  }, []);

  const openChat = useCallback(() => {
    void hapticLight();
    setChatOpen(true);
  }, []);

  return (
    <View style={styles.root}>
      <TrackingMap
        C={C}
        branchName={order.branch}
        trackingStep={trackingStep}
        isLive={isActive}
        onLiveUpdate={handleLiveUpdate}
      />

      <View style={[styles.mapHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={18} color={C.text} />
        </Pressable>
        {isActive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Live tracking</Text>
          </View>
        )}
        <View style={{ width: 34 }} />
      </View>

      {riderLive && (
        <View style={[styles.mapEtaCard, { top: insets.top + 56 }]}>
          <Text style={[styles.mapEtaValue, { color: C.primary }]}>{eta}</Text>
          <Text style={[styles.mapEtaLabel, { color: C.textMuted }]}>ETA</Text>
          <Text style={[styles.mapEtaLive, { color: C.success }]}>{liveUpdatedLabel}</Text>
        </View>
      )}

      <GlassSurface level="float" strong style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.handle, { backgroundColor: C.outlineVariant }]} />

        <View style={styles.etaRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eta, { color: C.primary }]}>{eta}</Text>
            <Text style={[styles.etaSub, { color: C.textMuted }]} numberOfLines={2}>
              {status}
            </Text>
          </View>
          <View style={[styles.orderPill, { backgroundColor: C.secondaryContainer }]}>
            <Text style={[styles.orderPillText, { color: C.primary }]}>{formatRM(order.total)}</Text>
          </View>
        </View>

        <View style={styles.stepperWrap}>
          <View style={styles.stepperRail} pointerEvents="none">
            <View style={[styles.stepperTrack, { backgroundColor: C.surfaceContainer }]} />
            <View
              style={[
                styles.stepperTrackFill,
                {
                  backgroundColor: C.primaryContainer,
                  width: `${(trackingStep / Math.max(1, STEP_LABELS.length - 1)) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.stepRow}>
            {STEP_LABELS.map((label, i) => {
              const done = i <= trackingStep;
              const active = isActive && i === trackingStep;
              const upcoming = i > trackingStep;
              return (
                <View key={label} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: done ? C.primaryContainer : C.surfaceLowest,
                        borderColor: done
                          ? C.primaryContainer
                          : active
                            ? C.primaryContainer
                            : C.outlineVariant,
                        borderWidth: done ? 0 : 2,
                      },
                      active && styles.stepDotActive,
                    ]}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={12} color={C.onPrimary} />
                    ) : active ? (
                      <View style={[styles.stepDotInner, { backgroundColor: C.primaryContainer }]} />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: active ? C.primaryContainer : done ? C.text : C.textMuted,
                        fontFamily: active ? FONTS.bold : FONTS.semiBold,
                        opacity: upcoming && !active ? 0.85 : 1,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {riderLive ? (
          <View style={[styles.riderCard, { borderColor: C.glassBorderStrong, backgroundColor: C.glassStrong }]}>
            <View style={styles.riderLeft}>
              <AppImage uri={RIDER_AVATAR} style={styles.riderAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riderName, { color: C.text }]}>{RIDER_CONTACT.name}</Text>
                <Text style={[styles.riderMeta, { color: C.textMuted }]}>
                  ★ {RIDER_CONTACT.rating} · Motorcycle delivery
                </Text>
              </View>
            </View>
            <View style={styles.riderActions}>
              <Pressable
                onPress={openChat}
                style={[styles.actionBtn, styles.actionBtnPrimary, { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer }]}
              >
                <Ionicons name="chatbubble-ellipses" size={17} color={C.onPrimary} />
                <Text style={[styles.actionLabel, { color: C.onPrimary }]}>Message rider</Text>
              </Pressable>
              <Pressable
                onPress={() => void callRider()}
                style={[styles.actionBtn, { backgroundColor: C.surfaceLowest, borderColor: C.primaryContainer }]}
              >
                <Ionicons name="call" size={17} color={C.primaryContainer} />
                <Text style={[styles.actionLabel, { color: C.primaryContainer }]}>Call</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.waitCard, { backgroundColor: C.secondaryContainer, borderColor: C.glassBorder }]}>
            <View style={[styles.waitIconWrap, { backgroundColor: C.surfaceLowest }]}>
              <Ionicons name="bicycle-outline" size={22} color={C.primaryContainer} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.waitTitle, { color: C.text }]}>
                {trackingStep < 2 ? 'Rider not assigned yet' : 'Delivery complete'}
              </Text>
              <Text style={[styles.waitText, { color: C.textMuted }]}>
                {trackingStep < 2
                  ? 'We’ll notify you when your rider picks up the order. You can message them once they’re on the way.'
                  : 'Your order has been delivered.'}
              </Text>
            </View>
          </View>
        )}

        {order.orderNote ? (
          <View style={[styles.orderNoteCard, { backgroundColor: C.secondaryContainer, borderColor: C.glassBorder }]}>
            <Ionicons name="document-text-outline" size={16} color={C.primaryContainer} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.orderNoteLabel, { color: C.textFaint }]}>Order note</Text>
              <Text style={[styles.orderNoteText, { color: C.text }]} numberOfLines={3}>
                {order.orderNote}
              </Text>
            </View>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
          {order.items.map((line) => (
            <View key={`${line.item.id}-${line.sugar}`} style={[styles.itemChip, { borderColor: C.outlineVariant }]}>
              <AppImage uri={line.item.image} style={styles.itemThumb} />
              <Text style={[styles.itemChipText, { color: C.text }]} numberOfLines={1}>
                {line.item.name} ×{line.qty}
              </Text>
            </View>
          ))}
        </ScrollView>

        {isActive && trackingStep >= ORDER_STEPS.length - 1 && (
          <StitchPillButton label="Done" onPress={onDone} C={C} />
        )}
        {canCancel && onCancel && (
          <Pressable onPress={onCancel} style={styles.cancelLink}>
            <Text style={[styles.cancelText, { color: C.error }]}>Cancel order</Text>
          </Pressable>
        )}
      </GlassSurface>

      <RiderChatSheet C={C} visible={chatOpen} onClose={() => setChatOpen(false)} onCall={() => void callRider()} />
    </View>
  );
}

/** @deprecated Use DeliveryTrackingScreen */
export const OrderTrackingScreen = DeliveryTrackingScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 5,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LOGO_GREEN },
  liveBadgeText: { fontFamily: FONTS.semiBold, fontSize: 12, color: LOGO_GREEN },
  mapEtaCard: {
    position: 'absolute',
    right: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mapEtaValue: { fontFamily: FONTS.display, fontSize: 22 },
  mapEtaLabel: { fontFamily: FONTS.regular, fontSize: 10, marginTop: 2 },
  mapEtaLive: { fontFamily: FONTS.medium, fontSize: 9, marginTop: 4 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '48%',
    zIndex: 6,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  etaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  eta: { fontFamily: FONTS.display, fontSize: 32 },
  etaSub: { fontFamily: FONTS.regular, fontSize: 14, marginTop: 4, lineHeight: 20 },
  orderPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  orderPillText: { fontFamily: FONTS.bold, fontSize: 14 },
  stepperWrap: { marginBottom: 16, paddingHorizontal: 2, position: 'relative' },
  stepperRail: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: 13,
    height: 4,
    zIndex: 0,
  },
  stepperTrack: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    height: 4,
  },
  stepperTrackFill: { height: 4, borderRadius: 2 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 },
  stepItem: { alignItems: 'center', flex: 1, gap: 8, paddingHorizontal: 2 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    shadowColor: LOGO_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  stepDotInner: { width: 10, height: 10, borderRadius: 5 },
  stepLabel: { fontFamily: FONTS.semiBold, fontSize: 10, textAlign: 'center', lineHeight: 13 },
  riderCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  riderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  riderAvatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#fff' },
  riderName: { fontFamily: FONTS.semiBold, fontSize: 15 },
  riderMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  riderActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  actionBtnPrimary: {},
  actionLabel: { fontFamily: FONTS.semiBold, fontSize: 13 },
  waitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  waitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitTitle: { fontFamily: FONTS.semiBold, fontSize: 14, marginBottom: 4 },
  waitText: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  orderNoteCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  orderNoteLabel: { fontFamily: FONTS.semiBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  orderNoteText: { fontFamily: FONTS.regular, fontSize: 13, marginTop: 4, lineHeight: 18 },
  itemsScroll: { marginBottom: 8 },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  itemThumb: { width: 36, height: 36, borderRadius: 10 },
  itemChipText: { fontFamily: FONTS.semiBold, fontSize: 12, maxWidth: 120 },
  cancelLink: { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  cancelText: { fontFamily: FONTS.semiBold, fontSize: 13 },
});
