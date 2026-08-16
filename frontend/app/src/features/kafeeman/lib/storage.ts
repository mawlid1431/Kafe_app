import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppNotification,
  CartLine,
  OrderRecord,
  PointsActivity,
  SavedAddress,
  UserProfile,
} from '../types';

const STORAGE_KEY = '@kafeeman/app-state-v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Ahmad Eman',
  email: 'ahmad@email.com',
};

export const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'home',
    label: 'Home',
    line1: 'No. 12, Jalan Mawar 3',
    line2: 'Taman Desa, 58100 Kuala Lumpur',
    isDefault: true,
  },
  {
    id: 'work',
    label: 'Office',
    line1: 'Level 8, Menara KL',
    line2: 'Jalan P. Ramlee, 50250 Kuala Lumpur',
  },
];

export type PersistedAppState = {
  version: 1;
  onboardingDone: boolean;
  isLoggedIn: boolean;
  profile: UserProfile;
  cart: CartLine[];
  favorites: number[];
  orders: OrderRecord[];
  points: number;
  pointsHistory: PointsActivity[];
  selectedBranch: string;
  orderType: 'delivery' | 'pickup';
  addresses: SavedAddress[];
  selectedAddressId: string;
  notifications: AppNotification[];
};

export async function loadAppState(): Promise<Partial<PersistedAppState> | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedAppState>;
  } catch {
    return null;
  }
}

export async function saveAppState(state: PersistedAppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage failures should not break the app
  }
}

export async function clearAppState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
