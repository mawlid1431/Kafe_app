import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { SavedAddress } from '../types';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { ScreenHeader } from './screenChrome';
import { GlassCard, StitchPillButton } from './stitchUi';

type Props = {
  C: ThemeColors;
  addresses: SavedAddress[];
  selectedId: string;
  onBack: () => void;
  onSelect: (id: string) => void;
};

export function AddressesScreen({ C, addresses, selectedId, onBack, onSelect }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader C={C} title="Delivery addresses" subtitle="Choose where we deliver" onBack={onBack} />

      {addresses.map((addr) => {
        const selected = addr.id === selectedId;
        return (
          <Pressable key={addr.id} onPress={() => onSelect(addr.id)}>
            <GlassCard
              level="sheet"
              style={[
                styles.card,
                selected && { borderColor: C.primaryContainer, borderWidth: 2 },
              ]}
            >
              <View style={[styles.icon, { backgroundColor: C.secondaryContainer }]}>
                <Ionicons
                  name={addr.label === 'Office' ? 'business' : 'home'}
                  size={20}
                  color={C.primaryContainer}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: C.text }]}>{addr.label}</Text>
                <Text style={[styles.line, { color: C.textMuted }]}>{addr.line1}</Text>
                {addr.line2 ? (
                  <Text style={[styles.line, { color: C.textMuted }]}>{addr.line2}</Text>
                ) : null}
              </View>
              {selected && <Ionicons name="checkmark-circle" size={22} color={C.primaryContainer} />}
            </GlassCard>
          </Pressable>
        );
      })}

      <StitchPillButton
        label="Add new address"
        C={C}
        variant="outline"
        icon="add"
        onPress={onBack}
      />
      <Text style={[styles.hint, { color: C.textFaint }]}>
        Adding addresses will be available in a future update.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 24 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FONTS.semiBold, fontSize: 15 },
  line: { fontFamily: FONTS.regular, fontSize: 13, marginTop: 2, lineHeight: 18 },
  hint: { fontFamily: FONTS.regular, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
