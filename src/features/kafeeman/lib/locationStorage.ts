import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@kafeeman/location-prompt-v1';

export type LocationPromptChoice = 'pending' | 'declined' | 'asked';

export async function getLocationPromptChoice(): Promise<LocationPromptChoice | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === 'declined' || raw === 'asked') return raw;
    return raw ? 'pending' : null;
  } catch {
    return null;
  }
}

export async function setLocationPromptChoice(choice: LocationPromptChoice): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, choice);
  } catch {
    // ignore
  }
}
