import type { CSSProperties, ReactNode } from 'react';
import { useRotatingIndex } from './useReveal';

type PhoneProps = {
  children: ReactNode;
  /** Frame width in px; the aspect ratio is locked in CSS. */
  width?: number;
  float?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Pure-CSS iPhone-style frame. The template presents every app screen inside
 * a device like this; building the frame in CSS means the screens inside are
 * live DOM (crisp at any zoom) instead of flat screenshots.
 */
export function PhoneMockup({ children, width = 300, float = false, className, style }: PhoneProps) {
  return (
    <div
      className={`lp-phone${float ? ' lp-phone--float' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, ...({ '--lp-phone-w': `${width}px` } as CSSProperties) }}
      role="img"
      aria-label="Kafe Eman mobile app screen"
    >
      <div className="lp-phone__screen">
        <span className="lp-phone__island" />
        {children}
        <span className="lp-phone__home" />
      </div>
    </div>
  );
}

/**
 * Phone whose screens auto-advance, reproducing the template's rotating
 * device showcase. Screens cross-fade and lift, one at a time.
 */
export function RotatingPhone({
  screens,
  width = 300,
  float = true,
  intervalMs = 3600,
}: {
  screens: Array<{ key: string; node: ReactNode }>;
  width?: number;
  float?: boolean;
  intervalMs?: number;
}) {
  const current = useRotatingIndex(screens.length, intervalMs);

  return (
    <PhoneMockup width={width} float={float}>
      <div className="lp-phone__stack">
        {screens.map((screen, i) => (
          <div
            key={screen.key}
            className="lp-phone__slide"
            data-lp-current={String(i === current)}
            aria-hidden={i !== current}
          >
            {screen.node}
          </div>
        ))}
      </div>
    </PhoneMockup>
  );
}

/**
 * Laptop frame used to showcase the admin dashboard alongside the app —
 * the template's wider "one-stop hub" device treatment.
 */
export function LaptopMockup({ children }: { children: ReactNode }) {
  return (
    <div className="lp-laptop" role="img" aria-label="Kafe Eman admin dashboard">
      <div className="lp-laptop__lid">
        <span className="lp-laptop__notch" />
        <div className="lp-laptop__screen">{children}</div>
      </div>
      <div className="lp-laptop__base" />
    </div>
  );
}
