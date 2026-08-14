import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '@/features/kafeeman/theme';
import { FONTS } from '@/features/kafeeman/native/fonts';

/**
 * Bouncing "404" character, matching the web 404: each glyph rises 15px and
 * settles over 2s ease-in-out, looping, staggered by index * 200ms so the
 * digits ripple.
 */
function BouncingChar({ index, children }: { index: number; children: React.ReactNode }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, {
          toValue: -15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const timer = setTimeout(() => loop.start(), index * 200);

    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [index, y]);

  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page not found' }} />
      <View style={styles.container}>
        <View style={styles.digits}>
          <BouncingChar index={0}>
            <Text style={styles.digit}>4</Text>
          </BouncingChar>

          {/* Middle zero as a cup, mirroring the web 404's motif. */}
          <BouncingChar index={1}>
            <View style={styles.cup}>
              <Ionicons name="cafe" size={30} color={BRAND.primary} />
            </View>
          </BouncingChar>

          <BouncingChar index={2}>
            <Text style={styles.digit}>4</Text>
          </BouncingChar>
        </View>

        <View style={styles.badge}>
          <Ionicons name="cafe-outline" size={13} color={BRAND.primary} />
          <Text style={styles.badgeText}>Nothing brewing here</Text>
        </View>

        <Text style={styles.title}>This screen has gone cold</Text>
        <Text style={styles.body}>
          We couldn&apos;t find that screen. Head back and pick up where you left off — the menu is
          still hot.
        </Text>

        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Ionicons name="arrow-back" size={17} color={BRAND.onPrimaryContainer} />
            <Text style={styles.buttonText}>Back to home</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 28,
    backgroundColor: BRAND.surface,
  },
  digits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  digit: {
    fontFamily: FONTS.extraBold,
    fontSize: 68,
    lineHeight: 76,
    color: BRAND.primary,
  },
  cup: {
    height: 62,
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    borderWidth: 3,
    borderColor: BRAND.primaryContainer,
    backgroundColor: BRAND.surfaceLowest,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: BRAND.secondaryContainer,
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: BRAND.primary,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    textAlign: 'center',
    color: BRAND.text,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: BRAND.textFaint,
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    minHeight: 50,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: BRAND.primaryContainer,
  },
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: BRAND.onPrimaryContainer,
  },
});
