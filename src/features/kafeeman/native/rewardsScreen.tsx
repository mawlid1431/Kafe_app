import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { REWARD_CATALOG, REWARD_TIERS } from '../data';
import { RewardGiftIcon } from './onboardingIcons';
import { GlassCard, StitchPillButton } from './stitchUi';
import { FONTS } from './fonts';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW } from '../theme';
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
  if (tier.name === 'Gold') return { label: 'Gold member', pct: 100, remaining: 0 };
  const next = REWARD_TIERS[REWARD_TIERS.indexOf(tier) + 1];
  const span = next.min - tier.min;
  const progress = points - tier.min;
  return {
    label: `${next.emoji} ${pointsToNext(points)} pts to ${next.name}`,
    pct: Math.min(100, Math.round((progress / span) * 100)),
    remaining: pointsToNext(points),
  };
}

function pointsToNext(points: number) {
  const tier = currentTier(points);
  if (tier.name === 'Gold') return 0;
  const next = REWARD_TIERS[REWARD_TIERS.indexOf(tier) + 1];
  return Math.max(0, next.min - points);
}

const REWARD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cafe: 'cafe',
  pricetag: 'pricetag',
  restaurant: 'restaurant',
  gift: 'gift',
};

export function RewardsScreen({ C, points, history, onBack, onRedeem }: Props) {
  const tier = currentTier(points);
  const progress = nextTierProgress(points);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={[styles.backBtn, { backgroundColor: C.inputBg }]}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.primary }]}>My Rewards</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.hero, STITCH_SHADOW]}>
        <LinearGradient
          colors={[C.primaryContainer, '#5b403c', C.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.heroLabel}>Total Points</Text>
        <Text style={styles.heroPoints}>{points.toLocaleString()}</Text>
        <Text style={styles.heroSub}>≈ RM {(points / 100).toFixed(2)} value · {tier.emoji} {tier.name}</Text>
      </View>

      <GlassCard style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: C.text }]}>{progress.label}</Text>
          <Text style={{ color: C.textMuted, fontFamily: FONTS.regular, fontSize: 12 }}>{progress.pct}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: C.inputBg }]}>
          <View style={[styles.progressFill, { width: `${progress.pct}%`, backgroundColor: C.accent }]} />
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: C.primary }]}>Redeem rewards</Text>
      {REWARD_CATALOG.map((reward) => {
        const canRedeem = reward.pointsCost === 0 || points >= reward.pointsCost;
        const icon = REWARD_ICONS[reward.icon] ?? 'gift';
        return (
          <GlassCard key={reward.id} style={styles.rewardCard}>
            <View style={[styles.rewardIcon, { backgroundColor: C.tertiaryFixed }]}>
              {reward.icon === 'gift' ? (
                <RewardGiftIcon size={22} color={C.primaryContainer} />
              ) : (
                <Ionicons name={icon} size={22} color={C.primaryContainer} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rewardTitle, { color: C.text }]}>{reward.title}</Text>
              <Text style={[styles.rewardDesc, { color: C.textMuted }]}>{reward.description}</Text>
              <Text style={[styles.rewardCost, { color: C.accent }]}>
                {reward.pointsCost === 0 ? 'Birthday perk' : `${reward.pointsCost} pts`}
              </Text>
            </View>
            <StitchPillButton
              label={canRedeem ? 'Redeem' : 'Locked'}
              onPress={() => {
                if (!canRedeem) return;
                onRedeem(reward.id, reward.pointsCost, reward.title);
              }}
              C={C}
              variant={canRedeem ? 'primary' : 'outline'}
            />
          </GlassCard>
        );
      })}

      <Text style={[styles.sectionTitle, { color: C.primary, marginTop: 8 }]}>Points history</Text>
      {history.map((entry) => (
        <View key={entry.id} style={[styles.historyRow, { borderBottomColor: C.glassBorder }]}>
          <View>
            <Text style={[styles.historyLabel, { color: C.text }]}>{entry.label}</Text>
            <Text style={[styles.historyDate, { color: C.textFaint }]}>{entry.date}</Text>
          </View>
          <Text
            style={[
              styles.historyDelta,
              { color: entry.delta >= 0 ? C.success : C.error },
            ]}
          >
            {entry.delta >= 0 ? '+' : ''}
            {entry.delta}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18 },
  hero: { marginHorizontal: 20, borderRadius: 24, padding: 24, overflow: 'hidden', minHeight: 140 },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontFamily: FONTS.semiBold, fontSize: 12 },
  heroPoints: { color: '#fff', fontFamily: FONTS.bold, fontSize: 44, marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.regular, fontSize: 12, marginTop: 6 },
  progressCard: { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontFamily: FONTS.semiBold, fontSize: 14 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  rewardCard: { marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rewardTitle: { fontFamily: FONTS.bold, fontSize: 15 },
  rewardDesc: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  rewardCost: { fontFamily: FONTS.semiBold, fontSize: 12, marginTop: 6 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  historyLabel: { fontFamily: FONTS.semiBold, fontSize: 14 },
  historyDate: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
  historyDelta: { fontFamily: FONTS.bold, fontSize: 16 },
});
