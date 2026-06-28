import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND_ASSETS } from '../brand';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';

type Props = {
  C: ThemeColors;
  onComplete: () => void;
};

const LOADING_MESSAGE = 'Something amazing is brewing.\nJust a moment please.';

export function SplashScreen({ C, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const brandOpacity = useRef(new Animated.Value(1)).current;
  const loadOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(loadOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(loadOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [brandOpacity, loadOpacity, logoScale, onComplete]);

  return (
    <View style={[styles.root, { backgroundColor: C.surfaceLowest }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.brandStage,
          { backgroundColor: C.primary, opacity: brandOpacity, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Image
          source={BRAND_ASSETS.icon}
          style={styles.brandLogo}
          contentFit="contain"
          transition={200}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.loadStage,
          {
            opacity: loadOpacity,
            backgroundColor: C.surfaceLowest,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <Image source={BRAND_ASSETS.icon} style={styles.loadIcon} contentFit="cover" />
        </Animated.View>
        <ActivityIndicator size="small" color={C.primaryContainer} style={styles.spinner} />
        <Text style={[styles.loadText, { color: C.onSurface }]}>{LOADING_MESSAGE}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  brandStage: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  brandLogo: {
    width: 200,
    height: 80,
  },
  loadStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    zIndex: 3,
  },
  loadIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 20,
  },
  spinner: { marginBottom: 16 },
  loadText: {
    textAlign: 'center',
    fontFamily: FONTS.medium,
    fontSize: 15,
    lineHeight: 22,
  },
});
