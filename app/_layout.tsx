import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { BRAND_ASSETS } from '@/features/kafeeman/brand';
import { ClerkAuthProvider } from '@/features/kafeeman/auth/ClerkAuthProvider';
import { ConvexClientProvider } from '@/features/kafeeman/convex/ConvexClientProvider';
import { useKafeemanFonts } from '@/features/kafeeman/native/useKafeemanFonts';
import { BRAND } from '@/features/kafeeman/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useKafeemanFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.bootSplash}>
        <Image source={BRAND_ASSETS.icon} style={styles.bootLogo} contentFit="contain" />
        <ActivityIndicator size="small" color={BRAND.onPrimaryContainer} style={styles.bootSpinner} />
      </View>
    );
  }

  return (
    <ClerkAuthProvider>
      <ConvexClientProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
            </Stack>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ConvexClientProvider>
    </ClerkAuthProvider>
  );
}

const styles = StyleSheet.create({
  bootSplash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.primaryContainer,
  },
  bootLogo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  bootSpinner: {
    marginTop: 24,
  },
});
