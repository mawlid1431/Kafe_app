import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard, StitchMenuCard } from './stitchUi';
import { ScreenHeader } from './screenChrome';
import { FONTS } from './fonts';
import type { ThemeColors } from '../theme';
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
    <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={styles.scroll}>
      <ScreenHeader C={C} title="My Favourites" onBack={onBack} />

      {favoriteItems.length === 0 ? (
        <GlassCard level="sheet" style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: C.secondaryContainer }]}>
            <Ionicons name="heart-outline" size={28} color={C.primaryContainer} />
          </View>
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
  empty: { marginHorizontal: 24, padding: 28, borderRadius: 20, alignItems: 'center' },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 16, marginTop: 12 },
  emptySub: { fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 24 },
});
