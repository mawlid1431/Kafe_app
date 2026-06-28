import { useAuth, useUser } from '@clerk/expo';
import { useMutation } from 'convex/react';
import { useEffect, useRef } from 'react';

import { api } from '@/convex/_generated/api';
import { isClerkEnabled } from '../auth/clerkConfig';
import { isConvexEnabled } from './ConvexClientProvider';

/** Upserts the signed-in Clerk user into Convex `users` table. */
export function useConvexUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const upsertFromAuth = useMutation(api.users.upsertFromAuth);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isConvexEnabled || !isClerkEnabled || !isSignedIn || !user) return;
    if (syncedFor.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '';
    const name =
      user.fullName?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      email.split('@')[0] ||
      'Guest';

    void upsertFromAuth({
      name,
      email,
      pictureUrl: user.imageUrl,
    })
      .then(() => {
        syncedFor.current = user.id;
      })
      .catch((err: unknown) => {
        syncedFor.current = null;
        console.error('[ConvexUserSync] upsertFromAuth failed:', err);
      });
  }, [isSignedIn, upsertFromAuth, user]);
}

export function ConvexUserSync() {
  useConvexUserSync();
  return null;
}
