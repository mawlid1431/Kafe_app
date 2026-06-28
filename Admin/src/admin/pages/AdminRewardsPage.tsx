import { PageHeader } from '@/admin/components/PageHeader';

const REWARD_TIERS = [
  { name: 'Bronze', min: 0, max: 499 },
  { name: 'Silver', min: 500, max: 1499 },
  { name: 'Gold', min: 1500, max: 99999 },
] as const;

const REWARD_CATALOG = [
  { id: 'r1', title: 'Free Espresso', pointsCost: 300, description: 'Any single espresso drink' },
  { id: 'r2', title: 'RM 10 Voucher', pointsCost: 800, description: 'Off your next order' },
  { id: 'r3', title: 'Free Pastry', pointsCost: 500, description: 'Croissant or tart of choice' },
  { id: 'r4', title: 'Birthday Drink', pointsCost: 0, description: 'Free on your birthday month' },
] as const;

export function AdminRewardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards"
        description="Loyalty tiers and redemption catalog — mirrored from the mobile app. Edit user points on the Users page."
      />

      <div className="admin-card animate-page">
        <h2 className="text-sm font-semibold text-coffee-dark">Membership tiers</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {REWARD_TIERS.map((tier) => (
            <div key={tier.name} className="rounded-xl border border-outline-variant/40 bg-cream/40 p-4 transition hover:border-primary/25 hover:shadow-soft">
              <p className="font-semibold text-primary">{tier.name}</p>
              <p className="mt-1 text-sm text-muted">
                {tier.min} – {tier.max === 99999 ? '∞' : tier.max} points
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card animate-page stagger-2">
        <h2 className="text-sm font-semibold text-coffee-dark">Redemption catalog</h2>
        <div className="mt-4 space-y-3">
          {REWARD_CATALOG.map((reward) => (
            <div key={reward.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/30 px-4 py-3 transition hover:border-primary/20 hover:bg-cream/30">
              <div>
                <p className="font-medium text-coffee-dark">{reward.title}</p>
                <p className="text-sm text-muted">{reward.description}</p>
              </div>
              <p className="text-sm font-semibold text-primary">
                {reward.pointsCost === 0 ? 'Free' : `${reward.pointsCost} pts`}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          Full rewards CMS coming soon — tiers match <code className="rounded bg-cream px-1">src/features/kafeeman/data.ts</code>.
        </p>
      </div>
    </div>
  );
}
