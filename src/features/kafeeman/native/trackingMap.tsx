import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import { BRANCHES, DEMO_DELIVERY_DEST } from '../data';
import type { ThemeColors } from '../theme';

type Coord = { latitude: number; longitude: number };

function branchCoord(branchName: string): Coord {
  const branch = BRANCHES.find((b) => b.name === branchName) ?? BRANCHES[2];
  return { latitude: branch.lat, longitude: branch.lng };
}

function riderCoord(origin: Coord, destination: Coord, trackingStep: number): Coord {
  const progress = trackingStep >= 3 ? 1 : trackingStep >= 2 ? 0.62 : trackingStep >= 1 ? 0.12 : 0;
  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * progress,
  };
}

function regionForPoints(points: Coord[]): Region {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max(0.018, (maxLat - minLat) * 1.8);
  const lngDelta = Math.max(0.018, (maxLng - minLng) * 1.8);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

export function TrackingMap({
  C,
  branchName,
  orderType,
  trackingStep,
}: {
  C: ThemeColors;
  branchName: string;
  orderType: 'delivery' | 'pickup';
  trackingStep: number;
}) {
  const origin = useMemo(() => branchCoord(branchName), [branchName]);
  const destination = useMemo<Coord>(
    () =>
      orderType === 'delivery'
        ? { latitude: DEMO_DELIVERY_DEST.lat, longitude: DEMO_DELIVERY_DEST.lng }
        : origin,
    [orderType, origin],
  );
  const rider = useMemo(
    () => riderCoord(origin, destination, orderType === 'delivery' ? trackingStep : 0),
    [destination, orderType, origin, trackingStep],
  );
  const region = useMemo(
    () => regionForPoints([origin, destination, rider]),
    [destination, origin, rider],
  );
  const route = useMemo(
    () => [origin, ...(orderType === 'delivery' && trackingStep >= 2 ? [rider] : []), destination],
    [destination, orderType, origin, rider, trackingStep],
  );

  return (
    <View style={styles.wrap}>
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={region} region={region} showsUserLocation={false}>
        <Marker coordinate={origin} title={branchName} description="Kafe Eman branch">
          <View style={[styles.marker, { backgroundColor: C.primaryContainer, borderColor: '#fff' }]} />
        </Marker>
        {orderType === 'delivery' && (
          <Marker coordinate={destination} title="Your address" description="Delivery location">
            <View style={[styles.marker, { backgroundColor: C.accent, borderColor: '#fff' }]} />
          </Marker>
        )}
        {orderType === 'delivery' && trackingStep >= 2 && (
          <Marker coordinate={rider} title="Ahmad" description="Your rider">
            <View style={[styles.riderMarker, { backgroundColor: '#2e7d32', borderColor: '#fff' }]}>
              <View style={styles.riderMarkerInner} />
            </View>
          </Marker>
        )}
        {orderType === 'delivery' && (
          <Polyline coordinates={route} strokeColor={C.primaryContainer} strokeWidth={3} lineDashPattern={[6, 4]} />
        )}
      </MapView>
      <View style={styles.mapFade} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject },
  mapFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  marker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  riderMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
