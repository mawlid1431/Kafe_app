import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { PageHeader } from '@/admin/components/PageHeader';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

export function AdminAccountPage() {
  const adminToken = useAdminToken();
  const me = useQuery(api.admins.me, adminToken ? { adminToken } : 'skip');

  return (
    <div className="space-y-6">
      <PageHeader title="My account" description={`Your admin profile for ${BRAND_NAME}.`} />

      <div className="admin-card max-w-lg animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-lg font-semibold text-primary">
            {me?.displayName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <p className="font-semibold text-coffee-dark">{me?.displayName ?? '—'}</p>
            <p className="text-sm text-muted">@{me?.username ?? '—'}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-outline-variant/30 pb-3">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-coffee-dark">{me?.email ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-outline-variant/30 pb-3">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize text-coffee-dark">{me?.role ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Brand</dt>
            <dd className="font-medium text-coffee-dark">{BRAND_NAME} · {BRAND_TAGLINE}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
