import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function hapticLight(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function hapticMedium(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function hapticSuccess(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function hapticWarning(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export async function hapticSelection(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Haptics.selectionAsync();
}
