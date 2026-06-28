import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import { BRANCHES, deliveryDestinationForBranch } from '../data';
import { LOGO_GREEN } from '../brand';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { DeliveryMopedIcon } from './onboardingIcons';

type Coord = { latitude: number; longitude: number };

export type LiveTrackingState = {
  routeProgress: number;
  etaMinutes: number;
  updatedAt: number;
};

function branchCoord(branchName: string): Coord {
  const b = BRANCHES.find((x) => x.name === branchName) ?? BRANCHES[2];
  return { latitude: b.lat, longitude: b.lng };
}

function interpolateCoord(origin: Coord, destination: Coord, progress: number): Coord {
  const t = Math.max(0, Math.min(1, progress));
  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * t,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * t,
  };
}

function baseProgressForStep(step: number): number {
  if (step >= 3) return 1;
  if (step >= 2) return 0.45;
  if (step >= 1) return 0.06;
  return 0;
}

function etaMinutesForProgress(progress: number, step: number): number {
  if (step >= 3 || progress >= 1) return 0;
  if (step < 2) return step >= 1 ? 15 : 25;
  const remaining = Math.max(0, 1 - progress);
  return Math.max(1, Math.ceil(remaining * 18));
}

function regionAround(center: Coord, delta = 0.014): Region {
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

function regionForRoute(origin: Coord, destination: Coord, rider: Coord): Region {
  const lats = [origin.latitude, destination.latitude, rider.latitude];
  const lngs = [origin.longitude, destination.longitude, rider.longitude];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.018, (maxLat - minLat) * 2.4),
    longitudeDelta: Math.max(0.018, (maxLng - minLng) * 2.4),
  };
}

const LIVE_TICK_MS = 800;
const LIVE_STEP = 0.018;
const SHEET_MAP_PADDING = { top: 72, right: 16, bottom: 320, left: 16 };

export function TrackingMap({
  C,
  branchName,
  trackingStep,
  isLive,
  onLiveUpdate,
}: {
  C: ThemeColors;
  branchName: string;
  trackingStep: number;
  isLive: boolean;
  onLiveUpdate?: (state: LiveTrackingState) => void;
}) {
  const mapRef = useRef<MapView>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const riderRef = useRef<Coord>({ latitude: 0, longitude: 0 });
  const [liveOffset, setLiveOffset] = useState(0);
  const [followRider, setFollowRider] = useState(true);

  const origin = useMemo(() => branchCoord(branchName), [branchName]);
  const destination = useMemo<Coord>(() => {
    const dest = deliveryDestinationForBranch(branchName);
    return { latitude: dest.lat, longitude: dest.lng };
  }, [branchName]);

  useEffect(() => {
    setLiveOffset(0);
    setFollowRider(true);
  }, [trackingStep, branchName]);

  useEffect(() => {
    if (!isLive || trackingStep < 2 || trackingStep >= 3) return;
    const timer = setInterval(() => {
      setLiveOffset((v) => Math.min(0.48, v + LIVE_STEP));
    }, LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, [isLive, trackingStep]);

  const routeProgress = Math.min(1, baseProgressForStep(trackingStep) + liveOffset);
  const rider = useMemo(
    () => interpolateCoord(origin, destination, routeProgress),
    [destination, origin, routeProgress],
  );
  riderRef.current = rider;
  const etaMinutes = etaMinutesForProgress(routeProgress, trackingStep);

  useEffect(() => {
    onLiveUpdate?.({ routeProgress, etaMinutes, updatedAt: Date.now() });
  }, [etaMinutes, onLiveUpdate, routeProgress]);

  const overviewRegion = useMemo(
    () => regionForRoute(origin, destination, rider),
    [destination, origin, rider],
  );
  const overviewRegionRef = useRef(overviewRegion);
  overviewRegionRef.current = overviewRegion;

  const focusRider = useCallback(() => {
    setFollowRider(true);
    if (trackingStep < 2) {
      mapRef.current?.animateToRegion(overviewRegionRef.current, 500);
      return;
    }
    mapRef.current?.animateToRegion(
      regionAround(riderRef.current, trackingStep >= 3 ? 0.008 : 0.011),
      600,
    );
  }, [trackingStep]);

  // Focus map once when the delivery step or branch changes — not on every rider tick.
  useEffect(() => {
    if (trackingStep < 2) {
      mapRef.current?.animateToRegion(overviewRegionRef.current, 500);
      return;
    }
    mapRef.current?.animateToRegion(
      regionAround(riderRef.current, trackingStep >= 3 ? 0.008 : 0.011),
      600,
    );
  }, [trackingStep, branchName]);

  // Gentle follow while en route — throttled so the map does not jitter every tick.
  useEffect(() => {
    if (!followRider || trackingStep < 2 || trackingStep >= 3) return;
    const id = setInterval(() => {
      mapRef.current?.animateToRegion(regionAround(riderRef.current, 0.011), 350);
    }, 5000);
    return () => clearInterval(id);
  }, [followRider, trackingStep]);

  useEffect(() => {
    if (trackingStep < 2) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, trackingStep]);

  const traveledRoute = routeProgress > 0 ? [origin, rider] : [origin];
  const remainingRoute = routeProgress < 1 ? [rider, destination] : [];

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={overviewRegion}
        mapPadding={SHEET_MAP_PADDING}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled
        onPanDrag={() => setFollowRider(false)}
      >
        <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }} title="Kafe Eman" description={branchName}>
          <View style={[styles.pin, { backgroundColor: C.primaryContainer }]}>
            <Ionicons name="cafe" size={14} color="#fff" />
          </View>
          <View style={styles.pinStem} />
        </Marker>

        <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }} title="Your location">
          <View style={[styles.pin, { backgroundColor: C.accent }]}>
            <Ionicons name="home" size={14} color={C.onTertiaryFixed} />
          </View>
          <View style={[styles.pinStem, { backgroundColor: C.accent }]} />
        </Marker>

        {trackingStep >= 2 && (
          <Marker coordinate={rider} anchor={{ x: 0.5, y: 0.5 }} title="Rider">
            <View style={styles.riderWrap}>
              <Animated.View
                style={[
                  styles.riderPulse,
                  { backgroundColor: `${C.accent}55`, transform: [{ scale: pulse }] },
                ]}
              />
              <View style={[styles.riderPin, { backgroundColor: '#1b5e20', borderColor: '#fff' }]}>
                <DeliveryMopedIcon size={18} color="#fff" />
              </View>
            </View>
          </Marker>
        )}

        {traveledRoute.length >= 2 && (
          <Polyline coordinates={traveledRoute} strokeColor={C.primaryContainer} strokeWidth={4} />
        )}
        {remainingRoute.length >= 2 && (
          <Polyline
            coordinates={remainingRoute}
            strokeColor={`${C.primaryContainer}66`}
            strokeWidth={4}
            lineDashPattern={[10, 8]}
          />
        )}
      </MapView>

      {isLive && trackingStep >= 2 && trackingStep < 3 && (
        <Pressable onPress={focusRider} style={[styles.recenterBtn, { backgroundColor: C.surfaceLowest }]}>
          <Ionicons name="locate" size={20} color={C.primaryContainer} />
          <Text style={[styles.recenterText, { color: C.primaryContainer }]}>Live</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinStem: {
    alignSelf: 'center',
    width: 3,
    height: 8,
    borderRadius: 2,
    backgroundColor: LOGO_GREEN,
    marginTop: -1,
  },
  riderWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderPulse: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  riderPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 340,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 4,
  },
  recenterText: { fontFamily: FONTS.semiBold, fontSize: 12 },
});
