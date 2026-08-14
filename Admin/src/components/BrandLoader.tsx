import type { CSSProperties } from 'react';
import { BRAND_LOGO_URL, BRAND_NAME } from '@/lib/brand';
import './brandLoader.css';

const DEFAULT_SPOKES = 24;

type BrandLoaderProps = {
  /** Ring diameter in px. Bars scale with it. */
  size?: number;
  /** Spoke count — the Framer original defaults to 24 (valid 8–60). */
  spokes?: number;
  /** Show the brand mark in the middle of the ring. */
  mark?: boolean;
  className?: string;
};

/**
 * The "loading spokes bounce" ring: bars around a circle that light up and
 * bounce in sequence. Purely decorative, so it is hidden from assistive
 * tech — the surrounding loading screen carries the live text.
 */
export function BrandLoader({
  size = 132,
  spokes = DEFAULT_SPOKES,
  mark = true,
  className,
}: BrandLoaderProps) {
  const count = Math.min(60, Math.max(8, spokes));
  // Bars stay proportional to the ring so the shape holds at any size.
  const scale = size / 200;

  return (
    <div
      className={`ke-loader${className ? ` ${className}` : ''}`}
      style={
        {
          '--ke-loader-size': `${size}px`,
          '--ke-spoke-w': `${Math.max(3, 8 * scale)}px`,
          '--ke-spoke-h': `${Math.max(7, 18 * scale)}px`,
          '--ke-spoke-inset': `${Math.max(5, 12 * scale)}px`,
        } as CSSProperties
      }
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="ke-loader__arm"
          style={
            {
              '--ke-angle': `${(360 / count) * i}deg`,
              // Staggering by one cycle-slice per spoke is what produces the
              // travelling wave of activation around the ring.
              '--ke-delay': `${((i / count) * 1.7).toFixed(3)}s`,
            } as CSSProperties
          }
        >
          <span className="ke-loader__bar" />
        </span>
      ))}

      {mark ? (
        <span className="ke-loader__core">
          <img src={BRAND_LOGO_URL} alt="" width={64} height={64} decoding="async" />
        </span>
      ) : null}
    </div>
  );
}

/**
 * Full loading screen used for route transitions and session checks.
 * `full` fills the viewport (app boot / auth gate); otherwise it fills the
 * content area under the admin chrome.
 */
export function LoadingScreen({
  title = `Loading ${BRAND_NAME}`,
  hint,
  full = false,
  size,
}: {
  title?: string;
  hint?: string;
  full?: boolean;
  size?: number;
}) {
  return (
    <div
      className={`ke-loading-screen${full ? ' ke-loading-screen--full' : ''}`}
      role="status"
      aria-live="polite"
    >
      <BrandLoader size={size ?? (full ? 148 : 116)} />
      <div>
        <p className="ke-loading-screen__title">{title}</p>
        {hint ? <p className="ke-loading-screen__hint">{hint}</p> : null}
      </div>
    </div>
  );
}
