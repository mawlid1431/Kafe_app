import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import {
  BRANCHES,
  CATEGORIES,
  createSeedOrders,
  HOME_OFFERS,
  MENU,
  ONBOARDING_SLIDES,
  ORDER_STEPS,
  POINTS_HISTORY_SEED,
  PROMOS,
  REWARD_TIERS,
} from './data';
import { calcPromoDiscount, findPromo, pointsForSpend, type PromoCode } from './lib/promos';
import { hapticLight, hapticMedium, hapticSelection, hapticSuccess, hapticWarning } from './lib/haptics';
import { ToastProvider, useToast } from './native/feedback';
import { FONTS } from './native/fonts';
import {
  CheckoutSummary,
  DELIVERY_FEE,
  formatRM,
  generateOrderRef,
  orderTotal,
  PAYMENT_TNG,
  PaymentMethodPicker,
  type PaymentMethodId,
  TngPaymentScreen,
  type TngPayPhase,
  CardPaymentScreen,
} from './native/payments';
import {
  getTimeGreeting,
  StitchEmptyState,
  StitchStoreBar,
  TabScreenHeader,
} from './native/screenChrome';
import {
  GlassSurface,
  GlassCard,
  GlassSearchBar,
  LiquidGlassBackground,
  PROFILE_AVATAR,
  STITCH_AUTH_HERO,
  StitchBottomNav,
  StitchCategoryChip,
  StitchFeaturedCard,
  StitchFloatingCart,
  StitchMenuCard,
  StitchOptionPill,
  StitchPillButton,
  StitchPromoBanner,
  StitchStickyFooter,
  StitchTopBar,
} from './native/stitchUi';
import { OrderTrackingScreen } from './native/orderTracking';
import { OrdersScreen } from './native/ordersScreen';
import { RewardsScreen } from './native/rewardsScreen';
import { FavoritesScreen } from './native/favoritesScreen';
import { AppImage, GradientButton } from './native/ui';
import { BRAND, useBrandTheme, type ThemeColors } from './theme';
import type { CartLine, MenuItem, OrderRecord, PointsActivity, Screen, TabKey } from './types';

const TAB_SCREENS: Record<TabKey, Screen> = {
  home: 'home',
  menu: 'menu',
  cart: 'cart',
  orders: 'orders',
  profile: 'profile',
};

const SUGAR_OPTIONS = ['0%', '25%', '50%', '75%', '100%'];
const ICE_OPTIONS = ['No Ice', 'Less Ice', 'Full Ice'];

function cartLineKey(c: CartLine): string {
  return `${c.item.id}-${c.sugar}-${c.ice}`;
}

function useTheme(): ThemeColors {
  return useBrandTheme();
}

function KafeemanApp() {
  const { showToast } = useToast();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const menuCardWidth = (screenWidth - 24 * 2 - 12) / 2;
  const authHeroHeight = Math.min(Math.round(screenHeight * 0.42), 380);
  const onboardImageHeight = Math.min(220, Math.round(screenHeight * 0.3));
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [screen, setScreen] = useState<Screen>('splash');
  const [returnScreen, setReturnScreen] = useState<Screen>('menu');
  const [tab, setTab] = useState<TabKey>('home');
  const [slide, setSlide] = useState(0);
  const [category, setCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showPw, setShowPw] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([1, 4]);
  const [orders, setOrders] = useState<OrderRecord[]>(() => createSeedOrders());
  const [points, setPoints] = useState(1240);
  const [pointsHistory, setPointsHistory] = useState<PointsActivity[]>(POINTS_HISTORY_SEED);
  const [activeOrderId, setActiveOrderId] = useState<string | null>('KE-20250624-9102');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [orderTab, setOrderTab] = useState<'Active' | 'Past'>('Active');
  const [payMethod, setPayMethod] = useState<PaymentMethodId>('tng');
  const [orderRef, setOrderRef] = useState(() => generateOrderRef());
  const [tngPhase, setTngPhase] = useState<TngPayPhase>('pin');
  const [paidAmount, setPaidAmount] = useState(0);
  const [promoIdx, setPromoIdx] = useState(0);
  const [splashPhase, setSplashPhase] = useState<0 | 1 | 2>(0);
  const [trackingStep, setTrackingStep] = useState(0);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedBranch, setSelectedBranch] = useState<string>(BRANCHES[2].name);
  const [sugar, setSugar] = useState('50%');
  const [ice, setIce] = useState('Full Ice');
  const [tngPin, setTngPin] = useState<string[]>([]);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const cartTotal = cart.reduce((a, c) => a + c.item.price * c.qty, 0);
  const discountAmount = calcPromoDiscount(cartTotal, appliedPromo);
  const totalDue = orderTotal(cartTotal, orderType === 'delivery', discountAmount);
  const filtered = useMemo(() => {
    let items = category === 'All' ? MENU : MENU.filter((m) => m.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
      );
    }
    return items;
  }, [category, searchQuery]);
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MENU.filter(
      (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);
  const favoriteItems = useMemo(() => MENU.filter((m) => favorites.includes(m.id)), [favorites]);
  const lastPastOrder = useMemo(
    () => orders.find((o) => o.status === 'delivered'),
    [orders],
  );
  const rewardTier = REWARD_TIERS.find((t) => points >= t.min && points <= t.max) ?? REWARD_TIERS[0];
  const pointsToGold =
    rewardTier.name === 'Gold'
      ? 0
      : Math.max(0, (REWARD_TIERS[REWARD_TIERS.indexOf(rewardTier) + 1]?.min ?? 1500) - points);
  const showNav = ['home', 'menu', 'cart', 'orders', 'profile'].includes(screen);
  const showTopBar = screen === 'home' || screen === 'menu';
  const showLiquidBg = ['home', 'menu', 'cart', 'orders', 'profile', 'rewards', 'favorites'].includes(screen);
  const showFloatingCart = screen === 'menu' && cartCount > 0;

  const go = useCallback((s: Screen) => {
    const tabMap: Partial<Record<Screen, TabKey>> = {
      home: 'home',
      menu: 'menu',
      cart: 'cart',
      orders: 'orders',
      profile: 'profile',
    };
    if (tabMap[s]) setTab(tabMap[s] as TabKey);
    setScreen(s);
  }, []);

  const openProductDetail = useCallback((item: MenuItem, from: Screen = screen) => {
    setReturnScreen(from);
    setSelectedItem(item);
    setSugar('50%');
    setIce('Full Ice');
    setScreen('product-detail');
  }, [screen]);

  const notifyAddedToCart = useCallback(
    (name: string) => {
      showToast(`${name} added to cart`, 'success', { label: 'View cart', onPress: () => go('cart') });
    },
    [go, showToast],
  );

  const addToCart = (item: MenuItem, sugarVal = '50%', iceVal = 'Full Ice', withFeedback = true) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id && c.sugar === sugarVal && c.ice === iceVal);
      if (existing) {
        return prev.map((c) => (c === existing ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1, sugar: sugarVal, ice: iceVal }];
    });
    if (withFeedback) {
      void hapticMedium();
      notifyAddedToCart(item.name);
    }
  };

  const adjustQty = (lineKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (cartLineKey(c) === lineKey ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    );
    void hapticLight();
  };

  const toggleFavorite = useCallback((id: number) => {
    const item = MENU.find((m) => m.id === id);
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      const added = !prev.includes(id);
      void hapticSelection();
      showToast(
        added ? `${item?.name ?? 'Item'} saved to favourites` : 'Removed from favourites',
        added ? 'success' : 'info',
      );
      return next;
    });
  }, [showToast]);

  const applyPromoFromCode = useCallback(
    (code: string) => {
      const promo = findPromo(code);
      if (!promo) {
        setAppliedPromo(null);
        setPromoMessage('Invalid promo code');
        void hapticWarning();
        showToast('Invalid promo code', 'error');
        return;
      }
      const disc = calcPromoDiscount(cartTotal, promo);
      if (disc === 0 && promo.minSpend) {
        setAppliedPromo(null);
        setPromoMessage(`Min spend RM ${promo.minSpend.toFixed(0)} required`);
        void hapticWarning();
        showToast(`Min spend RM ${promo.minSpend.toFixed(0)} required`, 'error');
        return;
      }
      setPromoCode(promo.code);
      setAppliedPromo(promo);
      setPromoMessage(`Applied: ${promo.label}`);
      void hapticSuccess();
      showToast(`${promo.label} applied`, 'success');
    },
    [cartTotal, showToast],
  );

  const completeOrder = useCallback(
    (paid: number) => {
      const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
      const total = paid;
      const earned = pointsForSpend(total);
      const newOrder: OrderRecord = {
        id: orderRef,
        items: cart.map((c) => ({ ...c })),
        subtotal: cartTotal,
        discount: discountAmount,
        deliveryFee,
        total,
        status: 'active',
        trackingStep: 0,
        branch: selectedBranch,
        orderType,
        payMethod,
        createdAt: Date.now(),
        pointsEarned: earned,
      };
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderRef)]);
      setPoints((p) => p + earned);
      setPointsHistory((prev) => [
        { id: `p-${orderRef}`, label: `Order ${orderRef}`, delta: earned, date: 'Today' },
        ...prev,
      ]);
      setActiveOrderId(orderRef);
      setTrackingStep(0);
      setPaidAmount(total);
      setCart([]);
      setAppliedPromo(null);
      setPromoCode('');
      setPromoMessage('');
      void hapticSuccess();
      showToast(`Order ${orderRef} confirmed`, 'success', { label: 'Track', onPress: () => setScreen('order-tracking') });
    },
    [
      cart,
      cartTotal,
      discountAmount,
      orderRef,
      orderType,
      payMethod,
      selectedBranch,
      showToast,
    ],
  );

  const trackOrder = useCallback((order: OrderRecord) => {
    setOrderRef(order.id);
    setTrackingStep(order.trackingStep);
    setOrderType(order.orderType);
    setSelectedBranch(order.branch);
    setActiveOrderId(order.id);
    setScreen('order-tracking');
  }, []);

  const reorder = useCallback(
    (order: OrderRecord) => {
      setCart(order.items.map((line) => ({ ...line, item: { ...line.item } })));
      void hapticMedium();
      showToast('Items added to cart', 'success');
      go('cart');
    },
    [go, showToast],
  );

  const startTracking = () => {
    const active = orders.find((o) => o.id === (activeOrderId ?? orderRef) && o.status === 'active');
    if (active) {
      trackOrder(active);
      return;
    }
    setTrackingStep(0);
    setScreen('order-tracking');
  };

  const openCheckout = () => {
    setOrderRef(generateOrderRef());
    setPayMethod('tng');
    setScreen('checkout');
  };

  const openPaymentFlow = () => {
    if (payMethod === 'tng') {
      setTngPin([]);
      setTngPhase('pin');
      setScreen('payment-tng');
      return;
    }
    if (payMethod === 'card') {
      setScreen('payment-card');
      return;
    }
    setPaidAmount(totalDue);
    completeOrder(totalDue);
    setScreen('order-success');
    setTimeout(startTracking, 1500);
  };

  const handleTngPinKey = (key: number | 'del') => {
    if (tngPhase !== 'pin') return;
    if (key === 'del') {
      setTngPin((p) => p.slice(0, -1));
      return;
    }
    setTngPin((p) => (p.length < 6 ? [...p, String(key)] : p));
  };

  const confirmTngPayment = () => {
    setTngPhase('processing');
    setTimeout(() => {
      setTngPhase('approved');
      setTimeout(() => {
        setTngPin([]);
        setTngPhase('pin');
        completeOrder(totalDue);
        setScreen('order-success');
        setTimeout(startTracking, 1200);
      }, 1400);
    }, 1800);
  };

  useEffect(() => {
    if (screen !== 'splash') return;
    const t1 = setTimeout(() => setSplashPhase(1), 350);
    const t2 = setTimeout(() => setSplashPhase(2), 2200);
    const t3 = setTimeout(() => setScreen('onboarding'), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [screen]);

  useEffect(() => {
    const t = setInterval(() => setPromoIdx((i) => (i + 1) % PROMOS.length), 3800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (screen !== 'order-tracking') return;
    if (trackingStep >= ORDER_STEPS.length - 1) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === (activeOrderId ?? orderRef) && o.status === 'active'
            ? { ...o, trackingStep, status: 'delivered' as const }
            : o,
        ),
      );
      return;
    }
    const t = setTimeout(() => {
      const next = trackingStep + 1;
      setTrackingStep(next);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === (activeOrderId ?? orderRef) ? { ...o, trackingStep: next } : o,
        ),
      );
    }, 5000);
    return () => clearTimeout(t);
  }, [screen, trackingStep, activeOrderId, orderRef]);

  const BackBtn = ({ onPress }: { onPress: () => void }) => (
    <Pressable onPress={onPress} style={styles.backBtn}>
      <Ionicons name="chevron-back" size={20} color={C.text} />
    </Pressable>
  );

  const PrimaryBtn = (props: { label: string; onPress?: () => void; disabled?: boolean; variant?: 'primary' | 'tng' }) => (
    <GradientButton {...props} C={C} variant={props.variant ?? 'primary'} />
  );

  const GhostBtn = ({ label, onPress }: { label: string; onPress?: () => void }) => (
    <GradientButton label={label} onPress={onPress} C={C} variant="ghost" />
  );

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return (
          <LinearGradient
            colors={['#f3f3f3', BRAND.bg, BRAND.bg]}
            style={[styles.splash, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
          >
            <View style={styles.splashContent}>
              <GlassSurface level="float" style={styles.splashLogoGlass}>
                <LinearGradient colors={[C.primaryContainer, C.primaryDark]} style={styles.splashLogo}>
                  <Text style={{ fontSize: 48 }}>☕</Text>
                </LinearGradient>
              </GlassSurface>
              <Text style={styles.splashTitle}>Kafe Eman</Text>
              <Text style={styles.splashSub}>Brew · Sip · Enjoy</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: splashPhase === 0 ? '0%' : splashPhase === 1 ? '88%' : '100%',
                    },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        );

      case 'onboarding': {
        const s = ONBOARDING_SLIDES[slide];
        return (
          <View style={styles.flex}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.onboardScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.onboardHeader}>
                <Pressable onPress={() => setScreen('auth')} style={styles.skipBtn}>
                  <Text style={{ color: C.textMuted, fontWeight: '600' }}>Skip</Text>
                </Pressable>
              </View>
              <AppImage uri={s.img} style={[styles.onboardImage, { height: onboardImageHeight }]} />
              <View style={styles.onboardBody}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>{s.emoji}</Text>
                <Text style={styles.screenTitle}>{s.title}</Text>
                <Text style={styles.bodyText}>{s.sub}</Text>
              </View>
              <View style={styles.dots}>
                {ONBOARDING_SLIDES.map((_, i) => (
                  <Pressable key={i} onPress={() => setSlide(i)}>
                    <View style={[styles.dot, i === slide && styles.dotActive]} />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={[styles.onboardFooter, { paddingBottom: insets.bottom + 16 }]}>
              {slide < 2 ? (
                <PrimaryBtn label="Next →" onPress={() => setSlide(slide + 1)} />
              ) : (
                <PrimaryBtn label="Get Started" onPress={() => setScreen('auth')} />
              )}
            </View>
          </View>
        );
      }

      case 'auth':
        return (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <AppImage uri={STITCH_AUTH_HERO} style={{ width: '100%', height: authHeroHeight }} />
            <LinearGradient
              colors={['transparent', `${C.bg}99`, C.bg]}
              style={[styles.authHeroFade, { top: authHeroHeight - 100, height: 100 }]}
            />
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.authScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              <GlassSurface level="float" style={styles.authGlassPanel} strong intensity={60}>
                <View style={styles.authPanelInner}>
                  <Text style={[styles.authHeadline, { color: C.primary }]}>
                    Elevate your coffee experience
                  </Text>
                  <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 8 }]}>
                    Join the Kafe Eman community for exclusive rewards and seamless ordering.
                  </Text>
                  <View style={styles.authButtonStack}>
                    <StitchPillButton label="Sign Up" onPress={() => setScreen('signup')} C={C} />
                    <StitchPillButton
                      label="Login"
                      onPress={() => {
                        void hapticMedium();
                        showToast('Welcome back, Ahmad!', 'success');
                        setScreen('branch');
                      }}
                      C={C}
                      variant="outline"
                    />
                    <StitchPillButton
                      label="Continue with Apple"
                      onPress={() => setScreen('signup')}
                      C={C}
                      variant="apple"
                      icon="logo-apple"
                    />
                  </View>
                  <Pressable
                    onPress={() => {
                      void hapticLight();
                      go('home');
                    }}
                    style={{ marginTop: 16, alignItems: 'center' }}
                  >
                    <Text style={{ color: C.secondary, fontFamily: FONTS.semiBold, fontSize: 14 }}>
                      Continue as Guest
                    </Text>
                  </Pressable>
                </View>
              </GlassSurface>
              <View style={{ height: insets.bottom + 8 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'signup':
        return (
          <ScrollView contentContainerStyle={styles.padH}>
            <View style={styles.rowHeader}>
              <BackBtn onPress={() => setScreen('auth')} />
              <Text style={styles.headerTitle}>Create Account</Text>
            </View>
            {['Full Name', 'Email', 'Password', 'Confirm Password'].map((label) => (
              <View key={label} style={{ marginBottom: 16 }}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  placeholder={label === 'Full Name' ? 'Ahmad Eman' : label === 'Email' ? 'ahmad@email.com' : '••••••••'}
                  placeholderTextColor={C.textFaint}
                  secureTextEntry={label.includes('Password') && !showPw}
                  keyboardType={label === 'Email' ? 'email-address' : 'default'}
                  style={styles.input}
                />
              </View>
            ))}
            <Pressable onPress={() => setShowPw(!showPw)} style={{ marginBottom: 16 }}>
              <Text style={{ color: C.primary, fontSize: 13 }}>{showPw ? 'Hide password' : 'Show password'}</Text>
            </Pressable>
            <PrimaryBtn label="Continue" onPress={() => setScreen('otp')} />
          </ScrollView>
        );

      case 'otp':
        return (
          <View style={styles.padH}>
            <View style={styles.rowHeader}>
              <BackBtn onPress={() => setScreen('signup')} />
              <Text style={styles.headerTitle}>Verify Phone</Text>
            </View>
            <View style={styles.otpIcon}>
              <Ionicons name="call" size={28} color={C.primary} />
            </View>
            <Text style={styles.screenTitleSm}>Enter OTP Code</Text>
            <Text style={[styles.bodyText, { marginBottom: 24 }]}>We sent a 6-digit code to +60 12-345 6789</Text>
            <View style={styles.otpRow}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  maxLength={1}
                  value={d}
                  keyboardType="number-pad"
                  onChangeText={(v) => {
                    const digit = v.replace(/\D/g, '');
                    setOtp((prev) => {
                      const next = [...prev];
                      next[i] = digit;
                      return next;
                    });
                    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
                  }}
                  style={[styles.otpBox, d ? { borderColor: C.primary, backgroundColor: `${C.primary}22` } : null]}
                />
              ))}
            </View>
            <PrimaryBtn label="Verify" onPress={() => setScreen('profile-setup')} />
          </View>
        );

      case 'profile-setup':
        return (
          <ScrollView contentContainerStyle={styles.padH}>
            <Text style={styles.screenTitle}>Set Up Profile</Text>
            <Text style={[styles.bodyText, { marginBottom: 24 }]}>Tell us a little about yourself</Text>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={40} color={C.primary} />
            </View>
            <PrimaryBtn label="Continue" onPress={() => setScreen('branch')} />
          </ScrollView>
        );

      case 'branch':
        return (
          <ScrollView contentContainerStyle={styles.padH}>
            <Ionicons name="location" size={28} color={C.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.screenTitle}>Select Branch</Text>
            <Text style={[styles.bodyText, { marginBottom: 20 }]}>Choose your nearest Kafe Eman</Text>
            {BRANCHES.map((b) => (
              <Pressable
                key={b.name}
                onPress={() => {
                  setSelectedBranch(b.name);
                  setScreen('order-type');
                }}
                style={[styles.branchCard, selectedBranch === b.name && { borderColor: C.primary, borderWidth: 2 }]}
              >
                <AppImage uri={b.img} style={styles.branchImage} />
                <View style={styles.branchBody}>
                  <Text style={styles.branchName}>{b.name}</Text>
                  <Text style={styles.bodyText}>{b.addr}</Text>
                  <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700', marginTop: 6 }}>{b.time}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        );

      case 'order-type':
        return (
          <View style={[styles.padH, { flex: 1, justifyContent: 'center' }]}>
            <Text style={[styles.screenTitle, { textAlign: 'center' }]}>How would you like it?</Text>
            <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 8 }]}>You can change this anytime</Text>
            <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 24 }]}>📍 {selectedBranch}</Text>
            <Pressable
              onPress={() => {
                setOrderType('delivery');
                go('home');
              }}
              style={styles.orderTypeCard}
            >
              <LinearGradient colors={['#8B5A2B', '#5c3d1e', '#3d2817']} style={StyleSheet.absoluteFillObject} />
              <View style={{ zIndex: 1 }}>
                <Text style={styles.orderTypeEmoji}>🚗</Text>
                <Text style={styles.orderTypeTitle}>Delivery</Text>
                <Text style={styles.orderTypeSub}>30–45 min to your door</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                setOrderType('pickup');
                go('home');
              }}
              style={styles.orderTypeCard}
            >
              <LinearGradient colors={['#2d5a8a', '#1e3a5f', '#0f1e35']} style={StyleSheet.absoluteFillObject} />
              <View style={{ zIndex: 1 }}>
                <Text style={styles.orderTypeEmoji}>🏪</Text>
                <Text style={styles.orderTypeTitle}>Pickup</Text>
                <Text style={styles.orderTypeSub}>Ready in 5–10 min</Text>
              </View>
            </Pressable>
          </View>
        );

      case 'home':
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}>
            <View style={styles.padH}>
              <Text style={[styles.stitchGreeting, { color: C.primary }]}>
                {getTimeGreeting()}, Aman! ☕
              </Text>
              <StitchStoreBar
                C={C}
                branch={selectedBranch}
                orderType={orderType}
                onPress={() => setScreen('order-type')}
              />
              <View style={{ marginTop: 12 }}>
              <GlassSearchBar
                C={C}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for your favorite brew..."
                onClear={() => setSearchQuery('')}
              />
              </View>
            </View>
            <View style={[styles.padH, { marginTop: 24 }]}>
              <StitchPromoBanner
                C={C}
                title={PROMOS[promoIdx].title}
                sub={PROMOS[promoIdx].sub}
                image={PROMOS[promoIdx].img}
                code={PROMOS[promoIdx].code}
                onPress={() => {
                  applyPromoFromCode(PROMOS[promoIdx].code);
                  go('cart');
                }}
              />
              <View style={styles.promoDots}>
                {PROMOS.map((p, i) => (
                  <View
                    key={p.id}
                    style={[
                      styles.promoDot,
                      { backgroundColor: i === promoIdx ? C.primaryContainer : C.outlineVariant },
                    ]}
                  />
                ))}
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}
            >
              {HOME_OFFERS.map((offer) => (
                <GlassCard key={offer.id} level="sheet" style={styles.offerChip}>
                  <Pressable onPress={() => {
                    applyPromoFromCode(offer.code);
                    go('cart');
                  }}>
                    <Text style={[styles.offerTag, { color: C.accent }]}>{offer.tag}</Text>
                    <Text style={[styles.offerTitle, { color: C.text }]}>{offer.title}</Text>
                  </Pressable>
                </GlassCard>
              ))}
            </ScrollView>
            <GlassCard level="sheet" style={{ marginHorizontal: 24, marginTop: 24 }}>
              <Pressable onPress={() => go('rewards')} style={styles.rewardsCardInner}>
                <Ionicons name="sparkles" size={22} color={C.accent} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: C.text, fontFamily: FONTS.bold }}>{points.toLocaleString()} Points</Text>
                  <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: FONTS.regular }}>
                    {pointsToGold > 0
                      ? `${pointsToGold} pts to Gold ${REWARD_TIERS[2].emoji}`
                      : `Gold member ${REWARD_TIERS[2].emoji}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
              </Pressable>
            </GlassCard>
            {lastPastOrder && (
              <GlassCard level="sheet" style={{ marginHorizontal: 24, marginTop: 16 }}>
                <Pressable onPress={() => reorder(lastPastOrder)} style={styles.reorderCardInner}>
                  <Ionicons name="refresh" size={20} color={C.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: C.text, fontFamily: FONTS.bold }}>Order again</Text>
                    <Text style={{ color: C.textMuted, fontSize: 12 }}>
                      {lastPastOrder.items[0]?.item.name ?? 'Your last order'}
                    </Text>
                  </View>
                  <Text style={{ color: C.primary, fontFamily: FONTS.semiBold, fontSize: 13 }}>Reorder</Text>
                </Pressable>
              </GlassCard>
            )}
            {searchQuery.trim() ? (
              <View style={[styles.padH, { marginTop: 32 }]}>
                <Text style={[styles.sectionTitle, { color: C.primary }]}>
                  Search results ({searchResults.length})
                </Text>
                {searchResults.length === 0 ? (
                  <Text style={[styles.bodyText, { marginTop: 12 }]}>No drinks match your search.</Text>
                ) : (
                  searchResults.slice(0, 6).map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => openProductDetail(item, 'home')}
                      style={[styles.searchRow, { borderBottomColor: C.glassBorder }]}
                    >
                      <AppImage uri={item.image} style={styles.listThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontFamily: FONTS.bold }}>{item.name}</Text>
                        <Text style={{ color: C.textMuted, fontSize: 12 }}>{item.category}</Text>
                      </View>
                      <Text style={{ color: C.primary, fontFamily: FONTS.bold }}>RM {item.price.toFixed(2)}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}
            {favoriteItems.length > 0 && !searchQuery.trim() && (
              <>
                <View style={[styles.padH, { marginTop: 32 }]}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: C.primary }]}>Your Favourites</Text>
                    <Pressable onPress={() => go('favorites')}>
                      <Text style={{ color: C.primary, fontFamily: FONTS.semiBold, fontSize: 14 }}>See all</Text>
                    </Pressable>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}>
                  {favoriteItems.slice(0, 6).map((item) => (
                    <StitchFeaturedCard
                      key={item.id}
                      C={C}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      rating={item.rating}
                      isFavorite
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      onPress={() => openProductDetail(item, 'home')}
                      onAdd={() => addToCart(item)}
                    />
                  ))}
                </ScrollView>
              </>
            )}
            {!searchQuery.trim() && (
              <>
                <View style={[styles.padH, { marginTop: 32 }]}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: C.primary }]}>Featured Drinks</Text>
                    <Pressable onPress={() => go('menu')}>
                      <Text style={{ color: C.primary, fontFamily: FONTS.semiBold, fontSize: 14 }}>See all</Text>
                    </Pressable>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}>
                  {MENU.slice(0, 6).map((item) => (
                    <StitchFeaturedCard
                      key={item.id}
                      C={C}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      rating={item.rating}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      onPress={() => openProductDetail(item, 'home')}
                      onAdd={() => addToCart(item)}
                    />
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>
        );

      case 'menu':
        return (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.padH, styles.menuChipRow]}
            >
              {CATEGORIES.map((c) => (
                <StitchCategoryChip
                  key={c}
                  C={C}
                  label={c}
                  active={category === c}
                  icon={c === 'Coffee' ? 'cafe' : undefined}
                  onPress={() => setCategory(c)}
                />
              ))}
            </ScrollView>
            <View style={[styles.menuGrid, styles.padH]}>
              {filtered.length === 0 ? (
                <Text style={[styles.bodyText, { width: '100%', textAlign: 'center', marginTop: 32 }]}>
                  No items in this category yet.
                </Text>
              ) : (
                filtered.map((item) => (
                  <StitchMenuCard
                    key={item.id}
                    C={C}
                    width={menuCardWidth}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    onPress={() => openProductDetail(item, 'menu')}
                    onAdd={() => addToCart(item)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        );

      case 'product-detail':
        if (!selectedItem) return null;
        return (
          <View style={styles.flex}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              <View style={styles.detailHeroWrap}>
                <AppImage uri={selectedItem.image} style={styles.detailHero} />
                <LinearGradient
                  colors={['transparent', C.bg]}
                  style={styles.detailHeroGradient}
                />
                <Pressable onPress={() => setScreen(returnScreen)} style={styles.detailBackGlass}>
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </Pressable>
                <Pressable onPress={() => toggleFavorite(selectedItem.id)} style={styles.detailFavGlass}>
                  <Ionicons
                    name={favorites.includes(selectedItem.id) ? 'heart' : 'heart-outline'}
                    size={22}
                    color={favorites.includes(selectedItem.id) ? '#e11d48' : '#fff'}
                  />
                </Pressable>
              </View>
              <View style={styles.padH}>
                <View style={styles.detailTitleRow}>
                  <Text style={[styles.detailTitle, { color: C.primaryContainer }]}>{selectedItem.name}</Text>
                  <Text style={[styles.detailPrice, { color: C.primaryContainer }]}>
                    RM {selectedItem.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.bodyText, { marginBottom: 32 }]}>{selectedItem.description}</Text>
                <GlassSurface style={styles.customGlassCard} strong intensity={50}>
                  <Text style={[styles.customLabel, { color: C.primaryContainer }]}>Sugar Level</Text>
                  <View style={styles.optionRow}>
                    {SUGAR_OPTIONS.map((o) => (
                      <StitchOptionPill key={o} label={o} active={sugar === o} onPress={() => setSugar(o)} C={C} />
                    ))}
                  </View>
                  <Text style={[styles.customLabel, { color: C.primaryContainer, marginTop: 24 }]}>Ice Level</Text>
                  <View style={styles.optionRow}>
                    {ICE_OPTIONS.map((o) => (
                      <StitchOptionPill key={o} label={o} active={ice === o} onPress={() => setIce(o)} C={C} />
                    ))}
                  </View>
                </GlassSurface>
              </View>
            </ScrollView>
            <View style={styles.detailFooterGlass}>
              <StitchPillButton
                label={`Add to Cart — RM ${selectedItem.price.toFixed(2)}`}
                onPress={() => addToCart(selectedItem, sugar, ice)}
                C={C}
                icon="bag"
              />
            </View>
          </View>
        );

      case 'cart':
        return (
          <View style={styles.flex}>
            <View style={styles.padH}>
              <TabScreenHeader
                C={C}
                title="Your Cart"
                subtitle={cartCount > 0 ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Add drinks from the menu'}
              />
              {cart.length > 0 && (
                <StitchStoreBar
                  C={C}
                  branch={selectedBranch}
                  orderType={orderType}
                  onPress={() => setScreen('order-type')}
                />
              )}
            </View>
            <ScrollView contentContainerStyle={[styles.padH, { paddingBottom: cart.length ? 200 : 40 }]}>
              {cart.length === 0 ? (
                <StitchEmptyState
                  C={C}
                  icon="cart-outline"
                  title="Your cart is empty"
                  message="Browse the menu and add your favourite brews."
                  actionLabel="Browse menu"
                  onAction={() => go('menu')}
                />
              ) : (
                cart.map((c) => {
                  const key = cartLineKey(c);
                  return (
                  <GlassCard key={key} level="sheet" style={{ marginBottom: 10 }}>
                    <View style={styles.cartLineInner}>
                      <AppImage uri={c.item.image} style={styles.listThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontWeight: '700' }}>{c.item.name}</Text>
                        <Text style={{ color: C.textFaint, fontSize: 12 }}>{c.sugar} · {c.ice}</Text>
                        <Text style={{ color: C.primary, fontWeight: '700', marginTop: 4 }}>
                          RM {(c.item.price * c.qty).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.qtyRow}>
                        <Pressable onPress={() => adjustQty(key, -1)} style={styles.qtyBtn}>
                          <Ionicons name="remove" size={14} color={C.text} />
                        </Pressable>
                        <Text style={{ color: C.text, fontWeight: '700', minWidth: 20, textAlign: 'center' }}>{c.qty}</Text>
                        <Pressable onPress={() => adjustQty(key, 1)} style={styles.addBtnSm}>
                          <Ionicons name="add" size={14} color={C.onPrimary} />
                        </Pressable>
                      </View>
                    </View>
                  </GlassCard>
                  );
                })
              )}
              {cart.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <GlassSearchBar
                        C={C}
                        value={promoCode}
                        onChangeText={(t) => {
                          setPromoCode(t);
                          setPromoMessage('');
                        }}
                        placeholder="Promo code"
                        autoCapitalize="characters"
                      />
                    </View>
                    <Pressable
                      onPress={() => applyPromoFromCode(promoCode)}
                      style={[styles.qtyBtn, { paddingHorizontal: 14 }]}
                    >
                      <Text style={{ color: C.textMuted, fontWeight: '700', fontSize: 12 }}>Apply</Text>
                    </Pressable>
                  </View>
                  {promoMessage ? (
                    <Text
                      style={{
                        color: appliedPromo ? '#22c55e' : C.error,
                        fontSize: 12,
                        marginTop: 6,
                        fontFamily: FONTS.semiBold,
                      }}
                    >
                      {promoMessage}
                    </Text>
                  ) : null}
                <GlassCard level="sheet" style={{ marginTop: 12 }}>
                  <View style={styles.summaryRow}>
                    <Text style={{ color: C.textMuted }}>Subtotal</Text>
                    <Text style={{ color: C.text }}>RM {cartTotal.toFixed(2)}</Text>
                  </View>
                  {discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={{ color: C.textMuted }}>Discount ({appliedPromo?.code})</Text>
                      <Text style={{ color: '#22c55e' }}>- RM {discountAmount.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={{ color: C.textMuted }}>
                      {orderType === 'delivery' ? 'Delivery fee' : 'Pickup'}
                    </Text>
                    <Text style={{ color: orderType === 'delivery' ? C.text : '#22c55e' }}>
                      {orderType === 'delivery' ? formatRM(DELIVERY_FEE) : 'Free'}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: C.glassBorder, paddingTop: 8 }]}>
                    <Text style={{ color: C.text, fontWeight: '800' }}>Total</Text>
                    <Text style={{ color: C.primary, fontWeight: '800', fontSize: 18 }}>
                      {formatRM(totalDue)}
                    </Text>
                  </View>
                </GlassCard>
                </>
              )}
            </ScrollView>
            {cart.length > 0 && (
              <StitchStickyFooter aboveNav>
                <StitchPillButton
                  label={`Continue to Checkout — ${formatRM(totalDue)}`}
                  onPress={openCheckout}
                  C={C}
                  icon="arrow-forward"
                />
              </StitchStickyFooter>
            )}
          </View>
        );

      case 'checkout':
        return (
          <View style={styles.flex}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              <View style={[styles.rowHeader, styles.padH]}>
                <BackBtn onPress={() => setScreen('cart')} />
                <Text style={styles.headerTitle}>Checkout</Text>
              </View>
              <View style={styles.padH}>
                {orderType === 'delivery' && (
                  <View style={[styles.summaryCard, { marginBottom: 16 }]}>
                    <Text style={styles.label}>Deliver to</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
                      <View style={[styles.otpIcon, { width: 36, height: 36, marginBottom: 0 }]}>
                        <Ionicons name="location" size={18} color={C.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontWeight: '700' }}>Home</Text>
                        <Text style={styles.bodyText}>No. 12, Jalan Mawar 3, Taman Desa, 58100 KL</Text>
                      </View>
                    </View>
                  </View>
                )}
                <CheckoutSummary
                  C={C}
                  cart={cart}
                  cartTotal={cartTotal}
                  discountAmount={discountAmount}
                  promoCode={appliedPromo?.code}
                  orderType={orderType}
                  orderRef={orderRef}
                  selectedBranch={selectedBranch}
                />
                <PaymentMethodPicker C={C} selected={payMethod} onSelect={setPayMethod} />
                <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 8, fontSize: 12 }]}>
                  You will confirm the final amount on the next screen
                </Text>
              </View>
            </ScrollView>
            <StitchStickyFooter>
              {payMethod === 'tng' ? (
                <PrimaryBtn
                  label={`Continue with ${PAYMENT_TNG}`}
                  onPress={openPaymentFlow}
                  variant="tng"
                />
              ) : (
                <StitchPillButton
                  label={
                    payMethod === 'card'
                      ? `Continue — ${formatRM(totalDue)}`
                      : `Pay ${formatRM(totalDue)} via FPX`
                  }
                  onPress={openPaymentFlow}
                  C={C}
                  icon="arrow-forward"
                />
              )}
            </StitchStickyFooter>
          </View>
        );

      case 'payment-tng':
        return (
          <TngPaymentScreen
            amount={totalDue}
            orderRef={orderRef}
            merchant="Kafe Eman"
            branch={selectedBranch}
            pin={tngPin}
            phase={tngPhase}
            onPinKey={handleTngPinKey}
            onConfirm={confirmTngPayment}
            onBack={() => {
              if (tngPhase === 'pin') {
                setTngPin([]);
                setScreen('checkout');
              }
            }}
          />
        );

      case 'payment-card':
        return (
          <CardPaymentScreen
            C={C}
            amount={totalDue}
            onBack={() => setScreen('checkout')}
            onPay={() => {
              completeOrder(totalDue);
              setScreen('order-success');
              setTimeout(startTracking, 1500);
            }}
          />
        );

      case 'order-success':
        return (
          <ScrollView
            contentContainerStyle={[
              styles.center,
              styles.padH,
              { flexGrow: 1, paddingTop: 24, paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={72} color="#00a651" />
            </View>
            <Text style={[styles.screenTitle, { textAlign: 'center', marginTop: 16 }]}>Payment successful</Text>
            <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 8 }]}>
              {formatRM(paidAmount || totalDue)} paid via{' '}
              {payMethod === 'tng' ? PAYMENT_TNG : payMethod === 'card' ? 'Card' : 'FPX'}
            </Text>
            <View style={[styles.summaryCard, { width: '100%', marginTop: 20 }]}>
              <View style={styles.summaryRow}>
                <Text style={{ color: C.textMuted }}>Order ID</Text>
                <Text style={{ color: C.primary, fontWeight: '700' }}>{orderRef}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: C.textMuted }}>Branch</Text>
                <Text style={{ color: C.text }}>{selectedBranch}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: C.textMuted }}>Status</Text>
                <Text style={{ color: '#22c55e', fontWeight: '700' }}>Confirmed</Text>
              </View>
              {pointsForSpend(paidAmount || totalDue) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={{ color: C.textMuted }}>Points earned</Text>
                  <Text style={{ color: C.accent, fontWeight: '700' }}>
                    +{pointsForSpend(paidAmount || totalDue)} pts
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 16 }]}>
              Your coffee is being prepared. Track your order in real time.
            </Text>
            <View style={{ height: 24, width: '100%' }} />
            <PrimaryBtn label="Track Order" onPress={startTracking} />
            <View style={{ height: 12, width: '100%' }} />
            <GhostBtn label="Back to Home" onPress={() => go('home')} />
          </ScrollView>
        );

      case 'order-tracking':
        return (
          <OrderTrackingScreen
            C={C}
            orderRef={orderRef}
            trackingStep={trackingStep}
            orderType={orderType}
            branchName={selectedBranch}
            onBack={() => go('orders')}
            onDone={() => go('home')}
          />
        );

      case 'orders':
        return (
          <OrdersScreen
            C={C}
            orders={orders}
            orderTab={orderTab}
            onTabChange={(t) => {
              void hapticSelection();
              setOrderTab(t);
            }}
            onTrack={trackOrder}
            onReorder={reorder}
            onBrowseMenu={() => go('menu')}
          />
        );

      case 'favorites':
        return (
          <FavoritesScreen
            C={C}
            items={MENU}
            favorites={favorites}
            cardWidth={menuCardWidth}
            onBack={() => go('profile')}
            onItemPress={(item) => openProductDetail(item, 'favorites')}
            onAdd={(item) => addToCart(item)}
            onToggleFavorite={toggleFavorite}
          />
        );

      case 'profile':
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[styles.padH, styles.center, { paddingTop: 16 }]}>
              <View style={styles.avatarWrap}>
                <AppImage uri={PROFILE_AVATAR} style={styles.profileAvatar} />
              </View>
              <Text style={styles.screenTitleSm}>Ahmad Eman</Text>
              <Text style={styles.bodyText}>ahmad@email.com</Text>
              <GlassCard level="sheet" style={{ width: '100%', marginTop: 20 }}>
                <Pressable onPress={() => go('rewards')} style={styles.loyaltyCardInner}>
                  <Ionicons name="sparkles" size={22} color={C.accent} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: C.text, fontFamily: FONTS.bold }}>
                      {points.toLocaleString()} Points · {rewardTier.name} {rewardTier.emoji}
                    </Text>
                    <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: FONTS.regular }}>
                      {pointsToGold > 0 ? `${pointsToGold} pts to Gold` : 'Gold member benefits unlocked'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
                </Pressable>
              </GlassCard>
            </View>
            {[
              { icon: 'heart-outline' as const, label: 'My Favourites', action: () => go('favorites') },
              { icon: 'gift-outline' as const, label: 'Rewards', action: () => go('rewards') },
              { icon: 'receipt-outline' as const, label: 'Order History', action: () => go('orders') },
              { icon: 'location-outline' as const, label: 'Branch', action: () => setScreen('branch') },
              {
                icon: 'help-circle-outline' as const,
                label: 'Help',
                action: () => showToast('Support: help@kafeeman.my · 9am–9pm', 'info'),
              },
              {
                icon: 'log-out-outline' as const,
                label: 'Log Out',
                action: () => {
                  Alert.alert('Log out?', 'You will need to sign in again to place orders.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Log Out',
                      style: 'destructive',
                      onPress: () => {
                        void hapticWarning();
                        setScreen('auth');
                      },
                    },
                  ]);
                },
              },
            ].map((item) => (
              <GlassCard key={item.label} level="sheet" style={{ marginHorizontal: 20, marginBottom: 10 }}>
                <Pressable onPress={item.action} style={styles.menuRowInner}>
                  <Ionicons name={item.icon} size={22} color={C.primary} />
                  <Text style={{ color: C.text, flex: 1, marginLeft: 12, fontWeight: '600' }}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
                </Pressable>
              </GlassCard>
            ))}
          </ScrollView>
        );

      case 'rewards':
        return (
          <RewardsScreen
            C={C}
            points={points}
            history={pointsHistory}
            onBack={() => go('profile')}
            onRedeem={(rewardId, cost, title) => {
              if (cost > 0 && points < cost) {
                void hapticWarning();
                showToast(`Need ${cost - points} more points`, 'error');
                return false;
              }
              if (cost > 0) {
                setPoints((p) => p - cost);
                setPointsHistory((prev) => [
                  { id: `r-${rewardId}-${Date.now()}`, label: `Redeemed ${title}`, delta: -cost, date: 'Today' },
                  ...prev,
                ]);
              }
              void hapticSuccess();
              showToast(`Redeemed ${title}`, 'success');
              return true;
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: showLiquidBg ? 'transparent' : C.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <LiquidGlassBackground style={[styles.flex, !showLiquidBg && { backgroundColor: C.bg }]}>
        {showTopBar && <StitchTopBar C={C} onAvatarPress={() => go('profile')} />}
        <View style={styles.flex}>{renderScreen()}</View>
        {showFloatingCart && <StitchFloatingCart C={C} count={cartCount} onPress={() => go('cart')} />}
        {showNav && (
          <StitchBottomNav
            C={C}
            tab={tab}
            cartCount={cartCount}
            onTab={(k) => {
              void hapticSelection();
              go(TAB_SCREENS[k as TabKey]);
            }}
          />
        )}
      </LiquidGlassBackground>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <KafeemanApp />
    </ToastProvider>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1 },
    center: { alignItems: 'center', justifyContent: 'center' },
    padH: { paddingHorizontal: 24 },
    splash: { flex: 1 },
    splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
    splashLogo: {
      width: 100,
      height: 100,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    splashTitle: { fontSize: 36, fontWeight: '800', fontFamily: FONTS.display, color: C.text, marginBottom: 8 },
    splashSub: { fontSize: 12, letterSpacing: 3, fontFamily: FONTS.semiBold, color: C.primary, textTransform: 'uppercase', marginBottom: 40 },
    progressTrack: { width: 96, height: 3, borderRadius: 2, backgroundColor: `${C.primary}22`, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
    onboardHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, paddingTop: 8 },
    skipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder },
    onboardScroll: { flexGrow: 1, paddingBottom: 8 },
    onboardImage: { marginHorizontal: 20, borderRadius: 28, width: undefined },
    onboardBody: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 8 },
    onboardFooter: { paddingHorizontal: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.glassBorder, backgroundColor: C.bg },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 8 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: `${C.primary}35` },
    dotActive: { width: 28, backgroundColor: C.primary },
    authHeroFade: { position: 'absolute', left: 0, right: 0 },
    authScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
    authGlassPanel: {
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      overflow: 'hidden',
    },
    authPanelInner: { padding: 24, paddingBottom: 28, alignItems: 'center', width: '100%' },
    authButtonStack: { gap: 12, width: '100%', marginTop: 16 },
    authHeadline: {
      fontFamily: FONTS.display,
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 8,
    },
    stitchGreeting: {
      fontFamily: FONTS.display,
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.3,
      marginBottom: 16,
    },
    stitchSearch: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 16,
      height: 56,
      gap: 12,
    },
    stitchSearchInput: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: 16,
    },
    screenTitle: { fontSize: 28, fontWeight: '800', fontFamily: FONTS.display, color: C.text, marginBottom: 8 },
    screenTitleSm: { fontSize: 22, fontWeight: '800', fontFamily: FONTS.display, color: C.text },
    headerTitle: { fontSize: 20, fontWeight: '800', fontFamily: FONTS.display, color: C.text },
    bodyText: { fontSize: 14, fontFamily: FONTS.regular, color: C.textMuted, lineHeight: 20 },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 8 },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    input: {
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.inputBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: C.text,
      fontSize: 14,
      fontFamily: FONTS.regular,
    },
    primaryBtn: {
      backgroundColor: C.primaryContainer,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
    },
    primaryBtnText: { color: C.onPrimary, fontWeight: '800', fontSize: 14 },
    ghostBtn: {
      backgroundColor: C.surfaceLowest,
      borderWidth: 2,
      borderColor: C.outline,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
    },
    otpIcon: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor: `${C.primary}18`,
      borderWidth: 1,
      borderColor: `${C.primary}35`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    otpBox: {
      width: 46,
      height: 56,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: C.glassBorder,
      backgroundColor: C.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: `${C.primary}18`,
      borderWidth: 2,
      borderColor: `${C.primary}45`,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 16,
      overflow: 'hidden',
    },
    profileAvatar: { width: 96, height: 96, borderRadius: 48 },
    loyaltyCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    branchCard: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    branchImage: { width: '100%', height: 100 },
    branchBody: { padding: 16 },
    branchName: { color: C.text, fontWeight: '800', fontSize: 16, marginBottom: 4 },
    orderTypeCard: { borderRadius: 28, padding: 24, marginBottom: 16, overflow: 'hidden', minHeight: 140 },
    orderTypeEmoji: { fontSize: 32, marginBottom: 8 },
    orderTypeTitle: { color: '#fff', fontSize: 24, fontWeight: '900', fontFamily: FONTS.display },
    orderTypeSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 },
    homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    avatarSmall: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${C.primary}22`,
      borderWidth: 1.5,
      borderColor: `${C.primary}45`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.inputBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginTop: 12,
    },
    promoCard: { height: 128, borderRadius: 22, overflow: 'hidden' },
    promoOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: 16,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    promoTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
    promoSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    rewardsCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reorderCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuRowInner: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cartLineInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    splashLogoGlass: {
      borderRadius: 36,
      padding: 4,
      marginBottom: 20,
      overflow: 'hidden',
    },
    promoDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    promoDot: { width: 8, height: 8, borderRadius: 4 },
    offerChip: { minWidth: 110, marginRight: 10 },
    offerTag: { fontFamily: FONTS.bold, fontSize: 11, marginBottom: 4 },
    offerTitle: { fontFamily: FONTS.semiBold, fontSize: 13 },
    reorderCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      marginTop: 8,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', fontFamily: FONTS.bold, color: C.text },
    featuredCard: { width: 148, borderRadius: 20, overflow: 'hidden', backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, paddingBottom: 10 },
    featuredImage: { width: '100%', height: 120 },
    itemBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: C.primaryContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    itemBadgeText: { color: C.onPrimary, fontSize: 10, fontWeight: '800' },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 18,
      marginBottom: 10,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    listThumb: { width: 60, height: 60, borderRadius: 14 },
    addBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: C.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnSm: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: C.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: C.surfaceLow,
      borderWidth: 1,
      borderColor: C.outlineVariant,
    },
    chipActive: { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    menuChipRow: { paddingVertical: 12, alignItems: 'center' },
    menuCard: {
      width: '47%',
      borderRadius: 22,
      overflow: 'hidden',
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    menuImage: { width: '100%', height: 136 },
    menuFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, paddingTop: 0 },
    detailHeroWrap: { position: 'relative', width: '100%', height: 380 },
    detailHero: { width: '100%', height: '100%' },
    detailHeroGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 120,
    },
    detailBackGlass: {
      position: 'absolute',
      top: 16,
      left: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailFavGlass: {
      position: 'absolute',
      top: 16,
      right: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 12,
    },
    detailTitle: {
      fontFamily: FONTS.display,
      fontSize: 28,
      flex: 1,
    },
    detailPrice: {
      fontFamily: FONTS.display,
      fontSize: 24,
    },
    customGlassCard: {
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      marginBottom: 16,
    },
    customLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 12,
      opacity: 0.8,
    },
    detailFooterGlass: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 24,
      paddingBottom: 32,
      backgroundColor: 'transparent',
    },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    optionActive: { backgroundColor: C.accent, borderColor: C.accent },
    detailFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 28,
      backgroundColor: C.bg,
      borderTopWidth: 1,
      borderTopColor: C.glassBorder,
    },
    empty: { alignItems: 'center', paddingVertical: 48 },
    cartLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 20,
      marginBottom: 12,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryCard: {
      padding: 16,
      borderRadius: 20,
      marginTop: 12,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    stickyFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 28,
      backgroundColor: C.bg,
      borderTopWidth: 1,
      borderTopColor: C.glassBorder,
    },
    typeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: `${C.primary}15`,
      marginBottom: 16,
    },
    payRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.glassBorder },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.glassBorder },
    radioOn: { borderColor: C.primary, backgroundColor: C.primary },
    pinPad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
    pinKey: {
      width: 72,
      height: 56,
      borderRadius: 16,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapPlaceholder: {
      height: 180,
      borderRadius: 22,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    trackStep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    trackDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.glassBorder },
    trackDotActive: { width: 18, height: 18, borderRadius: 9 },
    tabRow: { flexDirection: 'row', gap: 8, marginVertical: 16 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder },
    tabBtnActive: { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer },
    orderCard: {
      padding: 16,
      borderRadius: 20,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
      marginBottom: 12,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 18,
      marginBottom: 10,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.glassBorder,
    },
    rewardsHero: {
      borderRadius: 28,
      padding: 24,
      backgroundColor: C.primaryDark,
      overflow: 'hidden',
    },
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 12,
      paddingBottom: 24,
      backgroundColor: C.navBg,
      borderTopWidth: 1,
      borderTopColor: C.glassBorder,
    },
    navItem: { alignItems: 'center', gap: 4 },
    navLabel: { fontSize: 10, fontWeight: '600' },
    badge: {
      position: 'absolute',
      top: -6,
      right: -8,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    badgeText: { color: C.onPrimary, fontSize: 9, fontWeight: '900' },
    successIcon: { marginBottom: 4 },
  });
}
