import { useAdminToken } from '@/admin/AdminAuthContext';
import { PageHeader } from '@/admin/components/PageHeader';
import { useApiQuery } from '@/lib/useApiQuery';
import type { AdminAccount } from '@/lib/apiTypes';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

export function AdminAccountPage() {
  const adminToken = useAdminToken();
  const me = useApiQuery<AdminAccount>(adminToken ? '/admin/auth/me' : null);

  return (
    <div className="space-y-6">
      <PageHeader title="My account" description={`Your admin profile for ${BRAND_NAME}.`} />

      <div className="admin-card w-full max-w-lg animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-lg font-semibold text-primary sm:h-14 sm:w-14">
            {me?.displayName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-coffee-dark">{me?.displayName ?? '—'}</p>
            <p className="truncate text-sm text-muted">@{me?.username ?? '—'}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-3 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium break-all text-coffee-dark sm:text-right">{me?.email ?? '—'}</dd>
          </div>
          <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-3 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize text-coffee-dark">{me?.role ?? '—'}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted">Brand</dt>
            <dd className="font-medium text-coffee-dark">{BRAND_NAME} · {BRAND_TAGLINE}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
