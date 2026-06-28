import { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { Link } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { revokeAdminSession, type AdminSession } from '@/admin/auth';
import { hasConvex } from '@/providers/ConvexProvider';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).filter(Boolean).join('') || 'A';
}

export function AdminTopbar({
  session,
  onOpenMobileNav,
  onLogout,
}: {
  session: AdminSession;
  onOpenMobileNav?: () => void;
  onLogout: () => void;
}) {
  const logoutMutation = useMutation(api.admins.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const avatarText = useMemo(() => initials(session.name), [session.name]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await revokeAdminSession(hasConvex() ? logoutMutation : undefined, session.token);
      onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/40 bg-surface/90 shadow-sm backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-2">
          {onOpenMobileNav ? (
            <button type="button" onClick={onOpenMobileNav} className="admin-btn-ghost h-11 w-11 p-0 md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          ) : null}
          <p className="truncate text-sm font-semibold text-coffee-dark">Admin Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/account"
            className="flex items-center gap-3 rounded-full border border-outline-variant/40 bg-white/80 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft"
            title="My account"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full border border-outline-variant/40 bg-primary-soft text-sm font-semibold text-primary">
              {avatarText}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-coffee-dark">{session.name}</p>
              <p className="text-[11px] text-muted">
                {session.role === 'superadmin' ? 'Super admin' : 'Staff'}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="admin-btn-ghost h-11"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{loggingOut ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
