import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ThemeColors } from '../theme';
import { STITCH_SHADOW_FLOAT } from '../theme';
import { FONTS } from './fonts';

type Props = {
  C: ThemeColors;
  onComplete: () => void;
};

export function SplashScreen({ C, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const logoScale = useRef(new Animated.Value(0.55)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(28)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.12, duration: 1400, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 0.92, duration: 1400, useNativeDriver: true }),
      ]),
    );
    pulse.start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleY, { toValue: 0, duration: 480, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
      ]),
      Animated.timing(subOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 1000, useNativeDriver: false }),
      Animated.timing(screenOpacity, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start(({ finished }) => {
      pulse.stop();
      if (finished) onComplete();
    });
  }, [
    glowOpacity,
    logoOpacity,
    logoScale,
    onComplete,
    progress,
    ringOpacity,
    ringScale,
    screenOpacity,
    subOpacity,
    titleOpacity,
    titleY,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={[C.bg, '#f3ebe6', '#faf6f3', C.bg]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['transparent', 'rgba(255,186,56,0.12)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ambientGlow}
      />
      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.logoStage}>
          <Animated.View
            style={[
              styles.glowOrb,
              { backgroundColor: C.accent, opacity: glowOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.logoRing,
              {
                borderColor: `${C.accent}55`,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              ...STITCH_SHADOW_FLOAT,
            }}
          >
            <LinearGradient colors={[C.primaryContainer, C.primaryDark, '#2a1814']} style={styles.logoBox}>
              <Ionicons name="cafe" size={48} color={C.onPrimary} />
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.title,
            { color: C.primary, opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          Kafe Eman
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { color: C.textMuted, opacity: subOpacity }]}>
          Brew · Sip · Enjoy
        </Animated.Text>

        <Animated.View style={[styles.progressTrack, { backgroundColor: `${C.primary}14`, opacity: subOpacity }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: C.primary }]} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  ambientGlow: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    right: '10%',
    height: 280,
    borderRadius: 140,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoStage: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glowOrb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.35,
  },
  logoRing: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 36,
    borderWidth: 2,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginBottom: 52,
  },
  progressTrack: {
    width: 128,
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
