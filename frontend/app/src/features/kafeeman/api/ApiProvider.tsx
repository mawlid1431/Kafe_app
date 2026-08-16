import { useAuth } from '@clerk/expo';
import { useEffect, type ReactNode } from 'react';

import { isClerkEnabled } from '../auth/clerkConfig';
import { CLERK_JWT_TEMPLATE, isApiEnabled, setAuthTokenGetter } from './client';
import { SafeModeProvider } from './SafeModeProvider';

export { isApiEnabled };

/** Keeps the API client's Clerk token getter in sync with the session. */
function ApiAuthSync({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isClerkEnabled || !isSignedIn) {
      setAuthTokenGetter(null);
      return;
    }

    setAuthTokenGetter(async () => {
      // Without a template Clerk issues its default session token, whose `aud`
      // will not match what the API expects — fail loudly rather than 401 later.
      if (!CLERK_JWT_TEMPLATE) {
        console.error('[api] EXPO_PUBLIC_CLERK_JWT_TEMPLATE is not set — see .env.example');
        return null;
      }
      return (await getToken({ template: CLERK_JWT_TEMPLATE })) ?? null;
    });

    return () => setAuthTokenGetter(null);
  }, [getToken, isSignedIn]);

  return children;
}

export function ApiProvider({ children }: { children: ReactNode }) {
  if (!isApiEnabled) {
    return children;
  }

  const tree = <SafeModeProvider>{children}</SafeModeProvider>;

  if (!isClerkEnabled) {
    return tree;
  }

  return <ApiAuthSync>{tree}</ApiAuthSync>;
}
