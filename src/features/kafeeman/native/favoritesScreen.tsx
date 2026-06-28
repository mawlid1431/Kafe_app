import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard, StitchMenuCard } from './stitchUi';
import { FONTS } from './fonts';
import type { ThemeColors } from '../theme';
import { STITCH_SHADOW } from '../theme';
import type { MenuItem } from '../types';

type Props = {
  C: ThemeColors;
  items: MenuItem[];
  favorites: number[];
  cardWidth: number;
  onBack: () => void;
  onItemPress: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
  onToggleFavorite: (id: number) => void;
};

export function FavoritesScreen({
  C,
  items,
  favorites,
  cardWidth,
  onBack,
  onItemPress,
  onAdd,
  onToggleFavorite,
}: Props) {
  const favoriteItems = items.filter((m) => favorites.includes(m.id));

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={[styles.backBtn, { backgroundColor: C.inputBg }]}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
        </Pressable>
        <Text style={[styles.title, { color: C.primary }]}>My Favourites</Text>
        <View style={{ width: 40 }} />
      </View>

      {favoriteItems.length === 0 ? (
        <GlassCard style={styles.empty}>
          <Ionicons name="heart-outline" size={44} color={C.textFaint} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>No favourites yet</Text>
          <Text style={[styles.emptySub, { color: C.textMuted }]}>
            Tap the heart on any drink to save it here for quick reordering.
          </Text>
        </GlassCard>
      ) : (
        <View style={styles.grid}>
          {favoriteItems.map((item) => (
            <StitchMenuCard
              key={item.id}
              C={C}
              width={cardWidth}
              name={item.name}
              price={item.price}
              image={item.image}
              isFavorite
              onToggleFavorite={() => onToggleFavorite(item.id)}
              onPress={() => onItemPress(item)}
              onAdd={() => onAdd(item)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONTS.bold, fontSize: 18 },
  empty: { marginHorizontal: 24, padding: 32, borderRadius: 24, alignItems: 'center' },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 16, marginTop: 12 },
  emptySub: { fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 24 },
});
