import { useAuth, useUser } from '@clerk/expo';
import { useEffect, useRef } from 'react';

import { isClerkEnabled } from '../auth/clerkConfig';
import { apiFetch, isApiEnabled } from './client';
import { useSafeMode } from './SafeModeProvider';

/**
 * Projects the signed-in Clerk user into our own `users` table.
 * Replaces the `users.upsertFromAuth` mutation.
 */
export function useUserSync() {
  const safeMode = useSafeMode();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isApiEnabled || safeMode || !isClerkEnabled || !isSignedIn || !user) return;
    if (syncedFor.current === user.id) return;

    const email =
      user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '';
    const name =
      user.fullName?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      email.split('@')[0] ||
      'Guest';

    void apiFetch('/users/sync', {
      method: 'POST',
      auth: true,
      body: { name, email, pictureUrl: user.imageUrl },
    })
      .then(() => {
        syncedFor.current = user.id;
      })
      .catch((err: unknown) => {
        syncedFor.current = null;
        console.error('[UserSync] /users/sync failed:', err);
      });
  }, [isSignedIn, safeMode, user]);
}

export function UserSync() {
  useUserSync();
  return null;
}
