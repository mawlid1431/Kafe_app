import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HELP_FAQ } from '../data';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { ScreenHeader } from './screenChrome';
import { GlassCard, StitchPillButton } from './stitchUi';

const SUPPORT_EMAIL = 'help@kafeeman.my';
const SUPPORT_PHONE = '+60312345678';

type Props = {
  C: ThemeColors;
  onBack: () => void;
};

export function HelpScreen({ C, onBack }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader C={C} title="Help & support" subtitle="We're here 9am – 9pm daily" onBack={onBack} />

      <GlassCard level="sheet" style={styles.contactCard}>
        <Text style={[styles.contactTitle, { color: C.text }]}>Contact us</Text>
        <Pressable
          onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={styles.contactRow}
        >
          <Ionicons name="mail-outline" size={20} color={C.primaryContainer} />
          <Text style={[styles.contactText, { color: C.text }]}>{SUPPORT_EMAIL}</Text>
        </Pressable>
        <Pressable
          onPress={() => void Linking.openURL(`tel:${SUPPORT_PHONE}`)}
          style={styles.contactRow}
        >
          <Ionicons name="call-outline" size={20} color={C.primaryContainer} />
          <Text style={[styles.contactText, { color: C.text }]}>{SUPPORT_PHONE}</Text>
        </Pressable>
        <StitchPillButton
          label="Chat on WhatsApp"
          C={C}
          variant="outline"
          icon="logo-whatsapp"
          onPress={() => void Linking.openURL('https://wa.me/60123456789')}
        />
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: C.primary }]}>FAQ</Text>
      {HELP_FAQ.map((item, i) => {
        const open = openIdx === i;
        return (
          <Pressable key={item.q} onPress={() => setOpenIdx(open ? null : i)}>
            <GlassCard level="sheet" style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: C.text }]}>{item.q}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.textFaint} />
              </View>
              {open && (
                <Text style={[styles.faqA, { color: C.textMuted }]}>{item.a}</Text>
              )}
            </GlassCard>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 24 },
  contactCard: { padding: 16, marginBottom: 20, gap: 12 },
  contactTitle: { fontFamily: FONTS.bold, fontSize: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontFamily: FONTS.regular, fontSize: 14 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, marginBottom: 10 },
  faqCard: { padding: 14, marginBottom: 10 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQ: { fontFamily: FONTS.semiBold, fontSize: 14, flex: 1 },
  faqA: { fontFamily: FONTS.regular, fontSize: 13, marginTop: 10, lineHeight: 20 },
});
