import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import { BRANCHES, deliveryDestinationForBranch } from '../data';
import { LOGO_GREEN } from '../brand';
import type { ThemeColors } from '../theme';
import { FONTS } from './fonts';
import { DeliveryMopedIcon } from './onboardingIcons';
import {
  coordAtRouteProgress,
  fetchDrivingRoute,
  splitRouteAtProgress,
  type Coord,
} from './roadRouting';

export type LiveTrackingState = {
  routeProgress: number;
  etaMinutes: number;
  updatedAt: number;
};

function branchCoord(branchName: string): Coord {
  const b = BRANCHES.find((x) => x.name === branchName) ?? BRANCHES[2];
  return { latitude: b.lat, longitude: b.lng };
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

function regionForCoords(...points: Coord[]): Region {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
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

type FollowMode = 'overview' | 'rider' | 'user';

export function TrackingMap({
  C,
  branchName,
  trackingStep,
  isLive,
  userLocation,
  onRequestLocation,
  onLiveUpdate,
}: {
  C: ThemeColors;
  branchName: string;
  trackingStep: number;
  isLive: boolean;
  /** Live GPS from expo-location when permission granted. */
  userLocation?: Coord | null;
  onRequestLocation?: () => void;
  onLiveUpdate?: (state: LiveTrackingState) => void;
}) {
  const mapRef = useRef<MapView>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const userPulse = useRef(new Animated.Value(1)).current;
  const riderRef = useRef<Coord>({ latitude: 0, longitude: 0 });
  const [liveOffset, setLiveOffset] = useState(0);
  const [followMode, setFollowMode] = useState<FollowMode>('overview');
  const [highlightUser, setHighlightUser] = useState(false);
  const [roadRoute, setRoadRoute] = useState<Coord[]>([]);

  const origin = useMemo(() => branchCoord(branchName), [branchName]);
  const destination = useMemo<Coord>(() => {
    if (userLocation) return userLocation;
    const dest = deliveryDestinationForBranch(branchName);
    return { latitude: dest.lat, longitude: dest.lng };
  }, [branchName, userLocation]);

  useEffect(() => {
    let cancelled = false;
    void fetchDrivingRoute(origin, destination).then((route) => {
      if (!cancelled) setRoadRoute(route);
    });
    return () => {
      cancelled = true;
    };
  }, [destination.latitude, destination.longitude, origin.latitude, origin.longitude]);

  useEffect(() => {
    setLiveOffset(0);
    setFollowMode('overview');
    setHighlightUser(false);
  }, [trackingStep, branchName]);

  useEffect(() => {
    if (!isLive || trackingStep < 2 || trackingStep >= 3) return;
    const timer = setInterval(() => {
      setLiveOffset((v) => Math.min(0.48, v + LIVE_STEP));
    }, LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, [isLive, trackingStep]);

  const routeProgress = Math.min(1, baseProgressForStep(trackingStep) + liveOffset);
  const route = roadRoute.length >= 2 ? roadRoute : [origin, destination];
  const rider = useMemo(
    () => coordAtRouteProgress(route, routeProgress),
    [route, routeProgress],
  );
  riderRef.current = rider;
  const etaMinutes = etaMinutesForProgress(routeProgress, trackingStep);

  useEffect(() => {
    onLiveUpdate?.({ routeProgress, etaMinutes, updatedAt: Date.now() });
  }, [etaMinutes, onLiveUpdate, routeProgress]);

  const { traveled, remaining } = useMemo(
    () => splitRouteAtProgress(route, routeProgress),
    [route, routeProgress],
  );

  const overviewRegion = useMemo(
    () => regionForCoords(origin, destination, rider),
    [destination, origin, rider],
  );
  const overviewRegionRef = useRef(overviewRegion);
  overviewRegionRef.current = overviewRegion;

  const focusRider = useCallback(() => {
    setFollowMode('rider');
    setHighlightUser(false);
    if (trackingStep < 2) {
      mapRef.current?.animateToRegion(overviewRegionRef.current, 500);
      return;
    }
    mapRef.current?.animateToRegion(
      regionAround(riderRef.current, trackingStep >= 3 ? 0.008 : 0.011),
      600,
    );
  }, [trackingStep]);

  const focusUser = useCallback(() => {
    if (!userLocation) {
      onRequestLocation?.();
      return;
    }
    setFollowMode('user');
    setHighlightUser(true);
    mapRef.current?.animateToRegion(regionAround(userLocation, 0.008), 600);
    setTimeout(() => setHighlightUser(false), 2400);
  }, [onRequestLocation, userLocation]);

  useEffect(() => {
    if (trackingStep < 2) {
      mapRef.current?.animateToRegion(overviewRegionRef.current, 500);
      return;
    }
    if (followMode === 'user' && userLocation) {
      mapRef.current?.animateToRegion(regionAround(userLocation, 0.008), 600);
      return;
    }
    if (followMode === 'rider') {
      mapRef.current?.animateToRegion(
        regionAround(riderRef.current, trackingStep >= 3 ? 0.008 : 0.011),
        600,
      );
    }
  }, [trackingStep, branchName, followMode, userLocation]);

  useEffect(() => {
    if (followMode !== 'rider' || trackingStep < 2 || trackingStep >= 3) return;
    const id = setInterval(() => {
      mapRef.current?.animateToRegion(regionAround(riderRef.current, 0.011), 350);
    }, 5000);
    return () => clearInterval(id);
  }, [followMode, trackingStep]);

  useEffect(() => {
    if (followMode !== 'user' || !userLocation) return;
    mapRef.current?.animateToRegion(regionAround(userLocation, 0.008), 400);
  }, [followMode, userLocation?.latitude, userLocation?.longitude]);

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

  useEffect(() => {
    if (!highlightUser) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(userPulse, { toValue: 1.45, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(userPulse, { toValue: 1, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [highlightUser, userPulse]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={overviewRegion}
        mapPadding={SHEET_MAP_PADDING}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled
        onPanDrag={() => setFollowMode('overview')}
      >
        <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }} title="Kafe Eman" description={branchName}>
          <View style={[styles.pin, { backgroundColor: C.primaryContainer }]}>
            <Ionicons name="cafe" size={14} color="#fff" />
          </View>
          <View style={styles.pinStem} />
        </Marker>

        <Marker
          coordinate={destination}
          anchor={{ x: 0.5, y: 1 }}
          title={userLocation ? 'Your GPS location' : 'Delivery address'}
        >
          <View style={styles.userPinWrap}>
            {(highlightUser || userLocation) && (
              <Animated.View
                style={[
                  styles.userPulse,
                  {
                    backgroundColor: `${C.accent}44`,
                    transform: [{ scale: highlightUser ? userPulse : 1 }],
                  },
                ]}
              />
            )}
            <View style={[styles.pin, { backgroundColor: userLocation ? '#2563eb' : C.accent }]}>
              <Ionicons name={userLocation ? 'navigate' : 'home'} size={14} color="#fff" />
            </View>
          </View>
          <View style={[styles.pinStem, { backgroundColor: userLocation ? '#2563eb' : C.accent }]} />
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

        {traveled.length >= 2 && (
          <Polyline coordinates={traveled} strokeColor={C.primaryContainer} strokeWidth={4} />
        )}
        {remaining.length >= 2 && (
          <Polyline
            coordinates={remaining}
            strokeColor={`${C.primaryContainer}66`}
            strokeWidth={4}
            lineDashPattern={[10, 8]}
          />
        )}
      </MapView>

      <View style={styles.mapControls}>
        <Pressable
          onPress={focusUser}
          style={[
            styles.controlBtn,
            { backgroundColor: highlightUser ? '#2563eb' : C.surfaceLowest },
          ]}
          accessibilityLabel="Center on my GPS location"
        >
          <Ionicons
            name="navigate"
            size={22}
            color={highlightUser ? '#fff' : userLocation ? '#2563eb' : C.textMuted}
          />
        </Pressable>

        {isLive && trackingStep >= 2 && trackingStep < 3 && (
          <Pressable
            onPress={focusRider}
            style={[
              styles.controlBtn,
              styles.controlBtnWide,
              { backgroundColor: followMode === 'rider' ? C.primaryContainer : C.surfaceLowest },
            ]}
            accessibilityLabel="Follow rider"
          >
            <DeliveryMopedIcon size={18} color={followMode === 'rider' ? '#fff' : C.primaryContainer} />
            <Text
              style={[
                styles.controlLabel,
                { color: followMode === 'rider' ? '#fff' : C.primaryContainer },
              ]}
            >
              Rider
            </Text>
          </Pressable>
        )}
      </View>
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
  userPinWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
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
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 340,
    gap: 10,
    zIndex: 4,
  },
  controlBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  controlBtnWide: {
    width: 'auto',
    minWidth: 46,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
    borderRadius: 999,
  },
  controlLabel: { fontFamily: FONTS.semiBold, fontSize: 12 },
});
