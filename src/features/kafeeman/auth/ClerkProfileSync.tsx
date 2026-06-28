import { useAuth, useUser } from '@clerk/expo';
import { useEffect } from 'react';

import type { UserProfile } from '../types';

type Props = {
  onProfile: (profile: UserProfile) => void;
  onSignedIn: () => void;
};

function profileFromClerkUser(user: ReturnType<typeof useUser>['user']): UserProfile {
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? '';
  const name =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    email.split('@')[0] ||
    'Guest';

  return {
    name,
    email,
  };
}

/** Keeps local Kafeeman profile state in sync with the Clerk session. */
export function ClerkProfileSync({ onProfile, onSignedIn }: Props) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;
    onProfile(profileFromClerkUser(user));
    onSignedIn();
  }, [isSignedIn, onProfile, onSignedIn, user]);

  return null;
}
