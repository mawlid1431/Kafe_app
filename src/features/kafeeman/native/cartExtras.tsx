import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { maxRedeemablePoints, POINTS_PER_RM, pointsForSpend, pointsToRmDiscount } from '../lib/promos';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { formatRM } from './payments';
import { GlassInputField, GlassSurface } from './stitchUi';

type OrderNoteFieldProps = {
  C: ThemeColors;
  value: string;
  onChangeText: (text: string) => void;
};

export function OrderNoteField({ C, value, onChangeText }: OrderNoteFieldProps) {
  return (
    <GlassSurface level="sheet" style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Ionicons name="create-outline" size={18} color={C.primaryContainer} />
        <Text style={[styles.noteTitle, { color: C.text }]}>Special instructions</Text>
      </View>
      <Text style={[styles.noteHint, { color: C.textMuted }]}>
        Tell us how you want your order — extra hot, less sweet, allergies, etc.
      </Text>
      <GlassInputField
        C={C}
        value={value}
        onChangeText={onChangeText}
        placeholder="e.g. Less ice on latte, no straw please…"
        multiline
        numberOfLines={3}
        noMargin
      />
    </GlassSurface>
  );
}

type PointsRedeemSectionProps = {
  C: ThemeColors;
  balance: number;
  enabled: boolean;
  pointsToRedeem: number;
  orderTotalBeforePoints: number;
  onToggle: (on: boolean) => void;
  onSelectPoints: (pts: number) => void;
};

const PRESETS = [100, 500, 1000] as const;

export function PointsRedeemSection({
  C,
  balance,
  enabled,
  pointsToRedeem,
  orderTotalBeforePoints,
  onToggle,
  onSelectPoints,
}: PointsRedeemSectionProps) {
  const maxPts = maxRedeemablePoints(balance, orderTotalBeforePoints);
  const discount = pointsToRmDiscount(pointsToRedeem);
  const earnPreview = pointsForSpend(Math.max(0, orderTotalBeforePoints - discount));

  return (
    <GlassSurface level="sheet" style={styles.pointsCard}>
      <View style={styles.pointsHeader}>
        <View style={styles.pointsHeaderLeft}>
          <View style={[styles.pointsIcon, { backgroundColor: C.tertiaryFixed }]}>
            <Ionicons name="gift" size={18} color={C.primaryContainer} />
          </View>
          <View>
            <Text style={[styles.pointsTitle, { color: C.text }]}>Use points</Text>
            <Text style={[styles.pointsBalance, { color: C.textMuted }]}>
              {balance.toLocaleString()} pts available · 100 pts = RM 1
            </Text>
          </View>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: C.outlineVariant, true: C.primaryContainer }}
          thumbColor="#fff"
        />
      </View>

      {enabled && maxPts >= POINTS_PER_RM && (
        <View style={styles.presetRow}>
          {PRESETS.filter((p) => p <= maxPts).map((preset) => {
            const active = pointsToRedeem === preset;
            return (
              <Pressable
                key={preset}
                onPress={() => onSelectPoints(preset)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: active ? C.primaryContainer : C.surfaceLowest,
                    borderColor: active ? C.primaryContainer : C.outlineVariant,
                  },
                ]}
              >
                <Text style={[styles.presetText, { color: active ? C.onPrimary : C.text }]}>
                  {preset} pts
                </Text>
                <Text style={[styles.presetSub, { color: active ? 'rgba(255,255,255,0.85)' : C.textFaint }]}>
                  -{formatRM(pointsToRmDiscount(preset))}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => onSelectPoints(maxPts)}
            style={[
              styles.presetChip,
              {
                backgroundColor: pointsToRedeem === maxPts ? C.primaryContainer : C.surfaceLowest,
                borderColor: pointsToRedeem === maxPts ? C.primaryContainer : C.outlineVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.presetText,
                { color: pointsToRedeem === maxPts ? C.onPrimary : C.text },
              ]}
            >
              Max
            </Text>
            <Text
              style={[
                styles.presetSub,
                { color: pointsToRedeem === maxPts ? 'rgba(255,255,255,0.85)' : C.textFaint },
              ]}
            >
              -{formatRM(pointsToRmDiscount(maxPts))}
            </Text>
          </Pressable>
        </View>
      )}

      {enabled && maxPts < POINTS_PER_RM && (
        <Text style={[styles.pointsWarn, { color: C.textMuted }]}>
          Need at least {POINTS_PER_RM} points and RM 1 order value to redeem.
        </Text>
      )}

      {enabled && discount > 0 && (
        <Text style={[styles.pointsApplied, { color: '#22c55e' }]}>
          {pointsToRedeem.toLocaleString()} pts applied · save {formatRM(discount)}
        </Text>
      )}

      <Text style={[styles.earnPreview, { color: C.accent }]}>
        +{earnPreview} pts you'll earn on this order
      </Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  noteCard: { marginTop: 12, padding: 14, borderRadius: 18 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  noteTitle: { fontFamily: FONTS.semiBold, fontSize: 15 },
  noteHint: { fontFamily: FONTS.regular, fontSize: 12, marginBottom: 8, lineHeight: 17 },
  pointsCard: { marginTop: 12, padding: 14, borderRadius: 18 },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pointsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pointsIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pointsTitle: { fontFamily: FONTS.semiBold, fontSize: 15 },
  pointsBalance: { fontFamily: FONTS.regular, fontSize: 11, marginTop: 2 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 72,
    alignItems: 'center',
  },
  presetText: { fontFamily: FONTS.semiBold, fontSize: 12 },
  presetSub: { fontFamily: FONTS.regular, fontSize: 10, marginTop: 2 },
  pointsWarn: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 10 },
  pointsApplied: { fontFamily: FONTS.semiBold, fontSize: 12, marginTop: 10 },
  earnPreview: { fontFamily: FONTS.semiBold, fontSize: 12, marginTop: 10 },
});
