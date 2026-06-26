import { useState, type ReactNode } from 'react';
import { Image, type ImageStyle } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type { ThemeColors } from '../theme';
import { BRAND } from '../theme';
import { FONTS } from './fonts';

function resolveImageLayout(style?: StyleProp<ImageStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};
  const radius = typeof flat.borderRadius === 'number' ? flat.borderRadius : 12;

  const fillsContainer =
    (flat.position === 'absolute' &&
      typeof flat.width !== 'number' &&
      typeof flat.height !== 'number' &&
      (flat.left != null || flat.right != null || flat.top != null || flat.bottom != null)) ||
    flat.width === '100%' ||
    flat.height === '100%' ||
    flat.flex === 1;

  if (fillsContainer) {
    return { wrapperStyle: [style, { overflow: 'hidden' as const }], radius, fillsContainer };
  }

  const width = typeof flat.width === 'number' ? flat.width : 60;
  const height = typeof flat.height === 'number' ? flat.height : 60;
  return {
    wrapperStyle: [{ width, height, borderRadius: radius, overflow: 'hidden' as const }, style],
    radius,
    fillsContainer,
    width,
    height,
  };
}

export function AppImage({
  uri,
  style,
  contentPosition,
}: {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentPosition?: { top?: string | number; left?: string | number } | 'center' | 'right' | 'left';
}) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { wrapperStyle, radius, fillsContainer, width, height } = resolveImageLayout(style);

  if (failed) {
    return (
      <View
        style={[
          wrapperStyle,
          styles.fallback,
          !fillsContainer && width != null && height != null ? { width, height, borderRadius: radius } : null,
        ]}
      >
        <Text style={{ fontSize: 22 }}>☕</Text>
      </View>
    );
  }

  return (
    <View style={wrapperStyle}>
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, styles.skeleton, { borderRadius: radius }]}>
          <ActivityIndicator size="small" color={BRAND.primaryContainer} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        contentPosition={contentPosition ?? 'center'}
        transition={250}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      />
    </View>
  );
}

export function glass(C: ThemeColors): ViewStyle {
  return {
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderRadius: 22,
  };
}

export function GlassCard({
  children,
  style,
  C,
}: {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  C: ThemeColors;
}) {
  return <View style={[glass(C), style]}>{children}</View>;
}

export function GradientButton({
  label,
  onPress,
  disabled,
  C,
  variant = 'primary',
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  C: ThemeColors;
  variant?: 'primary' | 'tng' | 'ghost';
}) {
  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.btnWrap,
          styles.ghost,
          {
            borderColor: C.outlineVariant,
            backgroundColor: C.glassStrong,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text style={[styles.btnText, { color: C.primary, fontFamily: FONTS.bold }]}>{label}</Text>
      </Pressable>
    );
  }

  const colors =
    variant === 'tng'
      ? (['#00a651', '#007a3d'] as const)
      : ([C.primaryContainer, C.primaryDark] as const);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        disabled ? { opacity: 0.5 } : undefined,
        styles.btnWrap,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={[...colors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}
      >
        <Text style={[styles.btnText, { color: C.onPrimary }]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function displayTitle(color: string, extra?: TextStyle): TextStyle {
  return { fontFamily: FONTS.display, color, ...extra };
}

export function bodyText(color: string, extra?: TextStyle): TextStyle {
  return { fontFamily: FONTS.regular, color, ...extra };
}

const styles = StyleSheet.create({
  btnWrap: { width: '100%', alignSelf: 'stretch' },
  gradient: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3E2723',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  btnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  ghost: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  skeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.surfaceContainer,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.secondaryContainer,
  },
});
