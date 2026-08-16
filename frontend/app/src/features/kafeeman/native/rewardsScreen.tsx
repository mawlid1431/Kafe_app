import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { LOGO_GREEN, LOGO_GREEN_DARK } from '../brand';
import { REWARD_CATALOG, REWARD_TIERS } from '../data';
import { RewardGiftIcon } from './onboardingIcons';
import { GlassCard, GlassSurface } from './stitchUi';
import { ScreenHeader } from './screenChrome';
import { FONTS } from './fonts';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW_FLOAT } from '../theme';
import type { PointsActivity } from '../types';

type Props = {
  C: ThemeColors;
  points: number;
  history: PointsActivity[];
  onBack: () => void;
  onRedeem: (rewardId: string, cost: number, title: string) => boolean;
};

function currentTier(points: number) {
  return REWARD_TIERS.find((t) => points >= t.min && points <= t.max) ?? REWARD_TIERS[0];
}

function nextTierProgress(points: number) {
  const tier = currentTier(points);
  if (tier.name === 'Gold') return { label: 'Gold member', pct: 100, remaining: 0, nextName: null as string | null };
  const next = REWARD_TIERS[REWARD_TIERS.indexOf(tier) + 1];
  const span = next.min - tier.min;
  const progress = points - tier.min;
  return {
    label: `${pointsToNext(points)} pts to ${next.name}`,
    pct: Math.min(100, Math.round((progress / span) * 100)),
    remaining: pointsToNext(points),
    nextName: next.name,
  };
}

function pointsToNext(points: number) {
  const tier = currentTier(points);
  if (tier.name === 'Gold') return 0;
  const next = REWARD_TIERS[REWARD_TIERS.indexOf(tier) + 1];
  return Math.max(0, next.min - points);
}

const REWARD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cafe: 'cafe-outline',
  pricetag: 'pricetag-outline',
  restaurant: 'restaurant-outline',
  gift: 'gift-outline',
};

export function RewardsScreen({ C, points, history, onBack, onRedeem }: Props) {
  const tier = currentTier(points);
  const progress = nextTierProgress(points);

  return (
    <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={styles.scroll}>
      <ScreenHeader C={C} title="My Rewards" onBack={onBack} />

      <View style={[styles.heroOuter, STITCH_SHADOW_FLOAT]}>
        <GlassSurface level="float" strong style={styles.hero}>
          <LinearGradient
            colors={[LOGO_GREEN, LOGO_GREEN_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.heroLabel}>Total Points</Text>
          <Text style={styles.heroPoints}>{points.toLocaleString()}</Text>
          <View style={styles.heroTierRow}>
            <Ionicons name={tier.icon} size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroSub}>
              ≈ RM {(points / 100).toFixed(2)} value · {tier.name}
            </Text>
          </View>
        </GlassSurface>
      </View>

      <GlassCard level="sheet" style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressLabelRow}>
            {progress.nextName ? (
              <Ionicons name="medal-outline" size={14} color={C.primaryContainer} />
            ) : (
              <Ionicons name="trophy-outline" size={14} color={C.primaryContainer} />
            )}
            <Text style={[styles.progressTitle, { color: C.text }]}>{progress.label}</Text>
          </View>
          <Text style={{ color: C.textMuted, fontFamily: FONTS.regular, fontSize: 12 }}>{progress.pct}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: C.glassInset }]}>
          <View style={[styles.progressFill, { width: `${progress.pct}%`, backgroundColor: C.primaryContainer }]} />
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: C.primary }]}>Redeem rewards</Text>
      {REWARD_CATALOG.map((reward) => {
        const canRedeem = reward.pointsCost === 0 || points >= reward.pointsCost;
        const icon = REWARD_ICONS[reward.icon] ?? 'gift-outline';
        return (
          <GlassCard key={reward.id} level="sheet" style={styles.rewardCard}>
            <View style={[styles.rewardIcon, { backgroundColor: C.secondaryContainer }]}>
              {reward.icon === 'gift' ? (
                <RewardGiftIcon size={22} color={C.primaryContainer} />
              ) : (
                <Ionicons name={icon} size={22} color={C.primaryContainer} />
              )}
            </View>
            <View style={styles.rewardCopy}>
              <Text style={[styles.rewardTitle, { color: C.text }]}>{reward.title}</Text>
              <Text style={[styles.rewardDesc, { color: C.textMuted }]}>{reward.description}</Text>
              <Text style={[styles.rewardCost, { color: C.primaryContainer }]}>
                {reward.pointsCost === 0 ? 'Birthday perk' : `${reward.pointsCost} pts`}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (!canRedeem) return;
                onRedeem(reward.id, reward.pointsCost, reward.title);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <View
                style={[
                  styles.redeemBtn,
                  canRedeem
                    ? { backgroundColor: C.primaryContainer }
                    : { backgroundColor: C.glassInset, borderWidth: 1, borderColor: C.outlineVariant },
                ]}
              >
                <Text
                  style={[
                    styles.redeemBtnText,
                    { color: canRedeem ? C.onPrimary : C.textMuted },
                  ]}
                >
                  {canRedeem ? 'Redeem' : 'Locked'}
                </Text>
              </View>
            </Pressable>
          </GlassCard>
        );
      })}

      <Text style={[styles.sectionTitle, { color: C.primary, marginTop: 8 }]}>Points history</Text>
      <GlassCard level="sheet" noPadding style={styles.historyCard}>
        {history.map((entry, index) => (
          <View
            key={entry.id}
            style={[
              styles.historyRow,
              index < history.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.outlineVariant },
            ]}
          >
            <View>
              <Text style={[styles.historyLabel, { color: C.text }]}>{entry.label}</Text>
              <Text style={[styles.historyDate, { color: C.textFaint }]}>{entry.date}</Text>
            </View>
            <Text style={[styles.historyDelta, { color: entry.delta >= 0 ? C.success : C.error }]}>
              {entry.delta >= 0 ? '+' : ''}
              {entry.delta}
            </Text>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  heroOuter: { marginHorizontal: 20, marginBottom: 4 },
  hero: { borderRadius: 20, padding: 24, overflow: 'hidden', minHeight: 120 },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontFamily: FONTS.semiBold, fontSize: 12 },
  heroPoints: { color: '#fff', fontFamily: FONTS.bold, fontSize: 40, marginTop: 4 },
  heroTierRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  heroSub: { color: 'rgba(255,255,255,0.82)', fontFamily: FONTS.regular, fontSize: 12 },
  progressCard: { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  progressTitle: { fontFamily: FONTS.semiBold, fontSize: 14 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 17, marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  rewardCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rewardCopy: { flex: 1 },
  rewardTitle: { fontFamily: FONTS.bold, fontSize: 15 },
  rewardDesc: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  rewardCost: { fontFamily: FONTS.semiBold, fontSize: 12, marginTop: 6 },
  redeemBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  redeemBtnText: { fontFamily: FONTS.semiBold, fontSize: 12 },
  historyCard: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  historyLabel: { fontFamily: FONTS.semiBold, fontSize: 14 },
  historyDate: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  historyDelta: { fontFamily: FONTS.bold, fontSize: 16 },
});
