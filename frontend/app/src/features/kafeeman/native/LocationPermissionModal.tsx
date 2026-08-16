import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { StitchPillButton } from './stitchUi';

type Props = {
  visible: boolean;
  C: ThemeColors;
  loading?: boolean;
  onAllow: () => void;
  onDecline: () => void;
};

/**
 * In-app explainer before the iOS/Android system location sheet
 * (Allow Once · While Using · Don't Allow).
 */
export function LocationPermissionModal({ visible, C, loading, onAllow, onDecline }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }]}>
        <View style={[styles.card, { backgroundColor: C.surfaceLowest }]}>
          <View style={[styles.iconWrap, { backgroundColor: C.secondaryContainer }]}>
            <Ionicons name="navigate" size={28} color={C.primaryContainer} />
          </View>

          <Text style={[styles.title, { color: C.text }]}>Allow location for live delivery?</Text>
          <Text style={[styles.body, { color: C.textMuted }]}>
            Kafe Eman uses your GPS to show your real position on the map, draw the rider route on actual
            roads, and follow your order. You can choose Allow Once or Don&apos;t Allow on the next screen.
          </Text>

          <View style={styles.bullets}>
            {[
              'See your live GPS pin on the tracking map',
              'Rider path follows real roads (car / motor)',
              'Tap the GPS button anytime to center on you',
            ].map((line) => (
              <View key={line} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color={C.primaryContainer} />
                <Text style={[styles.bulletText, { color: C.text }]}>{line}</Text>
              </View>
            ))}
          </View>

          <StitchPillButton
            label={loading ? 'Opening…' : 'Continue'}
            onPress={onAllow}
            C={C}
          />
          <Pressable onPress={onDecline} style={styles.declineBtn} disabled={loading}>
            <Text style={[styles.declineText, { color: C.textMuted }]}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 22,
    marginBottom: 10,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  bullets: { gap: 10, marginBottom: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletText: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  declineBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  declineText: { fontFamily: FONTS.semiBold, fontSize: 14 },
});
