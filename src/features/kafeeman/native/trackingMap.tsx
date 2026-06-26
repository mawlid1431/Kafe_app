import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import { BRANCHES, DEMO_DELIVERY_DEST } from '../data';
import type { ThemeColors } from '../theme';
import { DeliveryMopedIcon } from './onboardingIcons';

type Coord = { latitude: number; longitude: number };

function branchCoord(branchName: string): Coord {
  const branch = BRANCHES.find((b) => b.name === branchName) ?? BRANCHES[2];
  return { latitude: branch.lat, longitude: branch.lng };
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
  if (step >= 2) return 0.52;
  if (step >= 1) return 0.08;
  return 0;
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
    latitudeDelta: Math.max(0.016, (maxLat - minLat) * 2.2),
    longitudeDelta: Math.max(0.016, (maxLng - minLng) * 2.2),
  };
}

export function TrackingMap({
  C,
  branchName,
  trackingStep,
  isLive,
}: {
  C: ThemeColors;
  branchName: string;
  trackingStep: number;
  isLive: boolean;
}) {
  const mapRef = useRef<MapView>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const [liveOffset, setLiveOffset] = useState(0);

  const origin = useMemo(() => branchCoord(branchName), [branchName]);
  const destination = useMemo<Coord>(
    () => ({ latitude: DEMO_DELIVERY_DEST.lat, longitude: DEMO_DELIVERY_DEST.lng }),
    [],
  );

  useEffect(() => {
    setLiveOffset(0);
  }, [trackingStep]);

  useEffect(() => {
    if (!isLive || trackingStep < 2 || trackingStep >= 3) return;
    const timer = setInterval(() => {
      setLiveOffset((v) => Math.min(0.38, v + 0.012));
    }, 1800);
    return () => clearInterval(timer);
  }, [isLive, trackingStep]);

  const routeProgress = Math.min(1, baseProgressForStep(trackingStep) + liveOffset);
  const rider = useMemo(
    () => interpolateCoord(origin, destination, routeProgress),
    [destination, origin, routeProgress],
  );

  const overviewRegion = useMemo(
    () => regionForRoute(origin, destination, rider),
    [destination, origin, rider],
  );

  useEffect(() => {
    if (trackingStep < 2) {
      mapRef.current?.animateToRegion(overviewRegion, 600);
      return;
    }
    mapRef.current?.animateToRegion(regionAround(rider, trackingStep >= 3 ? 0.01 : 0.012), 900);
  }, [overviewRegion, rider, trackingStep]);

  useEffect(() => {
    if (trackingStep < 2) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, trackingStep]);

  const traveledRoute =
    routeProgress > 0 ? [origin, rider] : [origin];
  const remainingRoute = routeProgress < 1 ? [rider, destination] : [];

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={overviewRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.pin, { backgroundColor: C.primaryContainer }]}>
            <Ionicons name="cafe" size={14} color="#fff" />
          </View>
          <View style={styles.pinStem} />
        </Marker>

        <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }}>
          <View style={[styles.pin, { backgroundColor: C.accent }]}>
            <Ionicons name="home" size={14} color={C.onTertiaryFixed} />
          </View>
          <View style={[styles.pinStem, { backgroundColor: C.accent }]} />
        </Marker>

        {trackingStep >= 2 && (
          <Marker coordinate={rider} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.riderWrap}>
              <Animated.View
                style={[
                  styles.riderPulse,
                  { backgroundColor: `${C.accent}44`, transform: [{ scale: pulse }] },
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
            strokeColor={`${C.primaryContainer}55`}
            strokeWidth={4}
            lineDashPattern={[10, 8]}
          />
        )}
      </MapView>
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
    backgroundColor: '#3e2723',
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
});
