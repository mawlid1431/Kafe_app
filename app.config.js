/**
 * Dynamic Expo config.
 *
 * Everything static lives in app.json — this file only layers in values that
 * must come from the environment so no key is ever committed.
 *
 * EXPO_PUBLIC_GOOGLE_MAPS_API_KEY — required for react-native-maps on Android.
 * iOS uses Apple Maps and needs no key, which is why the app worked without it.
 * Without the key the Android map renders as a blank grey tile; the rest of the
 * app is unaffected. Expo loads .env.local automatically.
 */
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

module.exports = ({ config }) => {
  const android = { ...config.android };

  if (googleMapsApiKey) {
    android.config = {
      ...android.config,
      googleMaps: { apiKey: googleMapsApiKey },
    };
  }

  return { ...config, android };
};
