import { useAuth } from '@clerk/expo';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { type ReactNode, useEffect, useMemo } from 'react';

import { isClerkEnabled } from '../auth/clerkConfig';
import { ConvexSafeProvider } from './ConvexSafeProvider';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.trim() ?? '';

export const isConvexEnabled = convexUrl.length > 0;

const convexClient = isConvexEnabled ? new ConvexReactClient(convexUrl) : null;

function ConvexAuthSync({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!convexClient) return;

    if (!isClerkEnabled || !isSignedIn) {
      convexClient.clearAuth();
      return;
    }

    convexClient.setAuth(async () => {
      const token = await getToken({ template: 'convex' });
      return token ?? null;
    });
  }, [getToken, isSignedIn]);

  return children;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => convexClient, []);

  if (!client) {
    return children;
  }

  const tree = (
    <ConvexProvider client={client}>
      <ConvexSafeProvider>{children}</ConvexSafeProvider>
    </ConvexProvider>
  );

  if (!isClerkEnabled) {
    return tree;
  }

  return <ConvexAuthSync>{tree}</ConvexAuthSync>;
}
