import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LEGAL_LINKS, type LegalDocumentId } from '../lib/legalDocuments';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';

type Props = {
  C: ThemeColors;
  /** Compact single-line footer for auth screens */
  variant?: 'footer' | 'signup';
  accepted?: boolean;
  onToggleAccept?: () => void;
  onOpenDocument: (id: LegalDocumentId) => void;
};

export function LegalLinksFooter({ C, variant = 'footer', accepted, onToggleAccept, onOpenDocument }: Props) {
  if (variant === 'signup') {
    return (
      <View style={styles.signupWrap}>
        <Pressable
          onPress={onToggleAccept}
          style={styles.checkboxRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: accepted ? C.primaryContainer : C.outlineVariant,
                backgroundColor: accepted ? C.primaryContainer : 'transparent',
              },
            ]}
          >
            {accepted ? <Ionicons name="checkmark" size={14} color={C.onPrimary} /> : null}
          </View>
          <Text style={[styles.signupText, { color: C.textMuted }]}>
            I agree to the{' '}
            <LegalInlineLink C={C} label="Terms of Use" onPress={() => onOpenDocument('terms-of-use')} />
            {', '}
            <LegalInlineLink C={C} label="Terms & Conditions" onPress={() => onOpenDocument('terms-and-conditions')} />
            {' and '}
            <LegalInlineLink C={C} label="Privacy Policy" onPress={() => onOpenDocument('privacy-policy')} />
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.footerWrap}>
      <Text style={[styles.footerLead, { color: C.textFaint }]}>By continuing, you agree to our</Text>
      <View style={styles.footerLinks}>
        {LEGAL_LINKS.map((link, i) => (
          <View key={link.id} style={styles.footerLinkRow}>
            {i > 0 ? <Text style={[styles.footerSep, { color: C.textFaint }]}> · </Text> : null}
            <Pressable onPress={() => onOpenDocument(link.id)} hitSlop={6}>
              <Text style={[styles.footerLink, { color: C.primaryContainer }]}>{link.label}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function LegalInlineLink({
  C,
  label,
  onPress,
}: {
  C: ThemeColors;
  label: string;
  onPress: () => void;
}) {
  return (
    <Text onPress={onPress} style={[styles.inlineLink, { color: C.primaryContainer }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  footerWrap: { marginTop: 20, alignItems: 'center', paddingHorizontal: 8 },
  footerLead: { fontFamily: FONTS.regular, fontSize: 12, textAlign: 'center', marginBottom: 6 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  footerLinkRow: { flexDirection: 'row', alignItems: 'center' },
  footerLink: { fontFamily: FONTS.semiBold, fontSize: 12, textDecorationLine: 'underline' },
  footerSep: { fontFamily: FONTS.regular, fontSize: 12 },
  signupWrap: { marginTop: 8, marginBottom: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  signupText: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20 },
  inlineLink: { fontFamily: FONTS.semiBold, textDecorationLine: 'underline' },
});
