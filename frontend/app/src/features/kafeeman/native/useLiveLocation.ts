import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { setLocationPromptChoice } from '../lib/locationStorage';
import type { Coord } from './roadRouting';

export type LocationPermissionState = 'undetermined' | 'granted' | 'denied';

export function useLiveLocation(enabled: boolean) {
  const [permission, setPermission] = useState<LocationPermissionState>('undetermined');
  const [userLocation, setUserLocation] = useState<Coord | null>(null);
  const [loading, setLoading] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const syncPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      setPermission('granted');
      return 'granted' as const;
    }
    if (status === Location.PermissionStatus.DENIED) {
      setPermission('denied');
      return 'denied' as const;
    }
    setPermission('undetermined');
    return 'undetermined' as const;
  }, []);

  const startWatching = useCallback(async () => {
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 8,
        timeInterval: 4000,
      },
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
    );
    watchRef.current = sub;

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setUserLocation({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
  }, []);

  const stopWatching = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
  }, []);

  /** Opens the iOS/Android system dialog (Allow Once / While Using / Don't Allow). */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      await setLocationPromptChoice('asked');
      if (status === Location.PermissionStatus.GRANTED) {
        setPermission('granted');
        await startWatching();
        return true;
      }
      setPermission('denied');
      return false;
    } finally {
      setLoading(false);
    }
  }, [startWatching]);

  const declinePermission = useCallback(async () => {
    await setLocationPromptChoice('declined');
    setPermission('denied');
  }, []);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  useEffect(() => {
    void syncPermission();
  }, [syncPermission]);

  useEffect(() => {
    if (!enabled || permission !== 'granted') {
      stopWatching();
      return;
    }
    void startWatching();
    return stopWatching;
  }, [enabled, permission, startWatching, stopWatching]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncPermission();
    });
    return () => sub.remove();
  }, [syncPermission]);

  return {
    permission,
    userLocation,
    loading,
    requestPermission,
    declinePermission,
    openSettings,
    syncPermission,
    hasFix: userLocation !== null,
  };
}

export function locationPermissionLabel(state: LocationPermissionState): string {
  if (state === 'granted') return Platform.OS === 'ios' ? 'Location allowed' : 'Location on';
  if (state === 'denied') return 'Location off';
  return 'Location not set';
}
