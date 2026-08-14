import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BRAND_LOGO_URL, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';
import { useScrolled } from './useReveal';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#platform', label: 'Platform' },
  { href: '#rewards', label: 'Rewards' },
  { href: '#reviews', label: 'Reviews' },
] as const;

/** Highlights the nav item whose section is currently on screen. */
function useActiveSection(): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(
      (el): el is Element => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function LandingNav() {
  const stuck = useScrolled(28);
  const active = useActiveSection();
  const [open, setOpen] = useState(false);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const brand = (
    <a href="#top" className="lp-brand" aria-label={`${BRAND_NAME} home`}>
      <img src={BRAND_LOGO_URL} alt="" className="lp-brand__mark" width={40} height={40} />
      <span>
        <span className="lp-brand__name">{BRAND_NAME}</span>
        <span className="lp-brand__tag">{BRAND_TAGLINE}</span>
      </span>
    </a>
  );

  return (
    <>
      <header className="lp-header" data-lp-stuck={String(stuck)}>
        <nav className="lp-nav" aria-label="Main">
          {brand}

          <div className="lp-nav__links">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="lp-nav__link"
                data-lp-active={String(active === link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="lp-nav__actions">
            <Link to="/login" className="lp-btn lp-btn--ghost lp-btn--sm lp-nav__cta">
              Admin login
            </Link>
            <a href="#download" className="lp-btn lp-btn--primary lp-btn--sm">
              Get the app
              <ArrowRight size={16} strokeWidth={2.5} className="lp-btn__icon" />
            </a>
            <button
              type="button"
              className="lp-burger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={18} strokeWidth={2.4} />
            </button>
          </div>
        </nav>
      </header>

      {open ? (
        <div className="lp-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="lp-drawer__panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {brand}
              <span style={{ flex: 1 }} />
              <button
                type="button"
                className="lp-burger"
                style={{ display: 'inline-flex' }}
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="lp-drawer__link"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  <ArrowRight size={17} strokeWidth={2.2} color="#608070" />
                </a>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1.5rem' }}>
              <a
                href="#download"
                className="lp-btn lp-btn--primary"
                onClick={() => setOpen(false)}
              >
                Get the app
              </a>
              <Link to="/login" className="lp-btn lp-btn--ghost" onClick={() => setOpen(false)}>
                Admin login
              </Link>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={{ border: 0, background: 'transparent', cursor: 'default' }}
          />
        </div>
      ) : null}
    </>
  );
}
