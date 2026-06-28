import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LOGO_GREEN } from '../brand';
import { BRAND } from '../theme';
import { FONTS } from './fonts';
import { GlassSurface } from './stitchUi';

export type ToastTone = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  tone: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone, action?: { label: string; onPress: () => void }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const TONE_COLOR: Record<ToastTone, string> = {
  success: LOGO_GREEN,
  error: BRAND.error,
  info: BRAND.accent,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info', action?: { label: string; onPress: () => void }) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, tone, actionLabel: action?.label, onAction: action?.onPress });
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, action ? 4500 : 2800);
    },
    [hide, opacity, translateY],
  );

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.toastWrap,
            { top: insets.top + 8, opacity, transform: [{ translateY }] },
          ]}
        >
          <GlassSurface level="float" style={styles.toast} noShadow>
            <Ionicons name={TONE_ICON[toast.tone]} size={20} color={TONE_COLOR[toast.tone]} />
            <Text style={styles.toastText} numberOfLines={2}>
              {toast.message}
            </Text>
            {toast.actionLabel && toast.onAction ? (
              <Pressable
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                hitSlop={8}
              >
                <Text style={styles.toastAction}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </GlassSurface>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  toastText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: BRAND.text,
  },
  toastAction: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: BRAND.primaryContainer,
  },
});
