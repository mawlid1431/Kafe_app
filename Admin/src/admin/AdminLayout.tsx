import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthProvider } from '@/admin/AdminAuthContext';
import { adminTitleForPath } from '@/admin/adminNav';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { AdminMobileNav } from '@/admin/components/AdminMobileNav';
import { AdminSidebar } from '@/admin/components/AdminSidebar';
import { AdminTopbar } from '@/admin/components/AdminTopbar';
import { clearAdminSession, getAdminSession, normalizeAdminRole } from '@/admin/auth';
import { LoadingScreen } from '@/components/BrandLoader';
import { useApiQuery } from '@/lib/useApiQuery';
import type { AdminAccount } from '@/lib/apiTypes';
import { ApiSetupNotice, hasApi } from '@/providers/ApiProvider';

const SIDEBAR_KEY = 'kafeeman.admin.sidebarCollapsed';

function getInitialCollapsed(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw === '1') return true;
    if (raw === '0') return false;
  } catch {
    // ignore
  }
  return window.matchMedia?.('(max-width: 768px)')?.matches ?? false;
}

function AdminLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle(adminTitleForPath(location.pathname));
  const [localSession, setLocalSession] = useState(() => getAdminSession());
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Returns null on 401 — an expired or revoked session logs the dashboard out.
  const validated = useApiQuery<AdminAccount>(localSession?.token ? '/admin/auth/me' : null);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (validated === null && localSession) {
      clearAdminSession();
      setLocalSession(null);
    }
  }, [validated, localSession]);

  if (!localSession) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (validated === undefined) {
    return (
      <LoadingScreen
        full
        title="Verifying your session"
        hint="Checking your admin credentials…"
      />
    );
  }

  if (validated === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const session = {
    ...localSession,
    name: validated.displayName,
    username: validated.username,
    role: normalizeAdminRole(validated.role),
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex">
        <div className="sticky top-0 hidden md:block">
          <AdminSidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
        </div>
        <div className="min-w-0 flex-1">
          <AdminMobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          <AdminTopbar
            session={session}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onLogout={() => {
              setLocalSession(null);
              navigate('/login', { replace: true });
            }}
          />
          <main className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5 md:p-7">
            <AdminAuthProvider adminToken={localSession.token}>
              <div key={location.pathname} className="animate-page">
                <Outlet />
              </div>
            </AdminAuthProvider>
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  if (!hasApi()) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface p-8">
        <ApiSetupNotice context="The admin dashboard" />
      </div>
    );
  }
  return <AdminLayoutInner />;
}
