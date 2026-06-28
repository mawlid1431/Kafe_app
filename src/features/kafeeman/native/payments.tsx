import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { pointsToRmDiscount } from '../lib/promos';
import { BRAND_ASSETS } from '../brand';
import type { CartLine } from '../types';
import type { ThemeColors } from '../theme';
import { BRAND, STITCH_SHADOW } from '../theme';
import { FONTS } from './fonts';
import { Image } from 'expo-image';
import { GradientButton } from './stitchUi';
import { AppImage } from './ui';
import { GlassCard, GlassInputField } from './stitchUi';

export const PAYMENT_TNG = "Touch 'n Go eWallet";
export const DELIVERY_FEE = 3;
export const MOCK_WALLET_BALANCE = 248.5;

export type PaymentMethodId = 'tng' | 'card' | 'banking';
export type TngPayPhase = 'pin' | 'processing' | 'approved';

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    id: 'tng',
    title: PAYMENT_TNG,
    subtitle: 'Instant — balance RM 248.50',
    icon: 'wallet',
    color: '#0057B8',
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, AMEX',
    icon: 'card',
    color: '#6366f1',
  },
  {
    id: 'banking',
    title: 'Online Banking (FPX)',
    subtitle: 'Maybank, CIMB, Public Bank…',
    icon: 'business',
    color: '#0284c7',
  },
];

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function generateOrderRef(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KE-${date}-${rand}`;
}

export function orderTotal(
  cartTotal: number,
  isDelivery: boolean,
  discount = 0,
  pointsRedeemed = 0,
): number {
  const fee = isDelivery ? DELIVERY_FEE : 0;
  const pointsOff = pointsToRmDiscount(pointsRedeemed);
  return Math.max(0, cartTotal - discount + fee - pointsOff);
}

type CheckoutSummaryProps = {
  C: ThemeColors;
  cart: CartLine[];
  cartTotal: number;
  discountAmount?: number;
  pointsRedeemed?: number;
  promoCode?: string | null;
  orderNote?: string;
  orderType: 'delivery' | 'pickup';
  orderRef: string;
  selectedBranch: string;
};

export function CheckoutSummary({
  C,
  cart,
  cartTotal,
  discountAmount = 0,
  pointsRedeemed = 0,
  promoCode,
  orderNote,
  orderType,
  orderRef,
  selectedBranch,
}: CheckoutSummaryProps) {
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const pointsOff = pointsToRmDiscount(pointsRedeemed);
  const total = Math.max(0, cartTotal - discountAmount + deliveryFee - pointsOff);

  return (
    <GlassCard level="sheet" style={{ marginBottom: 4 }}>
      <Text style={[checkoutStyles.sectionLabel, { color: C.textMuted }]}>Order summary</Text>
      <View style={checkoutStyles.refRow}>
        <Text style={{ color: C.textFaint, fontSize: 12, fontFamily: FONTS.regular }}>Order ID</Text>
        <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700', fontFamily: FONTS.semiBold }}>
          {orderRef}
        </Text>
      </View>
      <Text style={{ color: C.textFaint, fontSize: 12, marginBottom: 12, fontFamily: FONTS.regular }}>
        {selectedBranch} · {orderType === 'delivery' ? 'Delivery' : 'Pickup'}
      </Text>
      {cart.map((c) => (
        <View key={`${c.item.id}-${c.sugar}-${c.ice}`} style={checkoutStyles.lineRow}>
          <Text style={{ color: C.text, flex: 1, fontFamily: FONTS.regular }} numberOfLines={1}>
            <Text style={{ color: C.textFaint }}>×{c.qty} </Text>
            {c.item.name}
          </Text>
          <Text style={{ color: C.textMuted, fontFamily: FONTS.semiBold }}>{formatRM(c.item.price * c.qty)}</Text>
        </View>
      ))}
      <View style={[checkoutStyles.divider, { backgroundColor: C.glassBorder }]} />
      <View style={checkoutStyles.lineRow}>
        <Text style={{ color: C.textMuted, fontFamily: FONTS.regular }}>Subtotal</Text>
        <Text style={{ color: C.text, fontFamily: FONTS.semiBold }}>{formatRM(cartTotal)}</Text>
      </View>
      {discountAmount > 0 && (
        <View style={checkoutStyles.lineRow}>
          <Text style={{ color: C.textMuted, fontFamily: FONTS.regular }}>
            Discount{promoCode ? ` (${promoCode})` : ''}
          </Text>
          <Text style={{ color: C.success, fontFamily: FONTS.semiBold }}>- {formatRM(discountAmount)}</Text>
        </View>
      )}
      {pointsOff > 0 && (
        <View style={checkoutStyles.lineRow}>
          <Text style={{ color: C.textMuted, fontFamily: FONTS.regular }}>
            Points ({pointsRedeemed.toLocaleString()} pts)
          </Text>
          <Text style={{ color: C.success, fontFamily: FONTS.semiBold }}>- {formatRM(pointsOff)}</Text>
        </View>
      )}
      {orderNote?.trim() ? (
        <View style={[checkoutStyles.noteBox, { backgroundColor: C.secondaryContainer, borderColor: C.glassBorder }]}>
          <Text style={{ color: C.textFaint, fontSize: 11, fontFamily: FONTS.semiBold }}>ORDER NOTE</Text>
          <Text style={{ color: C.text, fontSize: 13, marginTop: 4, fontFamily: FONTS.regular }}>{orderNote.trim()}</Text>
        </View>
      ) : null}
      <View style={checkoutStyles.lineRow}>
        <Text style={{ color: C.textMuted, fontFamily: FONTS.regular }}>
          {orderType === 'delivery' ? 'Delivery fee' : 'Pickup'}
        </Text>
        <Text style={{ color: orderType === 'delivery' ? C.text : C.success, fontFamily: FONTS.semiBold }}>
          {orderType === 'delivery' ? formatRM(DELIVERY_FEE) : 'Free'}
        </Text>
      </View>
      <View style={[checkoutStyles.divider, { backgroundColor: C.glassBorder, marginTop: 8 }]} />
      <View style={[checkoutStyles.lineRow, { marginTop: 8 }]}>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 16, fontFamily: FONTS.bold }}>Total due</Text>
        <Text style={{ color: C.primary, fontWeight: '800', fontSize: 20, fontFamily: FONTS.extraBold }}>
          {formatRM(total)}
        </Text>
      </View>
    </GlassCard>
  );
}

type PaymentMethodPickerProps = {
  C: ThemeColors;
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
};

export function PaymentMethodPicker({ C, selected, onSelect }: PaymentMethodPickerProps) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={[checkoutStyles.sectionLabel, { color: C.textMuted, marginBottom: 12 }]}>
        Pay with
      </Text>
      {PAYMENT_METHODS.map((m) => {
        const active = selected === m.id;
        return (
          <Pressable key={m.id} onPress={() => onSelect(m.id)}>
            <GlassCard
              level="sheet"
              style={{
                marginBottom: 10,
                borderColor: active ? m.color : undefined,
                borderWidth: active ? 2 : 1,
              }}
            >
            <View style={checkoutStyles.methodRow}>
              <View style={[checkoutStyles.methodIcon, { backgroundColor: `${m.color}22` }]}>
                <Ionicons name={m.icon} size={22} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontFamily: FONTS.bold }}>{m.title}</Text>
                <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2, fontFamily: FONTS.regular }}>
                  {m.subtitle}
                </Text>
              </View>
              <View style={[checkoutStyles.radio, { borderColor: active ? m.color : C.glassBorder }]}>
                {active && <View style={[checkoutStyles.radioFill, { backgroundColor: m.color }]} />}
              </View>
            </View>
            </GlassCard>
          </Pressable>
        );
      })}
    </View>
  );
}

type TngPaymentScreenProps = {
  amount: number;
  orderRef: string;
  merchant: string;
  branch: string;
  pin: string[];
  phase: TngPayPhase;
  onPinKey: (key: number | 'del') => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function TngPaymentScreen({
  amount,
  orderRef,
  merchant,
  branch,
  pin,
  phase,
  onPinKey,
  onConfirm,
  onBack,
}: TngPaymentScreenProps) {
  const pinComplete = pin.length === 6;
  const insufficient = amount > MOCK_WALLET_BALANCE;
  const styles = useMemo(() => tngStyles, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0057B8', '#003D82']} style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.tngLogoRow}>
            <View style={styles.tngBadge}>
              <Text style={styles.tngBadgeText}>TnG</Text>
            </View>
            <Text style={styles.headerTitle}>{"Touch 'n Go eWallet"}</Text>
          </View>
          <Text style={styles.headerSub}>Secure payment</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.merchantCard}>
          <View style={styles.merchantIcon}>
            <Image source={BRAND_ASSETS.icon} style={{ width: 36, height: 36, borderRadius: 10 }} contentFit="cover" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.merchantName}>{merchant}</Text>
            <Text style={styles.merchantBranch}>{branch}</Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amountValue}>{formatRM(amount)}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Order ref</Text>
            <Text style={styles.metaValue}>{orderRef}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Wallet balance</Text>
            <Text style={[styles.metaValue, insufficient && { color: '#dc2626' }]}>
              {formatRM(MOCK_WALLET_BALANCE)}
            </Text>
          </View>
          {insufficient && (
            <Text style={styles.warnText}>Insufficient balance. Top up your eWallet to continue.</Text>
          )}
        </View>

        {phase === 'processing' ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color="#0057B8" />
            <Text style={styles.processingTitle}>Authorising payment…</Text>
            <Text style={styles.processingSub}>Please wait. Do not close this screen.</Text>
          </View>
        ) : phase === 'approved' ? (
          <View style={styles.processingBox}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.processingTitle}>Payment successful</Text>
            <Text style={styles.processingSub}>{formatRM(amount)} paid to {merchant}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.pinTitle}>Enter your 6-digit PIN</Text>
            <Text style={styles.pinSub}>This authorises the payment from your eWallet</Text>
            <View style={styles.pinRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    i < pin.length && styles.pinDotFilled,
                    i === pin.length && pin.length < 6 && styles.pinDotActive,
                  ]}
                >
                  {i < pin.length && <View style={styles.pinBullet} />}
                </View>
              ))}
            </View>
            <View style={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((k) => (
                <Pressable
                  key={String(k)}
                  disabled={k === null || (insufficient && k !== 'del')}
                  onPress={() => {
                    if (k === 'del') onPinKey('del');
                    else if (typeof k === 'number') onPinKey(k);
                  }}
                  style={[styles.key, k === null && styles.keyEmpty]}
                >
                  {k === 'del' ? (
                    <Ionicons name="backspace-outline" size={24} color="#1e293b" />
                  ) : k !== null ? (
                    <Text style={styles.keyText}>{k}</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
            {pinComplete && !insufficient && (
              <GradientButton
                label={`Pay ${formatRM(amount)}`}
                onPress={onConfirm}
                C={BRAND}
                variant="tng"
              />
            )}
          </>
        )}

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={14} color="#64748b" />
          <Text style={styles.footerText}>{"Secured by Touch 'n Go eWallet"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/** Stitch payment_settings — coffee crema card art */
export const CREDIT_CARD_ART =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBpMCsa6een1y0JHfYnrlLacwTzw1yv0pVMGRY7cMRKKMMTBLJHudEhrvQeTQJuuuIAlRYsk-J7SarrQGGhw-F6ZvBkgYnNt4KXXYU7MMimvoX1YiIO_JIrX9WmA4e5rEKxrR1qZhY0bu-ys4O4GMDAQWZ63sfgSU_2bMuQZdsE8UsLRcwqYmR5-vxyOTNqmkiGS2qve5XwLfPxpcEbGiWb-kI0wC--FlYgPpLi9eAPiPTGd0jJ92RUF5464rjMT5i4dGTfoWRd10J5';

function maskDots(groups = 3) {
  return Array.from({ length: groups }).map((_, gi) => (
    <View key={gi} style={cardPayStyles.dotGroup}>
      {Array.from({ length: 4 }).map((__, di) => (
        <View key={di} style={cardPayStyles.dot} />
      ))}
    </View>
  ));
}

type CardPaymentScreenProps = {
  C: ThemeColors;
  amount: number;
  onPay: () => void;
  onBack: () => void;
};

export function CardPaymentScreen({ C, amount, onPay, onBack }: CardPaymentScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('Ahmad Eman');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const digits = cardNumber.replace(/\D/g, '');
  const last4 = digits.slice(-4) || '4289';
  const showMasked = digits.length === 0;
  const canPay =
    digits.length >= 15 &&
    cardName.trim().length >= 2 &&
    /^\d{2}\/\d{2}$/.test(expiry.trim()) &&
    cvv.length >= 3;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={cardPayStyles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={cardPayStyles.header}>
        <Pressable onPress={onBack} style={[cardPayStyles.backBtn, { backgroundColor: C.glass }]}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
        </Pressable>
        <Text style={[cardPayStyles.headerTitle, { color: C.primary }]}>Credit Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[cardPayStyles.cardPreview, STITCH_SHADOW]}>
        <AppImage uri={CREDIT_CARD_ART} style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(39,19,16,0.55)', 'rgba(39,19,16,0.35)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={cardPayStyles.cardTop}>
          <Ionicons name="wifi" size={28} color="rgba(255,255,255,0.9)" />
          <Text style={cardPayStyles.visa}>VISA</Text>
        </View>
        <View>
          <Text style={cardPayStyles.cardLabel}>Card Number</Text>
          <View style={cardPayStyles.cardNumberRow}>
            {showMasked ? (
              <>
                {maskDots()}
                <Text style={cardPayStyles.cardLast4}>{last4}</Text>
              </>
            ) : (
              <Text style={cardPayStyles.cardNumberText}>
                {digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
              </Text>
            )}
          </View>
          <View style={cardPayStyles.cardBottom}>
            <View>
              <Text style={cardPayStyles.cardLabelSm}>Card Holder</Text>
              <Text style={cardPayStyles.cardValue}>{cardName || 'Your Name'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={cardPayStyles.cardLabelSm}>Expires</Text>
              <Text style={cardPayStyles.cardValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[cardPayStyles.amountDue, { color: C.textMuted }]}>
        Amount due: <Text style={{ color: C.primary, fontFamily: FONTS.bold }}>{formatRM(amount)}</Text>
      </Text>

      {[
        { key: 'number', label: 'Card Number', value: cardNumber, setter: setCardNumber, placeholder: '1234 5678 9012 3456', keyboard: 'number-pad' as const },
        { key: 'name', label: 'Name on Card', value: cardName, setter: setCardName, placeholder: 'Ahmad Eman', keyboard: 'default' as const },
        { key: 'expiry', label: 'Expiry (MM/YY)', value: expiry, setter: setExpiry, placeholder: '09/27', keyboard: 'number-pad' as const },
        { key: 'cvv', label: 'CVV', value: cvv, setter: setCvv, placeholder: '•••', keyboard: 'number-pad' as const, secure: true },
      ].map((field) => (
        <GlassInputField
          key={field.key}
          C={C}
          label={field.label}
          value={field.value}
          onChangeText={field.setter}
          placeholder={field.placeholder}
          keyboardType={field.keyboard}
          secureTextEntry={field.secure}
        />
      ))}

      <View style={{ marginTop: 8 }}>
        <GradientButton label={`Pay ${formatRM(amount)}`} onPress={onPay} C={C} disabled={!canPay} />
      </View>
      <View style={cardPayStyles.secureRow}>
        <Ionicons name="lock-closed" size={14} color={C.textFaint} />
        <Text style={[cardPayStyles.secureText, { color: C.textFaint }]}>Secured with 256-bit encryption</Text>
      </View>
    </ScrollView>
  );
}

const cardPayStyles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18 },
  cardPreview: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 22,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visa: { color: '#fff', fontFamily: FONTS.bold, fontSize: 22, letterSpacing: 3 },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  dotGroup: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  cardLast4: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 18, letterSpacing: 2 },
  cardNumberText: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 18, letterSpacing: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabelSm: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardValue: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 15 },
  amountDue: { fontFamily: FONTS.regular, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  fieldLabel: { fontFamily: FONTS.semiBold, fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  secureText: { fontFamily: FONTS.regular, fontSize: 12 },
});

const checkoutStyles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: FONTS.semiBold,
  },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  divider: { height: 1, marginVertical: 4 },
  noteBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 8, marginBottom: 4 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    gap: 12,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: { width: 12, height: 12, borderRadius: 6 },
});

const tngStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  tngLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tngBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tngBadgeText: { color: '#0057B8', fontWeight: '900', fontSize: 12 },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 16, fontFamily: FONTS.bold },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4, fontFamily: FONTS.regular },
  body: { padding: 20, paddingBottom: 40 },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  merchantIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantName: { fontSize: 17, fontWeight: '800', color: '#0f172a', fontFamily: FONTS.bold },
  merchantBranch: { fontSize: 13, color: '#64748b', marginTop: 2, fontFamily: FONTS.regular },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: { fontSize: 13, color: '#64748b', fontFamily: FONTS.regular },
  amountValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0057B8',
    marginVertical: 8,
    fontFamily: FONTS.extraBold,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaLabel: { fontSize: 13, color: '#94a3b8', fontFamily: FONTS.regular },
  metaValue: { fontSize: 13, color: '#334155', fontWeight: '600', fontFamily: FONTS.semiBold },
  warnText: { color: '#dc2626', fontSize: 12, marginTop: 12, fontFamily: FONTS.semiBold },
  pinTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  pinSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    fontFamily: FONTS.regular,
  },
  pinRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  pinDotFilled: { borderColor: '#0057B8', backgroundColor: '#0057B8' },
  pinDotActive: { borderColor: '#0057B8' },
  pinBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  key: {
    width: 72,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  keyEmpty: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  keyText: { fontSize: 24, fontWeight: '600', color: '#1e293b', fontFamily: FONTS.semiBold },
  processingBox: { alignItems: 'center', paddingVertical: 32 },
  processingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16,
    fontFamily: FONTS.bold,
  },
  processingSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#00a651',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  footerText: { fontSize: 12, color: '#64748b', fontFamily: FONTS.regular },
});
