import {
  Component,
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

const SafeModeContext = createContext(false);

/** When true, all data hooks fall back to the bundled catalog (offline mode). */
export function useSafeMode(): boolean {
  return useContext(SafeModeContext);
}

type BoundaryProps = {
  children: ReactNode;
  onApiError: (error: Error) => void;
};

type BoundaryState = { failed: boolean };

class ApiErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onApiError(error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * Catches data-layer failures and re-renders children in offline mode so the
 * app keeps working from the bundled menu and branches.
 *
 * Running with no backend is a deliberate product behaviour: the app must
 * still show a menu on a bad connection or before the API is reachable.
 */
export function SafeModeProvider({ children }: { children: ReactNode }) {
  const [safeMode, setSafeMode] = useState(false);

  const onApiError = useCallback((error: Error) => {
    console.warn('[SafeMode] Falling back to offline data:', error.message);
    setSafeMode(true);
  }, []);

  return (
    <SafeModeContext.Provider value={safeMode}>
      {safeMode ? (
        children
      ) : (
        <ApiErrorBoundary onApiError={onApiError}>{children}</ApiErrorBoundary>
      )}
    </SafeModeContext.Provider>
  );
}
