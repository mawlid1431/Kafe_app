import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import type { ReactNode } from 'react';

import { CLERK_PUBLISHABLE_KEY, isClerkEnabled } from './clerkConfig';

type Props = {
  children: ReactNode;
};

export function ClerkAuthProvider({ children }: Props) {
  if (!isClerkEnabled) {
    return children;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
