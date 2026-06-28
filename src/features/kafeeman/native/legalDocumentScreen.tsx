import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getLegalDocument, type LegalDocumentId } from '../lib/legalDocuments';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { ScreenHeader } from './screenChrome';
import { GlassCard } from './stitchUi';

type Props = {
  C: ThemeColors;
  documentId: LegalDocumentId;
  onBack: () => void;
};

export function LegalDocumentScreen({ C, documentId, onBack }: Props) {
  const doc = getLegalDocument(documentId);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ScreenHeader C={C} title={doc.title} subtitle={doc.subtitle} onBack={onBack} />

      <GlassCard level="sheet" style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Ionicons name="document-text-outline" size={18} color={C.primaryContainer} />
          <Text style={[styles.metaText, { color: C.textMuted }]}>
            Last updated: {doc.lastUpdated}
          </Text>
        </View>
        <Text style={[styles.metaHint, { color: C.textFaint }]}>
          Operated by Kafe Eman Sdn. Bhd. · Malaysia
        </Text>
      </GlassCard>

      {doc.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.primary }]}>{section.title}</Text>
          {section.paragraphs.map((p) => (
            <Text key={p.slice(0, 48)} style={[styles.paragraph, { color: C.textMuted }]}>
              {p}
            </Text>
          ))}
          {section.bullets?.map((b) => (
            <View key={b.slice(0, 48)} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: C.primaryContainer }]} />
              <Text style={[styles.bulletText, { color: C.textMuted }]}>{b}</Text>
            </View>
          ))}
        </View>
      ))}

      <GlassCard level="sheet" style={styles.footerCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color={C.primaryContainer} />
        <Text style={[styles.footerText, { color: C.textMuted }]}>
          If you have questions about this document, contact{' '}
          <Text style={{ color: C.primaryContainer, fontFamily: FONTS.semiBold }}>
            {documentId === 'privacy-policy' ? 'privacy@kafeeman.my' : 'legal@kafeeman.my'}
          </Text>
        </Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 24 },
  metaCard: { padding: 16, marginBottom: 20, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontFamily: FONTS.semiBold, fontSize: 13 },
  metaHint: { fontFamily: FONTS.regular, fontSize: 12, marginLeft: 26 },
  section: { marginBottom: 22 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, marginBottom: 10, lineHeight: 22 },
  paragraph: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22, marginBottom: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8, paddingLeft: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 21 },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    marginTop: 8,
  },
  footerText: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20 },
});
