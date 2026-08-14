import { useEffect, useState } from 'react';

/**
 * Scroll-reveal driver for the landing page.
 *
 * The Framer template animates every block as it enters the viewport, so we
 * reproduce that with a single IntersectionObserver that flips
 * `data-lp-visible` on any `[data-lp-reveal]` node. The CSS in landing.css
 * owns the actual animation, which keeps this cheap and lets elements
 * animate once and stay put (matching the template's one-shot entrances).
 */
export function useReveal(): void {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-lp-reveal]'));
    if (nodes.length === 0) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.setAttribute('data-lp-visible', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-lp-visible', 'true');
          observer.unobserve(entry.target);
        });
      },
      // Fire slightly before the block is fully on screen, like the template.
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((n) => {
      // Anything already above the fold on load should appear immediately.
      if (n.getBoundingClientRect().top < window.innerHeight * 0.92) {
        n.setAttribute('data-lp-visible', 'true');
        return;
      }
      observer.observe(n);
    });

    return () => observer.disconnect();
  }, []);
}

/** Tracks whether the page has scrolled past `offset`, for the sticky nav. */
export function useScrolled(offset = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return scrolled;
}

/**
 * Auto-advancing index used to cycle the app screens inside the hero phone,
 * reproducing the template's rotating device screenshots. Pauses while the
 * tab is hidden so it never runs off-screen.
 */
export function useRotatingIndex(length: number, intervalMs = 3600): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [length, intervalMs]);

  return index;
}
