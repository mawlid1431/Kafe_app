import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppConvexProvider } from './providers/ConvexProvider';
import './index.css';

/**
 * Fade out and remove the inline boot splash from index.html once React has
 * painted. The splash is a full-screen overlay, so removal must be
 * guaranteed: requestAnimationFrame does not fire in a hidden/background tab,
 * which would otherwise leave the app covered until the tab is focused. We
 * therefore race a rAF (smooth path, fires on the first painted frame)
 * against a timer (guaranteed path), and make the work idempotent.
 */
let bootSplashDismissed = false;

function dismissBootSplash(): void {
  if (bootSplashDismissed) return;
  bootSplashDismissed = true;

  const boot = document.getElementById('ke-boot');
  if (!boot) return;

  boot.setAttribute('data-done', 'true');
  // Matches the 0.4s CSS transition, then hard-removes the node.
  window.setTimeout(() => boot.remove(), 500);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppConvexProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppConvexProvider>
  </StrictMode>,
);

// Preferred: lift the splash on the frame after React's first paint.
requestAnimationFrame(() => requestAnimationFrame(dismissBootSplash));
// Guaranteed: timers still run when rAF is paused (hidden/background tab).
window.setTimeout(dismissBootSplash, 600);
