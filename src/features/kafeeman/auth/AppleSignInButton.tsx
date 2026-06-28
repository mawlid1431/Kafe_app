import { useSignInWithApple } from '@clerk/expo/apple';
import { useCallback, useState } from 'react';

import { isClerkEnabled } from './clerkConfig';
import { hapticMedium, hapticSuccess } from '../lib/haptics';
import { StitchPillButton } from '../native/stitchUi';
import type { ThemeColors } from '../theme';

type Props = {
  C: ThemeColors;
  onSuccess: () => void;
  onError?: (message: string) => void;
  onFallback?: () => void;
};

function ClerkAppleSignInButton({ C, onSuccess, onError }: Omit<Props, 'onFallback'>) {
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (loading) return;
    void hapticMedium();
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startAppleAuthenticationFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        void hapticSuccess();
        onSuccess();
        return;
      }
      onError?.('Apple sign-in did not complete. Try again or use another method.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple sign-in failed';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [loading, onError, onSuccess, startAppleAuthenticationFlow]);

  return (
    <StitchPillButton
      label={loading ? 'Signing in…' : 'Continue with Apple'}
      onPress={() => void handlePress()}
      C={C}
      variant="apple"
      icon="logo-apple"
    />
  );
}

export function AppleSignInButton({ C, onSuccess, onError, onFallback }: Props) {
  if (!isClerkEnabled) {
    return (
      <StitchPillButton
        label="Continue with Apple"
        onPress={() => {
          void hapticMedium();
          onFallback?.();
        }}
        C={C}
        variant="apple"
        icon="logo-apple"
      />
    );
  }

  return <ClerkAppleSignInButton C={C} onSuccess={onSuccess} onError={onError} />;
}
