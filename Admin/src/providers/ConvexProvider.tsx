import { ConvexProvider, ConvexReactClient } from 'convex/react';
import type { ReactNode } from 'react';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function hasConvex() {
  return Boolean(convexClient);
}

export function AppConvexProvider({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return <>{children}</>;
  }
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}

export function ConvexSetupNotice({ context }: { context: string }) {
  return (
    <div className="admin-card max-w-lg text-center">
      <h2 className="font-display text-xl font-semibold text-coffee-dark">Convex not configured</h2>
      <p className="mt-2 text-sm text-muted">
        {context} needs <code className="rounded bg-cream px-1">EXPO_PUBLIC_CONVEX_URL</code> in the
        parent <code className="rounded bg-cream px-1">.env.local</code>.
      </p>
      <p className="mt-3 text-xs text-muted">
        Run <code className="rounded bg-cream px-1">bun run convex:dev</code> from the mobile project root.
      </p>
    </div>
  );
}
