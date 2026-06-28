/** Clerk publishable key — set in .env.local (see .env.example). */
export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

export const isClerkEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
