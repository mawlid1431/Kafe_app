import { useEffect } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Apple,
  BadgePercent,
  Bell,
  Clock,
  Coffee,
  Facebook,
  Gift,
  Instagram,
  Leaf,
  Linkedin,
  MapPin,
  Play,
  Radio,
  Route,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Check,
  Twitter,
  Users,
} from 'lucide-react';
import { BRAND_LOGO_URL, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';
import { LandingNav } from './LandingNav';
import { Odometer } from './Odometer';
import { Reveal } from './Reveal';
import { InteractivePhone, LaptopMockup, PhoneMockup } from './devices';
import {
  AdminDashboardScreen,
  CheckoutScreen,
  HomeScreen,
  RewardsScreen,
  SuccessScreen,
  TrackingScreen,
} from './appScreens';
import { useReveal } from './useReveal';
import './landing.css';

/* ── Content — all copy describes the real Kafe Eman product ────────── */

const HERO_BULLETS = [
  'Order ahead and skip the queue entirely',
  'Track your rider live, door to door',
  'Earn points on every single cup',
];

/**
 * Figures taken straight from the app's own catalogue (src/features/kafeeman
 * /data.ts) so nothing here overstates the product: 10 menu items across 7
 * categories, 4 redeemable rewards, 3 branches, top drink rated 4.9.
 */
const STATS = [
  { value: '10', label: 'Drinks & bites on the menu' },
  { value: '7', label: 'Menu categories' },
  { value: '4', label: 'Rewards to redeem' },
  { value: '3', label: 'Branches nationwide' },
];

const FEATURES = [
  {
    Icon: ShoppingBag,
    title: 'Order ahead & pickup',
    body: 'Build your drink exactly how you like it, pay in the app, and collect it at the counter without waiting.',
  },
  {
    Icon: Route,
    title: 'Live order tracking',
    body: 'Watch every stage — confirmed, brewing, picked up, delivered — on a live map with your rider’s ETA.',
  },
  {
    Icon: Gift,
    title: 'Loyalty that adds up',
    body: 'Collect points on every order and climb Bronze, Silver and Gold tiers for free drinks and pastries.',
  },
  {
    Icon: BadgePercent,
    title: 'Promos & vouchers',
    body: 'Buy 1 Free 1 Tuesdays, birthday drinks and weekend double points, applied automatically at checkout.',
  },
];

const STEPS = [
  {
    step: 'Step 1',
    title: 'Create your account',
    body: 'Sign up in under a minute with Apple, Google or your email. Your favourites and addresses sync instantly.',
    points: ['One-tap Apple & Google sign in', 'Save delivery addresses', 'Set your home branch'],
    screen: <HomeScreen />,
  },
  {
    step: 'Step 2',
    title: 'Build your order',
    body: 'Browse the full menu, customise milk, size and sweetness, then let promo codes apply themselves.',
    points: ['Real menu, live prices in RM', 'Customise every drink', 'Promos applied automatically'],
    screen: <CheckoutScreen />,
  },
  {
    step: 'Step 3',
    title: 'Track it to your door',
    body: 'Follow your rider on the map, message them in-app, and collect points the moment the order lands.',
    points: ['Live map & rider ETA', 'In-app rider chat', 'Points credited instantly'],
    screen: <TrackingScreen />,
  },
];

const WHY = [
  { Icon: Clock, title: 'Ready when you are', body: 'Pre-order and your coffee is brewing before you park.' },
  { Icon: Radio, title: 'Always live', body: 'Real-time order status straight from the branch counter.' },
  { Icon: Leaf, title: 'Freshly roasted', body: 'Beans roasted weekly, pastries baked every morning.' },
  { Icon: ShieldCheck, title: 'Secure checkout', body: 'Encrypted card payments with saved-card convenience.' },
];

const REVIEWS = [
  { title: 'My morning routine, fixed', body: 'I order from the car park and it is on the counter when I walk in. Never queue again.', name: 'Aisha Rahman', role: 'Teacher, Alor Setar', tint: '#608070' },
  { title: 'The tracking is addictive', body: 'Watching the rider move on the map is oddly satisfying, and the ETA is always accurate.', name: 'Daniel Lim', role: 'Designer, Penang', tint: '#8d7355' },
  { title: 'Free drinks add up fast', body: 'Hit Silver in a month. The Tuesday Buy 1 Free 1 alone pays for the habit.', name: 'Nurul Huda', role: 'Nurse, Kuala Lumpur', tint: '#4d6359' },
  { title: 'Best matcha in town', body: 'Ordering the matcha latte with oat milk takes three taps. The app remembers everything.', name: 'Wei Jie Tan', role: 'Engineer, Penang', tint: '#a08256' },
  { title: 'Our team runs on it', body: 'We do a group order every standup. Splitting and reordering is genuinely effortless.', name: 'Farah Idris', role: 'Team lead, KL', tint: '#6b7a74' },
  { title: 'Pickup is flawless', body: 'Pickup orders are ready to the minute and the staff already know my name.', name: 'Arif Zaki', role: 'Student, Alor Setar', tint: '#7d9a83' },
];

const BRANCHES = [
  { city: 'Alor Setar', detail: 'Jalan Sultanah · 7am – 11pm' },
  { city: 'Penang', detail: 'Georgetown · 8am – 12am' },
  { city: 'Kuala Lumpur', detail: 'Bukit Bintang · 7am – 1am' },
];

const MARQUEE_WORDS = ['Brew', 'Sip', 'Enjoy', 'Order ahead', 'Live tracking', 'Earn points', 'Freshly roasted'];

/* ── Small building blocks ──────────────────────────────────────────── */

function StoreBadges() {
  return (
    <>
      <a href="#download" className="lp-store">
        <Apple size={20} strokeWidth={2} fill="currentColor" />
        <span>
          <span className="lp-store__kicker">Download on the</span>
          <span className="lp-store__name">App Store</span>
        </span>
      </a>
      <a href="#download" className="lp-store">
        <Play size={18} strokeWidth={2} fill="currentColor" />
        <span>
          <span className="lp-store__kicker">Get it on</span>
          <span className="lp-store__name">Google Play</span>
        </span>
      </a>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`lp-head${align === 'left' ? ' lp-head--left' : ''}`}>
      <Reveal kind="fade" className="lp-head__eyebrow">
        <span className="lp-eyebrow lp-eyebrow--plain">{eyebrow}</span>
      </Reveal>
      <Reveal kind="rise" delay={90}>
        <h2 className="lp-h2">{title}</h2>
      </Reveal>
      {lead ? (
        <Reveal kind="rise" delay={180} className="lp-head__lead">
          <p className="lp-lead">{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export function LandingPage() {
  useReveal();

  // The admin app is a single-page shell; make sure the public page always
  // opens at the top and restore the document title on unmount.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${BRAND_NAME} — order ahead, track live, earn rewards`;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="lp-root" id="top">
      <a href="#main" className="lp-skip">
        Skip to content
      </a>

      <LandingNav />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="lp-hero">
          <div className="lp-hero__bg" />
          <div className="lp-hero__grid-overlay" />
          <span className="lp-blob lp-blob--1" />
          <span className="lp-blob lp-blob--2" />

          <div className="lp-hero__inner">
            <div>
              <Reveal kind="fade">
                <span className="lp-eyebrow">
                  <span className="lp-eyebrow-dot" />
                  Now brewing in Alor Setar, Penang & KL
                </span>
              </Reveal>

              <Reveal kind="rise" delay={110}>
                <h1 className="lp-h1" style={{ marginTop: '1.5rem' }}>
                  Your favourite coffee, <span className="lp-shine">ready before you arrive</span>
                </h1>
              </Reveal>

              <Reveal kind="rise" delay={200}>
                <div className="lp-hero__bullets">
                  {HERO_BULLETS.map((text) => (
                    <p key={text} className="lp-hero__bullet">
                      <span className="lp-hero__tick">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      {text}
                    </p>
                  ))}
                </div>
              </Reveal>

              <Reveal kind="rise" delay={290}>
                <div className="lp-hero__actions">
                  <StoreBadges />
                </div>
              </Reveal>

              <Reveal kind="fade" delay={400}>
                <div className="lp-hero__proof">
                  <div className="lp-avatars">
                    {[
                      { i: 'AR', c: '#608070' },
                      { i: 'DL', c: '#8d7355' },
                      { i: 'NH', c: '#4d6359' },
                      { i: 'WT', c: '#a08256' },
                    ].map((a) => (
                      <span key={a.i} style={{ background: a.c }}>
                        {a.i}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 2, color: '#d9a521' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={13} strokeWidth={0} fill="currentColor" />
                      ))}
                    </div>
                    <p className="lp-small" style={{ marginTop: 2 }}>
                      4.7 average rating across the menu
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Rotating device — the template's showcase treatment */}
            <Reveal kind="device" className="lp-hero__devices">
              <div className="lp-chip lp-chip--tl">
                <Coffee size={17} strokeWidth={2.2} color="#608070" />
                <span>
                  <span className="lp-chip__label">Brewing now</span>
                  <span className="lp-chip__value">Signature Latte</span>
                </span>
              </div>

              <div className="lp-chip lp-chip--bl">
                <Gift size={17} strokeWidth={2.2} color="#d9a521" />
                <span>
                  <span className="lp-chip__label">Points earned</span>
                  <span className="lp-chip__value">+32 pts</span>
                </span>
              </div>

              <div className="lp-chip lp-chip--br">
                <Route size={17} strokeWidth={2.2} color="#608070" />
                <span>
                  <span className="lp-chip__label">Arriving in</span>
                  <span className="lp-chip__value">8 min</span>
                </span>
              </div>

              <InteractivePhone
                width={310}
                screens={[
                  { key: 'home', label: 'Menu', node: <HomeScreen /> },
                  { key: 'checkout', label: 'Checkout', node: <CheckoutScreen /> },
                  { key: 'tracking', label: 'Live tracking', node: <TrackingScreen /> },
                  { key: 'rewards', label: 'Rewards', node: <RewardsScreen /> },
                  { key: 'success', label: 'Confirmed', node: <SuccessScreen /> },
                ]}
              />
            </Reveal>
          </div>
        </section>

        {/* ── Word marquee divider ─────────────────────────────── */}
        <div className="lp-divider-marquee" aria-hidden>
          <div className="lp-divider-marquee__track">
            {[0, 1].map((copy) => (
              <span key={copy} className="lp-divider-marquee__item">
                {MARQUEE_WORDS.map((word) => (
                  <span key={word} style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5rem' }}>
                    {word}
                    <Coffee size={15} strokeWidth={2.4} color="#608070" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats (odometer) ─────────────────────────────────── */}
        <section className="lp-section lp-section--cream">
          <div className="lp-shell">
            <Reveal kind="rise">
              <h3 className="lp-h3" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                A neighbourhood café, running on one app
              </h3>
            </Reveal>
            <Reveal kind="fade" delay={120}>
              <div className="lp-stats">
                {STATS.map((s) => (
                  <Odometer key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="lp-section lp-section--white" id="features">
          <div className="lp-shell">
            <SectionHead
              eyebrow="What the app does"
              title={`Everything ${BRAND_NAME} delivers`}
              lead="From the first tap to the last sip — ordering, tracking and rewards in one place, built on a live backend that the café manages in real time."
            />

            <div className="lp-grid-4">
              {FEATURES.map(({ Icon, title, body }, i) => (
                <Reveal key={title} kind="rise" delay={i * 110}>
                  <article className="lp-card lp-card--hover" style={{ height: '100%' }}>
                    <span className="lp-card__icon">
                      <Icon size={24} strokeWidth={2.1} />
                    </span>
                    <h3 className="lp-h4" style={{ marginTop: '1.35rem' }}>
                      {title}
                    </h3>
                    <p className="lp-body" style={{ marginTop: '0.6rem', fontSize: '0.9375rem' }}>
                      {body}
                    </p>
                    <span className="lp-card__sweep" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works — sticky step scroller ──────────────── */}
        <section className="lp-section lp-section--cream" id="how">
          <div className="lp-shell">
            <SectionHead
              eyebrow="How it works"
              title="Three taps to your table"
              lead="The whole flow, exactly as it works in the app today."
            />

            <div className="lp-steps">
              {STEPS.map((s, i) => (
                <div key={s.step} className="lp-step">
                  <div className={`lp-split${i % 2 === 1 ? ' lp-split--reverse' : ''}`}>
                    <Reveal kind={i % 2 === 1 ? 'right' : 'left'}>
                      <div className="lp-step--sticky">
                        <span className="lp-step__num">{s.step}</span>
                        <h3 className="lp-h3" style={{ marginTop: '0.9rem' }}>
                          {s.title}
                        </h3>
                        <p className="lp-lead" style={{ marginTop: '0.9rem' }}>
                          {s.body}
                        </p>
                        <div className="lp-step__list">
                          {s.points.map((p) => (
                            <p key={p} className="lp-step__item">
                              <span className="lp-hero__tick">
                                <Check size={12} strokeWidth={3} />
                              </span>
                              {p}
                            </p>
                          ))}
                        </div>
                        {i === 0 ? (
                          <a
                            href="#download"
                            className="lp-btn lp-btn--dark"
                            style={{ marginTop: '2rem' }}
                          >
                            Get started
                            <ArrowRight size={17} strokeWidth={2.5} className="lp-btn__icon" />
                          </a>
                        ) : null}
                      </div>
                    </Reveal>

                    <Reveal
                      kind="device"
                      delay={140}
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <PhoneMockup width={286} float>
                        {s.screen}
                      </PhoneMockup>
                    </Reveal>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform: app + admin dashboard ─────────────────── */}
        <section className="lp-section lp-section--white" id="platform">
          <div className="lp-shell">
            <SectionHead
              eyebrow="One connected platform"
              title="The app your customers love, the dashboard your team runs"
              lead="Every order placed in the app lands instantly in the Kafe Eman admin dashboard — menu, branches, promos, rewards and live order queues, all in sync."
            />

            <Reveal kind="zoom" delay={120} className="lp-cluster">
              <LaptopMockup>
                <AdminDashboardScreen />
              </LaptopMockup>
              <div className="lp-cluster__phone">
                <PhoneMockup width={190} float>
                  <RewardsScreen />
                </PhoneMockup>
              </div>
            </Reveal>

            <div className="lp-grid-4" style={{ marginTop: '4rem' }}>
              {[
                { Icon: Store, title: 'Branch control', body: 'Hours, stock and pickup availability per outlet.' },
                { Icon: Coffee, title: 'Live menu', body: 'Prices and categories update in the app instantly.' },
                { Icon: Bell, title: 'Push campaigns', body: 'Send promos and order updates to every device.' },
                { Icon: Users, title: 'Customer insight', body: 'Loyalty points, tiers and order history per user.' },
              ].map(({ Icon, title, body }, i) => (
                <Reveal key={title} kind="rise" delay={i * 100}>
                  <article className="lp-card lp-card--cream lp-card--hover" style={{ height: '100%' }}>
                    <span className="lp-card__icon">
                      <Icon size={22} strokeWidth={2.1} />
                    </span>
                    <h3 className="lp-h4" style={{ marginTop: '1.2rem', fontSize: '1.1875rem' }}>
                      {title}
                    </h3>
                    <p className="lp-body" style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>
                      {body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Rewards split ───────────────────────────────────── */}
        <section className="lp-section lp-section--cream" id="rewards">
          <div className="lp-shell">
            <div className="lp-split">
              <Reveal kind="left">
                <div>
                  <span className="lp-eyebrow lp-eyebrow--plain">Loyalty</span>
                  <h2 className="lp-h2" style={{ marginTop: '1.1rem' }}>
                    Every cup counts towards the next one
                  </h2>
                  <p className="lp-lead" style={{ marginTop: '1.1rem' }}>
                    Points land the moment your order completes. Climb from Bronze to Silver to Gold
                    and redeem from a catalogue of free espressos, pastries and RM vouchers.
                  </p>

                  <div className="lp-step__list" style={{ marginTop: '1.75rem' }}>
                    {[
                      'Free Espresso — 300 points',
                      'Free Pastry — 500 points',
                      'RM 10 Voucher — 800 points',
                      'Birthday drink — free every year',
                    ].map((p) => (
                      <p key={p} className="lp-step__item">
                        <span className="lp-hero__tick">
                          <Sparkles size={12} strokeWidth={2.6} />
                        </span>
                        {p}
                      </p>
                    ))}
                  </div>

                  <a href="#download" className="lp-btn lp-btn--primary" style={{ marginTop: '2rem' }}>
                    Start earning
                    <ArrowRight size={17} strokeWidth={2.5} className="lp-btn__icon" />
                  </a>
                </div>
              </Reveal>

              <Reveal kind="device" delay={140} style={{ display: 'flex', justifyContent: 'center' }}>
                <PhoneMockup width={290} float>
                  <RewardsScreen />
                </PhoneMockup>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Why choose ──────────────────────────────────────── */}
        <section className="lp-section lp-section--white">
          <div className="lp-shell">
            <SectionHead
              eyebrow="Why Kafe Eman"
              title={`Why regulars keep coming back`}
              lead={BRAND_TAGLINE}
            />
            <div className="lp-grid-4">
              {WHY.map(({ Icon, title, body }, i) => (
                <Reveal key={title} kind="zoom" delay={i * 100}>
                  <article className="lp-card lp-card--hover" style={{ height: '100%', textAlign: 'center' }}>
                    <span className="lp-card__icon" style={{ margin: '0 auto' }}>
                      <Icon size={23} strokeWidth={2.1} />
                    </span>
                    <h3 className="lp-h4" style={{ marginTop: '1.25rem', fontSize: '1.1875rem' }}>
                      {title}
                    </h3>
                    <p className="lp-body" style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>
                      {body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews marquee ─────────────────────────────────── */}
        <section className="lp-section lp-section--cream" id="reviews">
          <div className="lp-shell">
            <SectionHead
              eyebrow="Reviews"
              title="Hear from our regulars"
              lead="Real feedback from people who order every week."
            />
          </div>

          <Reveal kind="fade" delay={140}>
            <div className="lp-marquee">
              {[false, true].map((reverse) => (
                <div
                  key={String(reverse)}
                  className={`lp-marquee__track${reverse ? ' lp-marquee__track--reverse' : ''}`}
                  /* The second row repeats the same quotes purely for visual
                     density, so it is hidden from assistive tech. */
                  aria-hidden={reverse || undefined}
                >
                  {[0, 1].map((copy) => (
                    <div key={copy} style={{ display: 'flex', gap: '1.25rem' }} aria-hidden={copy === 1}>
                      {(reverse ? [...REVIEWS].reverse() : REVIEWS).map((r) => (
                        <article key={`${copy}-${r.name}`} className="lp-quote">
                          <div className="lp-quote__stars">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} size={14} strokeWidth={0} fill="currentColor" />
                            ))}
                          </div>
                          <h3 className="lp-quote__title">{r.title}</h3>
                          <p className="lp-body" style={{ fontSize: '0.9375rem' }}>
                            “{r.body}”
                          </p>
                          <div className="lp-quote__who">
                            <span className="lp-quote__pic" style={{ background: r.tint }}>
                              {r.name
                                .split(' ')
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join('')}
                            </span>
                            <span>
                              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem' }}>
                                {r.name}
                              </span>
                              <span className="lp-small">{r.role}</span>
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Branches ────────────────────────────────────────── */}
        <section className="lp-section lp-section--white" id="branches">
          <div className="lp-shell">
            <SectionHead
              eyebrow="Find us"
              title="Three branches, one app"
              lead="Pick your home branch in the app for faster pickup and accurate delivery times."
            />
            <div className="lp-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {BRANCHES.map((b, i) => (
                <Reveal key={b.city} kind="rise" delay={i * 110}>
                  <article className="lp-card lp-card--hover" style={{ height: '100%' }}>
                    <span className="lp-card__icon">
                      <MapPin size={22} strokeWidth={2.2} />
                    </span>
                    <h3 className="lp-h4" style={{ marginTop: '1.2rem', fontSize: '1.25rem' }}>
                      {b.city}
                    </h3>
                    <p className="lp-body" style={{ marginTop: '0.4rem', fontSize: '0.9375rem' }}>
                      {b.detail}
                    </p>
                    <p
                      className="lp-small"
                      style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#608070', fontWeight: 600 }}
                    >
                      Delivery & pickup
                      <ArrowUpRight size={14} strokeWidth={2.5} />
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Download CTA ────────────────────────────────────── */}
        <section className="lp-section lp-section--white" id="download" style={{ paddingTop: 0 }}>
          <div className="lp-shell">
            <Reveal kind="zoom">
              <div className="lp-cta">
                <div className="lp-cta__grid" />
                <span className="lp-eyebrow lp-eyebrow--plain" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>
                  Free to download
                </span>
                <h2 className="lp-h2" style={{ marginTop: '1.25rem', maxWidth: 680, marginInline: 'auto' }}>
                  Get {BRAND_NAME} and order your next cup
                </h2>
                <p
                  className="lp-lead"
                  style={{ color: 'rgba(255,255,255,0.78)', marginTop: '1.1rem', maxWidth: 560, marginInline: 'auto' }}
                >
                  Available on iOS and Android. Sign in once, and your favourites, points and
                  addresses follow you everywhere.
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    marginTop: '2.25rem',
                  }}
                >
                  <a href="#download" className="lp-btn lp-btn--light">
                    <Apple size={19} strokeWidth={2} fill="currentColor" />
                    App Store
                  </a>
                  <a href="#download" className="lp-btn lp-btn--light">
                    <Play size={17} strokeWidth={2} fill="currentColor" />
                    Google Play
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-shell">
          <div className="lp-footer__grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img src={BRAND_LOGO_URL} alt="" className="lp-brand__mark" width={40} height={40} />
                <span>
                  <span className="lp-brand__name" style={{ color: '#fff' }}>
                    {BRAND_NAME}
                  </span>
                  <span className="lp-brand__tag">{BRAND_TAGLINE}</span>
                </span>
              </div>
              <p style={{ marginTop: '1.25rem', maxWidth: 300, lineHeight: 1.75, fontSize: '0.9375rem' }}>
                Freshly roasted coffee, ordered ahead and tracked to your door across Alor Setar,
                Penang and Kuala Lumpur.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#top" className="lp-footer__social" aria-label="Social link">
                    <Icon size={16} strokeWidth={2.2} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="lp-footer__title">App</p>
              <a href="#features" className="lp-footer__link">Features</a>
              <a href="#how" className="lp-footer__link">How it works</a>
              <a href="#rewards" className="lp-footer__link">Rewards</a>
              <a href="#download" className="lp-footer__link">Download</a>
            </div>

            <div>
              <p className="lp-footer__title">Branches</p>
              {BRANCHES.map((b) => (
                <a key={b.city} href="#top" className="lp-footer__link">
                  {b.city}
                </a>
              ))}
            </div>

            <div>
              <p className="lp-footer__title">Company</p>
              <a href="#reviews" className="lp-footer__link">Reviews</a>
              <a href="#platform" className="lp-footer__link">Platform</a>
              <a href="#download" className="lp-footer__link">Download</a>
            </div>
          </div>

          <p className="lp-footer__watermark" aria-hidden>
            {BRAND_NAME}
          </p>

          <div className="lp-footer__bar">
            <span>
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coffee size={15} strokeWidth={2.3} color="#608070" />
              {BRAND_TAGLINE}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
