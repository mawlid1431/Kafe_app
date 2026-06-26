import { useFonts } from 'expo-font';

import { fontAssets } from './fonts';

export function useKafeemanFonts() {
  return useFonts(fontAssets);
}
