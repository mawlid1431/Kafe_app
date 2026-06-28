import {
  Component,
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

const ConvexSafeModeContext = createContext(false);

/** When true, all Convex data hooks use local fallback (catalog/orders offline). */
export function useConvexSafeMode(): boolean {
  return useContext(ConvexSafeModeContext);
}

type BoundaryProps = {
  children: ReactNode;
  onConvexError: (error: Error) => void;
};

type BoundaryState = { failed: boolean };

class ConvexQueryErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onConvexError(error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * Catches Convex query failures (missing functions, server errors) and re-renders
 * children in offline mode so the app keeps working with local menu/branches.
 */
export function ConvexSafeProvider({ children }: { children: ReactNode }) {
  const [safeMode, setSafeMode] = useState(false);

  const onConvexError = useCallback((error: Error) => {
    console.warn('[ConvexSafe] Falling back to offline data:', error.message);
    setSafeMode(true);
  }, []);

  return (
    <ConvexSafeModeContext.Provider value={safeMode}>
      {safeMode ? (
        children
      ) : (
        <ConvexQueryErrorBoundary onConvexError={onConvexError}>{children}</ConvexQueryErrorBoundary>
      )}
    </ConvexSafeModeContext.Provider>
  );
}
