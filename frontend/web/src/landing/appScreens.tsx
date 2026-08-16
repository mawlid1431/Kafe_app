/**
 * Recreations of the real Kafe Eman mobile app screens, rendered as HTML so
 * they live inside the CSS device frames the way the template shows its app
 * screenshots — except these are the actual screens, using the same menu
 * items, prices, branches, tiers and order flow as the Expo app
 * (src/features/kafeeman).
 */
import {
  Bell,
  Coffee,
  Gift,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  Search,
  Star,
  Check,
  ShoppingBag,
  Ticket,
  User,
  Wifi,
  BatteryFull,
  SignalHigh,
} from 'lucide-react';

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className="lp-app__status" style={dark ? { color: '#fff' } : undefined}>
      <span>9:41</span>
      <div className="lp-app__status-icons">
        <SignalHigh size={9} strokeWidth={2.5} />
        <Wifi size={9} strokeWidth={2.5} />
        <BatteryFull size={11} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function TabBar({ active }: { active: 'home' | 'orders' | 'rewards' | 'account' }) {
  const tabs = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'orders', label: 'Orders', Icon: Receipt },
    { key: 'rewards', label: 'Rewards', Icon: Gift },
    { key: 'account', label: 'Account', Icon: User },
  ] as const;

  return (
    <div className="lp-app__tabs">
      {tabs.map(({ key, label, Icon }) => (
        <div key={key} className="lp-app__tab" data-lp-active={String(key === active)}>
          <Icon size={13} strokeWidth={key === active ? 2.6 : 2} />
          <span>{label}</span>
          {key === active ? <span className="lp-app__tab-dot" /> : null}
        </div>
      ))}
    </div>
  );
}

/** Home / menu — mirrors the app's category pills + menu grid. */
export function HomeScreen() {
  const items = [
    { name: 'Signature Latte', price: '14.90', rating: '4.9', badge: 'Bestseller', media: '' },
    { name: 'Caramel Macchiato', price: '15.90', rating: '4.8', media: '--2' },
    { name: 'Matcha Latte', price: '15.50', rating: '4.6', media: '--3' },
    { name: 'Cold Brew', price: '13.90', rating: '4.7', badge: 'New', media: '--4' },
  ];

  return (
    <div className="lp-app">
      <StatusBar />
      <div className="lp-app__body">
        <div className="lp-app__row">
          <div>
            <p className="lp-app__greet-label">Good morning ☕</p>
            <p className="lp-app__greet-name">Hello, Aisha</p>
          </div>
          <span className="lp-app__spacer" />
          <Bell size={13} strokeWidth={2.2} color="#55635d" />
          <div className="lp-app__avatar">A</div>
        </div>

        <div className="lp-app__search">
          <Search size={9} strokeWidth={2.5} />
          <span>Search drinks, pastries…</span>
        </div>

        <div className="lp-app__promo">
          <span className="lp-app__promo-tag">BOGO50</span>
          <p className="lp-app__promo-title">Buy 1 Free 1</p>
          <p className="lp-app__promo-sub">Every Tuesday on all lattes</p>
        </div>

        <div className="lp-app__pills">
          {['All', 'Coffee', 'Tea', 'Cold', 'Pastries'].map((c, i) => (
            <span key={c} className="lp-app__pill" data-lp-active={String(i === 1)}>
              {c}
            </span>
          ))}
        </div>

        <div className="lp-app__section-title">
          <span>Popular now</span>
          <span className="lp-app__link">See all</span>
        </div>

        <div className="lp-app__grid">
          {items.map((item) => (
            <div key={item.name} className="lp-app__item">
              <div className={`lp-app__item-media lp-app__item-media${item.media}`}>
                {item.badge ? <span className="lp-app__item-badge">{item.badge}</span> : null}
                <span className="lp-app__item-fav">
                  <Heart size={8} strokeWidth={2.6} />
                </span>
              </div>
              <div className="lp-app__item-body">
                <p className="lp-app__item-name">{item.name}</p>
                <div className="lp-app__item-meta">
                  <Star size={7} strokeWidth={0} fill="#d9a521" />
                  <span>{item.rating}</span>
                </div>
                <div className="lp-app__item-foot">
                  <span className="lp-app__price">RM {item.price}</span>
                  <span className="lp-app__add">
                    <Plus size={9} strokeWidth={3} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}

/** Live order tracking — the app's map + rider sheet + status stepper. */
export function TrackingScreen() {
  return (
    <div className="lp-app">
      <div className="lp-app__map">
        <div className="lp-app__map-grid" />
        <svg className="lp-app__map-route" viewBox="0 0 300 220" preserveAspectRatio="none">
          <path d="M52 168 C 96 150, 104 96, 152 84 S 214 72, 246 44" />
        </svg>
        <span className="lp-app__pin lp-app__pin--rider" style={{ top: '36%', left: '48%' }}>
          <Coffee size={9} strokeWidth={2.6} />
        </span>
        <span className="lp-app__pin" style={{ top: '13%', left: '78%' }}>
          <MapPin size={9} strokeWidth={2.6} />
        </span>
        <div style={{ position: 'absolute', top: 13, left: 14, right: 14 }}>
          <StatusBar />
        </div>
      </div>

      <div className="lp-app__sheet">
        <div className="lp-app__sheet-handle" />
        <div className="lp-app__eta">
          <div>
            <p className="lp-app__greet-label">Arriving in</p>
            <p className="lp-app__greet-name">8 min</p>
          </div>
          <span className="lp-app__spacer" />
          <span className="lp-app__eta-badge">On the way</span>
        </div>

        <div className="lp-app__steps">
          {[true, true, true, false].map((done, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i === arr.length - 1 ? '0 0 auto' : 1 }}>
              <span className="lp-app__step-dot" data-lp-done={String(done)}>
                <Check size={8} strokeWidth={3.4} />
              </span>
              {i < arr.length - 1 ? (
                <span className="lp-app__step-line" data-lp-done={String(arr[i + 1])} />
              ) : null}
            </div>
          ))}
        </div>
        <p className="lp-app__greet-label" style={{ marginTop: 6 }}>
          Confirmed · Brewing · Picked up · Delivered
        </p>

        <div className="lp-app__rider">
          <div className="lp-app__rider-pic">FZ</div>
          <div style={{ minWidth: 0 }}>
            <p className="lp-app__item-name">Faiz Rahman</p>
            <p className="lp-app__item-meta" style={{ marginTop: 1 }}>
              Rider · Plate WXY 4821
            </p>
          </div>
          <span className="lp-app__spacer" />
          <span className="lp-app__icon-btn">
            <MessageCircle size={11} strokeWidth={2.4} />
          </span>
          <span className="lp-app__icon-btn">
            <Phone size={11} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Rewards — real tiers (Bronze/Silver/Gold) and catalog costs. */
export function RewardsScreen() {
  const rewards = [
    { title: 'Free Espresso', sub: 'Any single espresso drink', cost: '300 pts', Icon: Coffee },
    { title: 'RM 10 Voucher', sub: 'Off your next order', cost: '800 pts', Icon: Ticket },
    { title: 'Free Pastry', sub: 'Croissant or tart', cost: '500 pts', Icon: Gift },
  ];

  return (
    <div className="lp-app">
      <StatusBar />
      <div className="lp-app__body">
        <div className="lp-app__row">
          <p className="lp-app__greet-name">Rewards</p>
          <span className="lp-app__spacer" />
          <Bell size={13} strokeWidth={2.2} color="#55635d" />
        </div>

        <div className="lp-app__points-card">
          <p style={{ fontSize: 8.5, opacity: 0.78 }}>Your points</p>
          <p className="lp-app__points-value">1,020</p>
          <p style={{ fontSize: 8, opacity: 0.78, marginTop: 3 }}>Silver · 480 pts to Gold</p>
          <div className="lp-app__tier-bar">
            <span className="lp-app__tier-fill" />
          </div>
        </div>

        <div className="lp-app__section-title">
          <span>Redeem</span>
          <span className="lp-app__link">Catalog</span>
        </div>

        {rewards.map(({ title, sub, cost, Icon }) => (
          <div key={title} className="lp-app__reward-row">
            <span className="lp-app__reward-icon">
              <Icon size={12} strokeWidth={2.3} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p className="lp-app__item-name">{title}</p>
              <p className="lp-app__item-meta" style={{ marginTop: 1 }}>
                {sub}
              </p>
            </div>
            <span className="lp-app__spacer" />
            <span className="lp-app__cost">{cost}</span>
          </div>
        ))}
      </div>
      <TabBar active="rewards" />
    </div>
  );
}

/** Checkout — real cart maths in RM, matching the app's order summary. */
export function CheckoutScreen() {
  return (
    <div className="lp-app">
      <StatusBar />
      <div className="lp-app__body">
        <p className="lp-app__greet-name">Your order</p>
        <p className="lp-app__greet-label" style={{ marginTop: 2 }}>
          Kafe Eman · Alor Setar
        </p>

        <div className="lp-app__reward-row" style={{ marginTop: 10 }}>
          <span className="lp-app__reward-icon">
            <Coffee size={12} strokeWidth={2.3} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p className="lp-app__item-name">Signature Latte ×2</p>
            <p className="lp-app__item-meta" style={{ marginTop: 1 }}>
              Large · Oat milk
            </p>
          </div>
          <span className="lp-app__spacer" />
          <span className="lp-app__price">RM 29.80</span>
        </div>

        <div className="lp-app__reward-row">
          <span className="lp-app__reward-icon">
            <ShoppingBag size={12} strokeWidth={2.3} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p className="lp-app__item-name">Croissant</p>
            <p className="lp-app__item-meta" style={{ marginTop: 1 }}>
              Freshly baked
            </p>
          </div>
          <span className="lp-app__spacer" />
          <span className="lp-app__price">RM 8.50</span>
        </div>

        <div style={{ marginTop: 10 }}>
          <div className="lp-app__line">
            <span>Subtotal</span>
            <span>RM 38.30</span>
          </div>
          <div className="lp-app__line">
            <span>Delivery</span>
            <span>RM 4.00</span>
          </div>
          <div className="lp-app__line" style={{ color: '#608070' }}>
            <span>Promo WELCOME10</span>
            <span>− RM 3.83</span>
          </div>
          <div className="lp-app__line lp-app__line--total">
            <span>Total</span>
            <span>RM 38.47</span>
          </div>
        </div>

        <div className="lp-app__pay">
          <span className="lp-app__radio" />
          <span>Card ···· 4821</span>
          <span className="lp-app__spacer" />
          <span style={{ fontSize: 8, color: '#4d6359', fontWeight: 600 }}>Change</span>
        </div>

        <div className="lp-app__cta">Place order · RM 38.47</div>
      </div>
    </div>
  );
}

/** Order-confirmed stamp — the app's success state. */
export function SuccessScreen() {
  return (
    <div className="lp-app">
      <StatusBar />
      <div className="lp-app__body lp-app__body--flush">
        <div className="lp-app__success">
          <span className="lp-app__success-ring">
            <Check size={26} strokeWidth={3} />
          </span>
          <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Order confirmed</p>
          <p style={{ fontSize: 9, color: '#7c8a84', lineHeight: 1.5 }}>
            KE-20250620-4821 is being brewed at Alor Setar. You earned 32 points.
          </p>
          <span className="lp-app__eta-badge" style={{ marginTop: 2 }}>
            +32 points
          </span>
        </div>
      </div>
      <TabBar active="orders" />
    </div>
  );
}

/** The admin dashboard, shown inside the laptop frame. */
export function AdminDashboardScreen() {
  const nav = ['Dashboard', 'Orders', 'Menu', 'Branches', 'Promos', 'Rewards', 'Users'];
  const cards = [
    { label: "Today's orders", value: '128' },
    { label: 'Revenue', value: 'RM 4.2k' },
    { label: 'Active users', value: '2,410' },
    { label: 'Avg. prep', value: '6m' },
  ];
  const bars = [42, 58, 36, 74, 62, 88, 70, 95, 64, 80, 52, 76];

  return (
    <div className="lp-dash">
      <aside className="lp-dash__side">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <span style={{ height: 14, width: 14, borderRadius: 5, background: '#608070' }} />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Kafe Eman</span>
        </div>
        {nav.map((item, i) => (
          <div key={item} className="lp-dash__nav-item" data-lp-active={String(i === 0)}>
            <span className="lp-dash__nav-dot" />
            <span>{item}</span>
          </div>
        ))}
      </aside>

      <main className="lp-dash__main">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Dashboard</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: 100,
              background: '#e4ebe6',
              color: '#3d5249',
              fontSize: 7,
              fontWeight: 600,
            }}
          >
            ● Live
          </span>
        </div>

        <div className="lp-dash__cards">
          {cards.map((c) => (
            <div key={c.label} className="lp-dash__card">
              <p style={{ fontSize: 7, color: '#7c8a84', fontWeight: 500 }}>{c.label}</p>
              <p className="lp-dash__card-value">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="lp-dash__panel">
          <p style={{ fontSize: 8.5, fontWeight: 600 }}>Orders this week</p>
          <div className="lp-dash__chart">
            {bars.map((h, i) => (
              <span
                key={i}
                className="lp-dash__bar"
                style={{ height: `${h}%`, animationDelay: `${i * 55}ms` }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
