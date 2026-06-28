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
  NOTIFICATIONS_SEED,
  POINTS_HISTORY_SEED,
  PROMOS,
  REWARD_TIERS,
} from './data';
import { LOGO_GREEN, LOGO_GREEN_DARK, LOGO_GREEN_LIGHT } from './brand';
import { calcPromoDiscount, findPromo, maxRedeemablePoints, pointsForSpend, pointsToRmDiscount, POINTS_PER_RM, type PromoCode } from './lib/promos';
import { hapticLight, hapticMedium, hapticSelection, hapticSuccess, hapticWarning } from './lib/haptics';
import {
  DEFAULT_ADDRESSES,
  DEFAULT_PROFILE,
  loadAppState,
  saveAppState,
} from './lib/storage';
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
  AccountMenu,
  AppBottomNav,
  AppPickupHeader,
  LiveDeliveryBanner,
  LoyaltyHeroCard,
  MenuListRow,
  OrderNowFab,
  OrderTypeChoiceCard,
  SectionHeading,
  StoreInfoBanner,
} from './native/appShell';
import {
  StitchEmptyState,
  ScreenHeader,
  StitchStoreBar,
  TabScreenHeader,
} from './native/screenChrome';
import {
  GlassSurface,
  GlassCard,
  GlassInputField,
  GlassSearchBar,
  LiquidGlassBackground,
  PROFILE_AVATAR,
  STITCH_AUTH_HERO,
  StitchCategoryChip,
  StitchFeaturedCard,
  StitchFloatingCart,
  StitchOptionPill,
  StitchPillButton,
  StitchPromoBanner,
  StitchStickyFooter,
  GradientButton,
} from './native/stitchUi';
import { OrderNoteField, PointsRedeemSection } from './native/cartExtras';
import { AddressesScreen } from './native/addressesScreen';
import { HelpScreen } from './native/helpScreen';
import { NotificationsScreen } from './native/notificationsScreen';
import { OrderReceiptScreen } from './native/orderReceiptScreen';
import { PickupOrderScreen } from './native/pickupOrderScreen';
import { OrdersScreen, type OrderFilterTab } from './native/ordersScreen';
import { RewardsScreen } from './native/rewardsScreen';
import { FavoritesScreen } from './native/favoritesScreen';
import { DeliveryTrackingScreen } from './native/orderTracking';
import { OnboardingSlideIconView } from './native/onboardingIcons';
import { SplashScreen } from './native/splashScreen';
import { AppImage } from './native/ui';
import { floatingChromeBottom, scrollPaddingAboveChrome } from './native/layoutChrome';
import { AppleSignInButton } from './auth/AppleSignInButton';
import { ClerkProfileSync } from './auth/ClerkProfileSync';
import { isClerkEnabled } from './auth/clerkConfig';
import { ConvexConnectionCheck } from './convex/useConvexConnection';
import { ConvexUserSync } from './convex/useConvexUserSync';
import { isConvexEnabled } from './convex/ConvexClientProvider';
import { STITCH_SHADOW, useBrandTheme, type ThemeColors } from './theme';
import type {
  AppNotification,
  CartLine,
  MenuItem,
  OrderRecord,
  PointsActivity,
  SavedAddress,
  Screen,
  TabKey,
  UserProfile,
} from './types';

const FLOATING_CART_SCREENS: Screen[] = ['home', 'menu', 'product-detail', 'favorites'];

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
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
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
  const [orderTab, setOrderTab] = useState<OrderFilterTab>('All');
  const [payMethod, setPayMethod] = useState<PaymentMethodId>('tng');
  const [orderRef, setOrderRef] = useState(() => generateOrderRef());
  const [tngPhase, setTngPhase] = useState<TngPayPhase>('pin');
  const [paidAmount, setPaidAmount] = useState(0);
  const [promoIdx, setPromoIdx] = useState(0);
  const [trackingStep, setTrackingStep] = useState(0);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [orderTypeReturn, setOrderTypeReturn] = useState<Screen>('home');
  const [selectedBranch, setSelectedBranch] = useState<string>(BRANCHES[2].name);
  const [sugar, setSugar] = useState('50%');
  const [ice, setIce] = useState('Full Ice');
  const [tngPin, setTngPin] = useState<string[]>([]);
  const [orderNote, setOrderNote] = useState('');
  const [usePointsEnabled, setUsePointsEnabled] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [addresses, setAddresses] = useState<SavedAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('home');
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS_SEED);
  const [menuSearch, setMenuSearch] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null);
  const [addressReturn, setAddressReturn] = useState<Screen>('checkout');
  const splashNavPending = useRef(false);
  const trackingNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenRef = useRef<Screen>(screen);
  const ordersRef = useRef(orders);
  screenRef.current = screen;
  ordersRef.current = orders;
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? addresses[0],
    [addresses, selectedAddressId],
  );
  const firstName = profile.name.split(' ')[0] ?? profile.name;

  const handleClerkProfile = useCallback((next: UserProfile) => {
    setProfile(next);
  }, []);

  const handleClerkSignedIn = useCallback(() => {
    setIsLoggedIn(true);
    setOnboardingDone(true);
  }, []);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const cartTotal = cart.reduce((a, c) => a + c.item.price * c.qty, 0);
  const discountAmount = calcPromoDiscount(cartTotal, appliedPromo);
  const orderTotalBeforePoints = orderTotal(cartTotal, orderType === 'delivery', discountAmount, 0);
  const effectivePointsRedeem = usePointsEnabled ? pointsToRedeem : 0;
  const totalDue = orderTotal(cartTotal, orderType === 'delivery', discountAmount, effectivePointsRedeem);
  const menuFiltered = useMemo(() => {
    let items = category === 'All' ? MENU : MENU.filter((m) => m.category === category);
    if (menuSearch.trim()) {
      const q = menuSearch.trim().toLowerCase();
      items = items.filter(
        (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
      );
    }
    return items;
  }, [category, menuSearch]);
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MENU.filter(
      (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);
  const favoriteItems = useMemo(() => MENU.filter((m) => favorites.includes(m.id)), [favorites]);
  const rewardTier = REWARD_TIERS.find((t) => points >= t.min && points <= t.max) ?? REWARD_TIERS[0];
  const pointsToGold =
    rewardTier.name === 'Gold'
      ? 0
      : Math.max(0, (REWARD_TIERS[REWARD_TIERS.indexOf(rewardTier) + 1]?.min ?? 1500) - points);
  const showNav = ['home', 'menu', 'cart', 'orders', 'profile', 'order-type'].includes(screen);
  const showPickupHeader = screen === 'home' || screen === 'menu';
  const showOrderNowFab = screen === 'home' && cartCount === 0;
  const viewingOrder = useMemo(() => {
    const id = activeOrderId ?? orderRef;
    const found = orders.find((o) => o.id === id);
    if (!found) return null;
    if (found.status !== 'active') return found;
    return { ...found, trackingStep: Math.max(found.trackingStep, trackingStep) };
  }, [orders, activeOrderId, orderRef, trackingStep]);
  const activeDeliveryOrder = useMemo(
    () => orders.find((o) => o.status === 'active' && o.orderType === 'delivery') ?? null,
    [orders],
  );
  const isDeliveryTracking = screen === 'order-tracking' && viewingOrder?.orderType === 'delivery';
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const showFloatingCart = cartCount > 0 && FLOATING_CART_SCREENS.includes(screen);
  const floatingCartBottom = showNav
    ? floatingChromeBottom(insets)
    : insets.bottom + 24;
  const floatingBarBottom = showNav ? floatingChromeBottom(insets) : insets.bottom + 24;
  const listBottomPadding = scrollPaddingAboveChrome(insets, {
    hasNav: showNav,
    hasFloatingBar: showFloatingCart || showOrderNowFab,
  });

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

  const openOrderType = useCallback((from: Screen) => {
    setOrderTypeReturn(from);
    setScreen('order-type');
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
      const redeemed = effectivePointsRedeem;
      const earned = pointsForSpend(total);
      const trimmedNote = orderNote.trim();
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
        pointsRedeemed: redeemed > 0 ? redeemed : undefined,
        orderNote: trimmedNote || undefined,
      };
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderRef)]);
      if (redeemed > 0) {
        setPoints((p) => p - redeemed + earned);
        setPointsHistory((prev) => [
          { id: `p-${orderRef}`, label: `Order ${orderRef}`, delta: earned, date: 'Today' },
          { id: `pr-${orderRef}`, label: `Points used on ${orderRef}`, delta: -redeemed, date: 'Today' },
          ...prev,
        ]);
      } else {
        setPoints((p) => p + earned);
        setPointsHistory((prev) => [
          { id: `p-${orderRef}`, label: `Order ${orderRef}`, delta: earned, date: 'Today' },
          ...prev,
        ]);
      }
      setActiveOrderId(orderRef);
      setTrackingStep(0);
      setPaidAmount(total);
      setCart([]);
      setOrderNote('');
      setUsePointsEnabled(false);
      setPointsToRedeem(0);
      setAppliedPromo(null);
      setPromoCode('');
      setPromoMessage('');
      void hapticSuccess();
      setNotifications((prev) => [
        {
          id: `n-order-${orderRef}`,
          title: 'Order confirmed',
          body: `We're preparing ${orderRef}. ${orderType === 'delivery' ? 'Track delivery live.' : 'Pick up at the branch.'}`,
          time: 'Just now',
          read: false,
          type: 'order',
          orderId: orderRef,
        },
        ...prev,
      ]);
      showToast(`Order ${orderRef} confirmed`, 'success', {
        label: orderType === 'delivery' ? 'Track delivery' : 'View order',
        onPress: () => setScreen('order-tracking'),
      });
    },
    [
      cart,
      cartTotal,
      discountAmount,
      effectivePointsRedeem,
      orderNote,
      orderRef,
      orderType,
      payMethod,
      selectedBranch,
      showToast,
    ],
  );

  const trackOrder = useCallback((order: OrderRecord) => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      setReceiptOrder(order);
      setScreen('order-receipt');
      return;
    }
    if (trackingNavTimerRef.current) {
      clearTimeout(trackingNavTimerRef.current);
      trackingNavTimerRef.current = null;
    }
    const sameOrder = order.id === activeOrderId || order.id === orderRef;
    if (sameOrder && screenRef.current === 'order-tracking') {
      return;
    }
    setOrderRef(order.id);
    setTrackingStep((prev) => (sameOrder ? Math.max(prev, order.trackingStep) : order.trackingStep));
    setOrderType(order.orderType);
    setSelectedBranch(order.branch);
    setActiveOrderId(order.id);
    setScreen('order-tracking');
  }, [activeOrderId, orderRef]);

  const cancelOrder = useCallback(
    (orderId: string) => {
      Alert.alert('Cancel order?', 'You can only cancel while your order is still being prepared.', [
        { text: 'Keep order', style: 'cancel' },
        {
          text: 'Cancel order',
          style: 'destructive',
          onPress: () => {
            const order = orders.find((o) => o.id === orderId);
            if (!order) return;
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' as const } : o)),
            );
            if (order.pointsRedeemed) {
              setPoints((p) => p + order.pointsRedeemed!);
              setPointsHistory((prev) => [
                {
                  id: `refund-${orderId}`,
                  label: `Points refunded — ${orderId}`,
                  delta: order.pointsRedeemed!,
                  date: 'Today',
                },
                ...prev,
              ]);
            }
            setNotifications((prev) => [
              {
                id: `n-cancel-${Date.now()}`,
                title: 'Order cancelled',
                body: `Order ${orderId} was cancelled successfully.`,
                time: 'Just now',
                read: false,
                type: 'order',
                orderId,
              },
              ...prev,
            ]);
            void hapticWarning();
            showToast('Order cancelled', 'info');
            go('orders');
          },
        },
      ]);
    },
    [orders, showToast, go],
  );

  const navigateFromSplash = useCallback(() => {
    if (onboardingDone) {
      setScreen(isLoggedIn ? 'home' : 'auth');
    } else {
      setScreen('onboarding');
    }
  }, [isLoggedIn, onboardingDone]);

  const reorder = useCallback(
    (order: OrderRecord) => {
      setCart(order.items.map((line) => ({ ...line, item: { ...line.item } })));
      void hapticMedium();
      showToast('Items added to cart', 'success');
      go('cart');
    },
    [go, showToast],
  );

  const startTracking = useCallback(() => {
    if (trackingNavTimerRef.current) {
      clearTimeout(trackingNavTimerRef.current);
      trackingNavTimerRef.current = null;
    }
    const active = ordersRef.current.find(
      (o) => o.id === (activeOrderId ?? orderRef) && o.status === 'active',
    );
    if (active) {
      trackOrder(active);
      return;
    }
    setTrackingStep(0);
    setScreen('order-tracking');
  }, [activeOrderId, orderRef, trackOrder]);

  const queueAutoTracking = useCallback(
    (delayMs: number) => {
      if (trackingNavTimerRef.current) clearTimeout(trackingNavTimerRef.current);
      trackingNavTimerRef.current = setTimeout(() => {
        trackingNavTimerRef.current = null;
        if (screenRef.current === 'order-success') startTracking();
      }, delayMs);
    },
    [startTracking],
  );

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
    queueAutoTracking(2200);
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
        setPaidAmount(totalDue);
        completeOrder(totalDue);
        setScreen('order-success');
        queueAutoTracking(2200);
      }, 1400);
    }, 1800);
  };

  useEffect(() => {
    const t = setInterval(() => setPromoIdx((i) => (i + 1) % PROMOS.length), 3800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    void loadAppState().then((saved) => {
      if (saved?.onboardingDone) setOnboardingDone(true);
      if (saved?.isLoggedIn) setIsLoggedIn(true);
      if (saved?.profile) setProfile(saved.profile);
      if (saved?.cart) setCart(saved.cart);
      if (saved?.favorites) setFavorites(saved.favorites);
      if (saved?.orders) setOrders(saved.orders);
      if (typeof saved?.points === 'number') setPoints(saved.points);
      if (saved?.pointsHistory) setPointsHistory(saved.pointsHistory);
      if (saved?.selectedBranch) setSelectedBranch(saved.selectedBranch);
      if (saved?.orderType) setOrderType(saved.orderType);
      if (saved?.addresses) setAddresses(saved.addresses);
      if (saved?.selectedAddressId) setSelectedAddressId(saved.selectedAddressId);
      if (saved?.notifications) setNotifications(saved.notifications);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      void saveAppState({
        version: 1,
        onboardingDone,
        isLoggedIn,
        profile,
        cart,
        favorites,
        orders,
        points,
        pointsHistory,
        selectedBranch,
        orderType,
        addresses,
        selectedAddressId,
        notifications,
      });
    }, 400);
    return () => clearTimeout(t);
  }, [
    hydrated,
    onboardingDone,
    isLoggedIn,
    profile,
    cart,
    favorites,
    orders,
    points,
    pointsHistory,
    selectedBranch,
    orderType,
    addresses,
    selectedAddressId,
    notifications,
  ]);

  useEffect(() => {
    if (!hydrated || !splashNavPending.current) return;
    splashNavPending.current = false;
    navigateFromSplash();
  }, [hydrated, navigateFromSplash]);

  useEffect(() => {
    if (screen !== 'order-tracking') return;
    const orderId = activeOrderId ?? orderRef;
    const order = ordersRef.current.find((o) => o.id === orderId);
    if (!order || order.status !== 'active') return;
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
    const delayMs = trackingStep === 2 ? 18000 : 8000;
    const t = setTimeout(() => {
      const next = trackingStep + 1;
      setTrackingStep(next);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === (activeOrderId ?? orderRef) ? { ...o, trackingStep: next } : o,
        ),
      );
    }, delayMs);
    return () => clearTimeout(t);
  }, [screen, trackingStep, activeOrderId, orderRef]);

  useEffect(
    () => () => {
      if (trackingNavTimerRef.current) clearTimeout(trackingNavTimerRef.current);
    },
    [],
  );

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
          <SplashScreen
            C={C}
            onComplete={() => {
              if (hydrated) navigateFromSplash();
              else splashNavPending.current = true;
            }}
          />
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
                <Pressable onPress={() => { setOnboardingDone(true); setScreen('auth'); }} style={styles.skipBtn}>
                  <Text style={styles.skipBtnText}>Skip</Text>
                </Pressable>
              </View>
              <View style={[styles.onboardImageWrap, STITCH_SHADOW, { marginHorizontal: 24 }]}>
                <AppImage uri={s.img} style={[styles.onboardImage, { height: onboardImageHeight }]} />
              </View>
              <View style={styles.onboardBody}>
                <View style={styles.onboardIconRow}>
                  {s.icons.map((item, i) => (
                    <View key={i} style={styles.onboardIconItem}>
                      <View style={styles.onboardIconBadge}>
                        <OnboardingSlideIconView item={item} color={C.primaryContainer} size={26} />
                      </View>
                      {item.label ? <Text style={styles.onboardIconLabel}>{item.label}</Text> : null}
                    </View>
                  ))}
                </View>
                <Text style={styles.onboardTitle}>{s.title}</Text>
                <Text style={styles.onboardSub}>{s.sub}</Text>
              </View>
              <View style={styles.dots}>
                {ONBOARDING_SLIDES.map((_, i) => (
                  <Pressable key={i} onPress={() => setSlide(i)} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
                  <View style={[styles.dot, i === slide && styles.dotActive]} />
                </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={[styles.onboardFooter, { paddingBottom: insets.bottom + 16 }]}>
              {slide < 2 ? (
                <StitchPillButton label="Next" icon="arrow-forward" onPress={() => setSlide(slide + 1)} C={C} />
              ) : (
                <StitchPillButton
                  label="Get Started"
                  onPress={() => {
                    setOnboardingDone(true);
                    setScreen('auth');
                  }}
                  C={C}
                />
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
                        setIsLoggedIn(true);
                        setOnboardingDone(true);
                        showToast(`Welcome back, ${firstName}!`, 'success');
                        setScreen('branch');
                      }}
                      C={C}
                      variant="outline"
                    />
                    <AppleSignInButton
                      C={C}
                      onFallback={() => setScreen('signup')}
                      onSuccess={() => {
                        setIsLoggedIn(true);
                        setOnboardingDone(true);
                        showToast('Welcome to Kafe Eman!', 'success');
                        setScreen('branch');
                      }}
                      onError={(message) => showToast(message, 'error')}
                    />
                  </View>
                  <Pressable
                    onPress={() => {
                      void hapticLight();
                      setIsLoggedIn(true);
                      setOnboardingDone(true);
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
          <ScrollView contentContainerStyle={[styles.padH, { paddingBottom: 40 }]} keyboardShouldPersistTaps="handled">
            <ScreenHeader C={C} title="Create Account" onBack={() => setScreen('auth')} />
            <GlassInputField
              C={C}
              label="Full Name"
              value={signupName}
              onChangeText={setSignupName}
              placeholder="Ahmad Eman"
              autoCapitalize="words"
            />
            <GlassInputField
              C={C}
              label="Email"
              value={signupEmail}
              onChangeText={setSignupEmail}
              placeholder="ahmad@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <GlassInputField
              C={C}
              label="Password"
              value={signupPassword}
              onChangeText={setSignupPassword}
              placeholder="••••••••"
              secureTextEntry={!showPw}
            />
            <GlassInputField
              C={C}
              label="Confirm Password"
              value={signupConfirmPassword}
              onChangeText={setSignupConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showPw}
            />
            <StitchPillButton
              label={showPw ? 'Hide password' : 'Show password'}
              onPress={() => setShowPw(!showPw)}
              C={C}
              variant="outline"
            />
            <View style={{ height: 16 }} />
            <StitchPillButton label="Continue" onPress={() => setScreen('otp')} C={C} />
          </ScrollView>
        );

      case 'otp':
        return (
          <View style={[styles.padH, { flex: 1, paddingBottom: 24 }]}>
            <ScreenHeader C={C} title="Verify Phone" onBack={() => setScreen('signup')} />
            <GlassCard level="sheet" style={styles.otpHeroCard}>
              <View style={[styles.otpIcon, { backgroundColor: C.secondaryContainer }]}>
                <Ionicons name="call-outline" size={26} color={C.primaryContainer} />
              </View>
              <Text style={[styles.screenTitleSm, { textAlign: 'center' }]}>Enter OTP Code</Text>
              <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 8 }]}>
                We sent a 6-digit code to +60 12-345 6789
              </Text>
            </GlassCard>
            <View style={styles.otpRow}>
              {otp.map((d, i) => (
                <GlassSurface key={i} level="inset" style={[styles.otpBoxGlass, d ? styles.otpBoxFilled : null]}>
                  <TextInput
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
                    style={[styles.otpInput, { color: C.text }]}
                  />
                </GlassSurface>
              ))}
            </View>
            <StitchPillButton label="Verify" onPress={() => setScreen('profile-setup')} C={C} />
          </View>
        );

      case 'profile-setup':
        return (
          <ScrollView contentContainerStyle={[styles.padH, { paddingBottom: 40 }]} keyboardShouldPersistTaps="handled">
            <Text style={[styles.screenTitle, { marginTop: 8 }]}>Set Up Profile</Text>
            <Text style={[styles.bodyText, { marginBottom: 24 }]}>Tell us a little about yourself</Text>
            <GlassCard level="sheet" style={styles.profileAvatarCard}>
              <View style={[styles.avatarWrap, { backgroundColor: C.secondaryContainer, borderColor: C.glassBorderStrong }]}>
                <Ionicons name="person-outline" size={36} color={C.primaryContainer} />
              </View>
            </GlassCard>
            <GlassInputField
              C={C}
              label="Full name"
              value={setupName}
              onChangeText={setSetupName}
              placeholder="Ahmad Eman"
              autoCapitalize="words"
            />
            <GlassInputField
              C={C}
              label="Email"
              value={setupEmail}
              onChangeText={setSetupEmail}
              placeholder="ahmad@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <StitchPillButton
              label="Continue"
              onPress={() => {
                if (setupName.trim()) {
                  setProfile({ name: setupName.trim(), email: setupEmail.trim() || DEFAULT_PROFILE.email });
                }
                setIsLoggedIn(true);
                setOnboardingDone(true);
                setScreen('branch');
              }}
              C={C}
            />
          </ScrollView>
        );

      case 'branch':
        return (
          <ScrollView contentContainerStyle={[styles.padH, { paddingBottom: 40 }]}>
            <View style={styles.branchHeader}>
              <View style={[styles.branchHeaderIcon, { backgroundColor: C.secondaryContainer }]}>
                <Ionicons name="location-outline" size={22} color={C.primaryContainer} />
              </View>
              <Text style={styles.screenTitle}>Select Branch</Text>
              <Text style={[styles.bodyText, { textAlign: 'center' }]}>Choose your nearest Kafe Eman</Text>
            </View>
            {BRANCHES.map((b) => {
              const selected = selectedBranch === b.name;
              return (
                <Pressable
                  key={b.name}
                  onPress={() => {
                    setSelectedBranch(b.name);
                    setOnboardingDone(true);
                    setIsLoggedIn(true);
                    openOrderType('branch');
                  }}
                  style={({ pressed }) => [{ marginBottom: 12, opacity: pressed ? 0.94 : 1 }]}
                >
                  <GlassCard
                    level="sheet"
                    noPadding
                    style={selected ? { borderWidth: 2, borderColor: C.primaryContainer } : undefined}
                  >
                    <AppImage uri={b.img} style={styles.branchImage} />
                    <View style={styles.branchBody}>
                      <Text style={styles.branchName}>{b.name}</Text>
                      <Text style={styles.bodyText}>{b.addr}</Text>
                      <View style={styles.branchEtaRow}>
                        <Ionicons name="time-outline" size={13} color={C.primaryContainer} />
                        <Text style={[styles.branchEta, { color: C.primaryContainer }]}>{b.time}</Text>
                      </View>
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </ScrollView>
        );

      case 'order-type':
        return (
          <ScrollView
            style={{ backgroundColor: 'transparent' }}
            contentContainerStyle={[styles.padH, styles.orderTypeScreen]}
            showsVerticalScrollIndicator={false}
          >
            <ScreenHeader
              C={C}
              title="How would you like it?"
              subtitle="You can change this anytime"
              onBack={() => setScreen(orderTypeReturn)}
            />
            <View style={styles.orderTypeBranchRow}>
              <Ionicons name="location-outline" size={15} color={C.primaryContainer} />
              <Text style={[styles.orderTypeBranchText, { color: C.textMuted }]}>{selectedBranch}</Text>
            </View>
            <OrderTypeChoiceCard
              icon="bicycle-outline"
              title="Delivery"
              subtitle="30–45 min to your door"
              gradientColors={[LOGO_GREEN, LOGO_GREEN_DARK]}
              onPress={() => {
                setOrderType('delivery');
                go('home');
              }}
            />
            <OrderTypeChoiceCard
              icon="bag-handle-outline"
              title="Pickup"
              subtitle="Ready in 5–10 min"
              gradientColors={[LOGO_GREEN_LIGHT, LOGO_GREEN, LOGO_GREEN_DARK]}
              onPress={() => {
                setOrderType('pickup');
                go('home');
              }}
            />
            <Pressable onPress={() => go('home')} style={styles.orderTypeSkip}>
              <Text style={[styles.orderTypeSkipText, { color: C.primaryContainer }]}>Continue to home</Text>
            </Pressable>
          </ScrollView>
        );

      case 'home':
        return (
          <ScrollView
            style={{ backgroundColor: 'transparent' }}
            contentContainerStyle={{ paddingBottom: listBottomPadding, paddingTop: 20 }}
          >
            <View style={styles.padH}>
              <LoyaltyHeroCard
                C={C}
                name={profile.name}
                points={points}
                subtitle={
                  pointsToGold > 0
                    ? `Unlock rewards — ${pointsToGold} pts to Gold`
                    : 'Unlock rewards with your points'
                }
                onPress={() => go('rewards')}
              />
              {activeDeliveryOrder ? (
                <LiveDeliveryBanner
                  C={C}
                  orderId={activeDeliveryOrder.id}
                  branch={activeDeliveryOrder.branch}
                  etaLabel={
                    activeDeliveryOrder.trackingStep >= 3
                      ? 'Arrived'
                      : activeDeliveryOrder.trackingStep >= 2
                        ? 'On the way'
                        : 'Preparing'
                  }
                  onPress={() => trackOrder(activeDeliveryOrder)}
                />
              ) : null}
              <View style={{ marginBottom: 16 }}>
                <GlassSearchBar
                  C={C}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for your favorite brew..."
                  onClear={() => setSearchQuery('')}
                />
              </View>
            </View>
            <View style={[styles.padH, { marginBottom: 20 }]}>
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
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 24 }}
            >
              {HOME_OFFERS.map((offer) => (
                <Pressable
                  key={offer.id}
                  onPress={() => {
                    applyPromoFromCode(offer.code);
                    go('cart');
                  }}
                  style={[styles.offerChipClean, { backgroundColor: C.glassStrong, borderColor: C.glassBorderStrong }]}
                >
                  <Text style={[styles.offerTag, { color: C.primaryContainer }]}>{offer.tag}</Text>
                  <Text style={[styles.offerTitle, { color: C.text }]}>{offer.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {searchQuery.trim() ? (
              <View style={styles.padH}>
                <SectionHeading C={C} title={`Search results (${searchResults.length})`} />
                {searchResults.length === 0 ? (
                  <Text style={[styles.bodyText, { marginTop: 4 }]}>No drinks match your search.</Text>
                ) : (
                  searchResults.slice(0, 6).map((item) => (
                    <MenuListRow
                      key={item.id}
                      C={C}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      badge={item.badge}
                      onPress={() => openProductDetail(item, 'home')}
                      onAdd={() => addToCart(item)}
                    />
                  ))
                )}
              </View>
            ) : null}
            {favoriteItems.length > 0 && !searchQuery.trim() && (
              <View style={styles.padH}>
                <SectionHeading C={C} title="Your Favourites" actionLabel="View all" onAction={() => go('favorites')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
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
              </View>
            )}
            {!searchQuery.trim() && (
              <View style={[styles.padH, { marginTop: 24 }]}>
                <SectionHeading C={C} title="Featured Drinks" actionLabel="View all" onAction={() => go('menu')} />
                {MENU.slice(0, 4).map((item) => (
                  <MenuListRow
                    key={item.id}
                    C={C}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    badge={item.badge}
                    onPress={() => openProductDetail(item, 'home')}
                    onAdd={() => addToCart(item)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        );

      case 'menu':
        return (
          <View style={styles.flex}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={{ paddingBottom: listBottomPadding, paddingTop: 4 }}
              showsVerticalScrollIndicator={false}
              stickyHeaderIndices={[1]}
            >
              <View style={styles.padH}>
                <StoreInfoBanner
                  C={C}
                  branch={selectedBranch}
                  orderType={orderType}
                  onPress={() => setScreen('branch')}
                />
                <GlassSearchBar
                  C={C}
                  value={menuSearch}
                  onChangeText={setMenuSearch}
                  placeholder="Search menu…"
                  onClear={() => setMenuSearch('')}
                />
              </View>
              <View style={{ backgroundColor: 'transparent' }}>
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
              </View>
              <View style={styles.padH}>
                {menuFiltered.length === 0 ? (
                  <StitchEmptyState
                    C={C}
                    icon="search-outline"
                    title="No drinks found"
                    message="Try another category or search term."
                    actionLabel="Clear search"
                    onAction={() => setMenuSearch('')}
                  />
                ) : (
                  menuFiltered.map((item) => (
                    <MenuListRow
                      key={item.id}
                      C={C}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      badge={item.badge}
                      onPress={() => openProductDetail(item, 'menu')}
                      onAdd={() => addToCart(item)}
                    />
                  ))
                )}
              </View>
            </ScrollView>
          </View>
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
                  onPress={() => openOrderType('cart')}
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
                        <Text style={[styles.cartLineTitle, { color: C.text }]}>{c.item.name}</Text>
                        <Text style={[styles.cartLineMeta, { color: C.textFaint }]}>{c.sugar} · {c.ice}</Text>
                        <Text style={[styles.cartLinePrice, { color: C.primaryContainer }]}>
                          RM {(c.item.price * c.qty).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.qtyRow}>
                        <Pressable onPress={() => adjustQty(key, -1)} style={styles.qtyBtn}>
                          <Ionicons name="remove" size={14} color={C.text} />
                        </Pressable>
                        <Text style={[styles.cartQtyText, { color: C.text }]}>{c.qty}</Text>
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
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                    >
                      <GlassSurface level="inset" style={styles.applyPromoBtn}>
                        <Text style={[styles.applyPromoText, { color: C.primaryContainer }]}>Apply</Text>
                      </GlassSurface>
                    </Pressable>
                  </View>
                  {promoMessage ? (
                    <Text
                      style={{
                        color: appliedPromo ? C.success : C.error,
                        fontSize: 12,
                        marginTop: 6,
                        fontFamily: FONTS.semiBold,
                      }}
                    >
                      {promoMessage}
                    </Text>
                  ) : null}
                  <OrderNoteField C={C} value={orderNote} onChangeText={setOrderNote} />
                  <PointsRedeemSection
                    C={C}
                    balance={points}
                    enabled={usePointsEnabled}
                    pointsToRedeem={pointsToRedeem}
                    orderTotalBeforePoints={orderTotalBeforePoints}
                    onToggle={(on) => {
                      setUsePointsEnabled(on);
                      if (on) {
                        const max = maxRedeemablePoints(points, orderTotalBeforePoints);
                        const preset = ([100, 500, 1000] as const).find((p) => p <= max) ?? max;
                        setPointsToRedeem(
                          preset >= POINTS_PER_RM ? preset : max >= POINTS_PER_RM ? max : 0,
                        );
                      } else {
                        setPointsToRedeem(0);
                      }
                    }}
                    onSelectPoints={setPointsToRedeem}
                  />
                <GlassCard level="sheet" style={{ marginTop: 12 }}>
                  <View style={styles.summaryRow}>
                    <Text style={{ color: C.textMuted }}>Subtotal</Text>
                    <Text style={{ color: C.text }}>RM {cartTotal.toFixed(2)}</Text>
                  </View>
                  {discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={{ color: C.textMuted }}>Discount ({appliedPromo?.code})</Text>
                      <Text style={{ color: C.success }}>- RM {discountAmount.toFixed(2)}</Text>
                    </View>
                  )}
                  {effectivePointsRedeem > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={{ color: C.textMuted }}>
                        Points ({effectivePointsRedeem.toLocaleString()} pts)
                      </Text>
                      <Text style={{ color: C.success }}>
                        - RM {pointsToRmDiscount(effectivePointsRedeem).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={{ color: C.textMuted }}>
                      {orderType === 'delivery' ? 'Delivery fee' : 'Pickup'}
                    </Text>
                    <Text style={{ color: orderType === 'delivery' ? C.text : C.success }}>
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
                {orderType === 'delivery' && selectedAddress && (
                  <Pressable
                    onPress={() => {
                      setAddressReturn('checkout');
                      setScreen('addresses');
                    }}
                    style={[styles.summaryCard, { marginBottom: 16 }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.label}>Deliver to</Text>
                      <Text style={{ color: C.primaryContainer, fontFamily: FONTS.semiBold, fontSize: 12 }}>
                        Change
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
                      <View style={[styles.otpIcon, { width: 36, height: 36, marginBottom: 0 }]}>
                        <Ionicons name="location" size={18} color={C.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontWeight: '700' }}>{selectedAddress.label}</Text>
                        <Text style={styles.bodyText}>{selectedAddress.line1}</Text>
                        {selectedAddress.line2 ? (
                          <Text style={styles.bodyText}>{selectedAddress.line2}</Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                )}
                <CheckoutSummary
                  C={C}
                  cart={cart}
                  cartTotal={cartTotal}
                  discountAmount={discountAmount}
                  pointsRedeemed={effectivePointsRedeem}
                  promoCode={appliedPromo?.code}
                  orderNote={orderNote}
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
            onPaymentComplete={() => {
              setPaidAmount(totalDue);
              completeOrder(totalDue);
              setScreen('order-success');
              queueAutoTracking(2200);
            }}
          />
        );

      case 'order-success': {
        const paidTotal = paidAmount || totalDue;
        const paymentLabel =
          payMethod === 'tng' ? PAYMENT_TNG : payMethod === 'card' ? 'Credit card' : 'Online banking';
        return (
          <ScrollView
            contentContainerStyle={[
              styles.center,
              styles.padH,
              { flexGrow: 1, paddingTop: 24, paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.successIcon, { backgroundColor: C.secondaryContainer }]}>
              <Ionicons name="checkmark-circle" size={64} color={C.success} />
            </View>
            <Text style={[styles.screenTitle, { textAlign: 'center', marginTop: 16 }]}>Congratulations!</Text>
            <Text style={[styles.successHeadline, { color: C.primaryContainer }]}>Payment successful</Text>
            <Text style={[styles.successThankYou, { color: C.text }]}>
              Thank you for your order. We&apos;re preparing it with care — please be patient while our team gets
              everything ready for you.
            </Text>
            <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 10 }]}>
              {formatRM(paidTotal)} paid via {paymentLabel}
            </Text>
            <GlassCard level="sheet" style={{ width: '100%', marginTop: 20 }}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: C.textMuted }]}>Order ID</Text>
                <Text style={[styles.summaryValue, { color: C.primaryContainer }]}>{orderRef}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: C.textMuted }]}>Branch</Text>
                <Text style={[styles.summaryValue, { color: C.text }]}>{selectedBranch}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: C.textMuted }]}>Payment</Text>
                <Text style={[styles.summaryValue, { color: C.success }]}>Successful</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: C.textMuted }]}>Order status</Text>
                <Text style={[styles.summaryValue, { color: C.success }]}>Confirmed</Text>
              </View>
              {pointsForSpend(paidTotal) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: C.textMuted }]}>Points earned</Text>
                  <Text style={[styles.summaryValue, { color: C.primaryContainer }]}>
                    +{pointsForSpend(paidTotal)} pts
                  </Text>
                </View>
              )}
            </GlassCard>
            <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 16 }]}>
              {orderType === 'delivery'
                ? 'Your rider will be assigned when your order is ready. Track delivery live below.'
                : 'We’ll notify you when your order is ready for pickup at the branch.'}
            </Text>
            <View style={{ height: 24, width: '100%' }} />
            <StitchPillButton
              label={orderType === 'delivery' ? 'Track delivery' : 'View pickup status'}
              onPress={startTracking}
              C={C}
            />
            <View style={{ height: 12, width: '100%' }} />
            <StitchPillButton label="Back to Home" onPress={() => go('home')} C={C} variant="outline" />
          </ScrollView>
        );
      }

      case 'order-tracking':
        if (!viewingOrder) {
          return (
            <View style={[styles.flex, styles.center, styles.padH]}>
              <Text style={styles.bodyText}>Order not found.</Text>
              <View style={{ height: 16, width: '100%' }} />
              <GhostBtn label="Back to Orders" onPress={() => go('orders')} />
            </View>
          );
        }
        if (viewingOrder.orderType === 'pickup') {
          return (
            <PickupOrderScreen
              C={C}
              order={viewingOrder}
              onBack={() => go('orders')}
              onDone={() => go('home')}
              onCancel={() => cancelOrder(viewingOrder.id)}
            />
          );
        }
        return (
            <DeliveryTrackingScreen
              C={C}
              order={viewingOrder}
              onBack={() => go('orders')}
              onDone={() => go('home')}
              onCancel={() => cancelOrder(viewingOrder.id)}
            />
        );

      case 'order-receipt':
        if (!receiptOrder) {
          return (
            <View style={[styles.flex, styles.center, styles.padH]}>
              <Text style={styles.bodyText}>Receipt not found.</Text>
              <View style={{ height: 16, width: '100%' }} />
              <GhostBtn label="Back to Orders" onPress={() => go('orders')} />
            </View>
          );
        }
        return (
          <OrderReceiptScreen
            C={C}
            order={receiptOrder}
            onBack={() => go('orders')}
            onReorder={() => reorder(receiptOrder)}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            C={C}
            notifications={notifications}
            onBack={() => go('home')}
            onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
            onOpenOrder={(orderId) => {
              const order = orders.find((o) => o.id === orderId);
              if (order) trackOrder(order);
            }}
          />
        );

      case 'help':
        return <HelpScreen C={C} onBack={() => go('profile')} />;

      case 'addresses':
        return (
          <AddressesScreen
            C={C}
            addresses={addresses}
            selectedId={selectedAddressId}
            onBack={() => setScreen(addressReturn)}
            onSelect={(id) => {
              setSelectedAddressId(id);
              setScreen(addressReturn);
            }}
          />
        );

      case 'orders':
        return (
          <View style={styles.flex}>
            <View style={[styles.ordersTitleWrap, { borderBottomColor: C.outlineVariant }]}>
              <Text style={[styles.ordersTitle, { color: C.text }]}>Orders</Text>
            </View>
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
          </View>
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
          <ScrollView
            style={{ backgroundColor: 'transparent' }}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
          >
            <View style={[styles.padH, styles.center]}>
              <View style={styles.avatarWrap}>
                <AppImage uri={PROFILE_AVATAR} style={styles.profileAvatar} />
              </View>
              <Text style={styles.screenTitleSm}>{profile.name}</Text>
              <Text style={styles.bodyText}>{profile.email}</Text>
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <AccountMenu
                C={C}
                sections={[
                  {
                    title: 'Account',
                    rows: [
                      { icon: 'person-outline', label: 'Personal Information', onPress: () => setScreen('profile-setup') },
                      { icon: 'location-outline', label: 'My Addresses', onPress: () => { setAddressReturn('profile'); setScreen('addresses'); } },
                      { icon: 'heart-outline', label: 'My Favourites', onPress: () => go('favorites') },
                      { icon: 'gift-outline', label: 'Rewards', onPress: () => go('rewards') },
                    ],
                  },
                  {
                    title: 'Orders',
                    rows: [
                      { icon: 'receipt-outline', label: 'Order History', onPress: () => go('orders') },
                      { icon: 'storefront-outline', label: 'Branch', onPress: () => setScreen('branch') },
                    ],
                  },
                  {
                    title: 'Support',
                    rows: [
                      { icon: 'help-circle-outline', label: 'Help Center', onPress: () => setScreen('help') },
                      { icon: 'notifications-outline', label: 'Notifications', onPress: () => setScreen('notifications') },
                    ],
                  },
                  {
                    title: 'Account actions',
                    rows: [
                      {
                        icon: 'log-out-outline',
                        label: 'Log Out',
                        destructive: true,
                        onPress: () => {
                          Alert.alert('Log out?', 'You will need to sign in again to place orders.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Log Out',
                              style: 'destructive',
                              onPress: () => {
                                void hapticWarning();
                                setIsLoggedIn(false);
                                setCart([]);
                                setScreen('auth');
                              },
                            },
                          ]);
                        },
                      },
                    ],
                  },
                ]}
              />
            </View>
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
              showToast(
                cost > 0 ? `Redeemed ${title} — show at pickup or use on your next order` : `Enjoy your ${title}!`,
                'success',
                cost > 0 ? { label: 'Order now', onPress: () => go('menu') } : undefined,
              );
              return true;
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: isDeliveryTracking ? C.surfaceLowest : 'transparent' }]}
      edges={showPickupHeader || isDeliveryTracking ? [] : ['top', 'left', 'right']}
    >
      <StatusBar style={showPickupHeader ? 'light' : isDeliveryTracking ? 'dark' : 'dark'} />
      <LiquidGlassBackground style={styles.flex}>
        {isClerkEnabled ? (
          <ClerkProfileSync onProfile={handleClerkProfile} onSignedIn={handleClerkSignedIn} />
        ) : null}
        {isConvexEnabled ? (
          <ConvexConnectionCheck onError={(message) => showToast(message, 'error')} />
        ) : null}
        {isClerkEnabled && isConvexEnabled ? <ConvexUserSync /> : null}
        {showPickupHeader && (
          <AppPickupHeader
            C={C}
            orderType={orderType}
            branch={selectedBranch}
            onPress={() => openOrderType(screen)}
            onNotifyPress={() => setScreen('notifications')}
            notifyCount={unreadNotifications}
          />
        )}
        <View style={styles.flex}>{renderScreen()}</View>
        {showOrderNowFab && (
          <OrderNowFab C={C} bottom={floatingBarBottom} onPress={() => go('menu')} />
        )}
        {showFloatingCart && (
          <StitchFloatingCart
            C={C}
            count={cartCount}
            total={cartTotal}
            bottom={floatingCartBottom}
            onPress={() => {
              void hapticMedium();
              go('cart');
            }}
          />
        )}
        {showNav && (
          <AppBottomNav
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
    padH: { paddingHorizontal: 20 },
    onboardHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
    skipBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surfaceContainer },
    skipBtnText: { color: C.textMuted, fontWeight: '600', fontFamily: FONTS.semiBold, fontSize: 14 },
    onboardScroll: { flexGrow: 1, paddingBottom: 8 },
    onboardImageWrap: { borderRadius: 28, overflow: 'hidden' },
    onboardImage: { width: '100%', borderRadius: 28 },
    onboardBody: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 8, alignItems: 'center' },
    onboardIconRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 24, marginBottom: 20 },
    onboardIconItem: { alignItems: 'center' },
    onboardIconBadge: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.secondaryContainer,
      borderWidth: 1,
      borderColor: C.outlineVariant,
    },
    onboardIconLabel: { fontSize: 11, fontFamily: FONTS.semiBold, color: C.textMuted, marginTop: 8, textAlign: 'center' },
    onboardTitle: { fontSize: 28, fontWeight: '800', fontFamily: FONTS.display, color: C.text, marginBottom: 10, textAlign: 'center' },
    onboardSub: { fontSize: 15, fontFamily: FONTS.regular, color: C.textMuted, lineHeight: 22, textAlign: 'center', maxWidth: 300 },
    onboardFooter: { paddingHorizontal: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.glassBorder, backgroundColor: C.bg },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
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
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      alignSelf: 'center',
    },
    otpHeroCard: { alignItems: 'center', padding: 24, marginBottom: 24, borderRadius: 20 },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 6 },
    otpBoxGlass: {
      flex: 1,
      maxWidth: 48,
      height: 54,
      borderRadius: 14,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpBoxFilled: {},
    otpInput: {
      width: '100%',
      height: '100%',
      textAlign: 'center',
      fontFamily: FONTS.bold,
      fontSize: 20,
    },
    profileAvatarCard: { alignItems: 'center', paddingVertical: 20, marginBottom: 8, borderRadius: 20 },
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
    branchImage: { width: '100%', height: 100 },
    branchBody: { padding: 16 },
    branchName: { color: C.text, fontFamily: FONTS.bold, fontSize: 16, marginBottom: 4 },
    branchHeader: { alignItems: 'center', marginBottom: 24, gap: 8 },
    branchHeaderIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    branchEtaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    branchEta: { fontFamily: FONTS.semiBold, fontSize: 12 },
    orderTypeScreen: { flexGrow: 1, paddingTop: 8, paddingBottom: 120 },
    orderTypeBranchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 20,
      marginTop: 4,
    },
    orderTypeBranchText: { fontFamily: FONTS.medium, fontSize: 14 },
    orderTypeSkip: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
    orderTypeSkipText: { fontFamily: FONTS.semiBold, fontSize: 14 },
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
    cartLineTitle: { fontFamily: FONTS.semiBold, fontSize: 15 },
    cartLineMeta: { fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    cartLinePrice: { fontFamily: FONTS.bold, fontSize: 14, marginTop: 4 },
    cartQtyText: { fontFamily: FONTS.bold, fontSize: 14, minWidth: 20, textAlign: 'center' },
    applyPromoBtn: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 72,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyPromoText: { fontFamily: FONTS.semiBold, fontSize: 13 },
    promoDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    promoDot: { width: 8, height: 8, borderRadius: 4 },
    offerChip: { minWidth: 110, marginRight: 10 },
    offerChipClean: {
      minWidth: 120,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
    },
    ordersTitleWrap: {
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    ordersTitle: { fontFamily: FONTS.semiBold, fontSize: 17 },
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
    summaryLabel: { fontFamily: FONTS.regular, fontSize: 14 },
    summaryValue: { fontFamily: FONTS.semiBold, fontSize: 14 },
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
    successIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successHeadline: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      textAlign: 'center',
      marginTop: 6,
    },
    successThankYou: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 12,
      paddingHorizontal: 8,
    },
  });
}
