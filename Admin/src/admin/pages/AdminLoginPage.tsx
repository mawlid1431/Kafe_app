import { useEffect, useId, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, User } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { BRAND_LOGO_URL, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';
import {
  clearAdminSession,
  getAdminSession,
  normalizeAdminRole,
  setAdminSession,
} from '@/admin/auth';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { AdminIconInput, AdminPasswordToggle } from '@/admin/components/AdminIconInput';
import { ConvexSetupNotice, hasConvex } from '@/providers/ConvexProvider';

function AdminLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useMutation(api.admins.login);
  const formId = useId();
  const usernameId = `${formId}-username`;
  const passwordId = `${formId}-password`;

  const [localSession, setLocalSession] = useState(() => getAdminSession());
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validated = useQuery(
    api.admins.validateSession,
    localSession?.token ? { adminToken: localSession.token } : 'skip',
  );

  useEffect(() => {
    setLocalSession(getAdminSession());
  }, [location.key]);

  useEffect(() => {
    if (validated !== null || !localSession) return;
    clearAdminSession();
    setLocalSession(null);
  }, [validated, localSession]);

  if (localSession && validated === undefined) {
    return (
      <div className="admin-login-bg admin-login-shell grid place-items-center">
        <div className="admin-skeleton h-4 w-32" />
        <p className="mt-3 text-sm text-muted">Checking session…</p>
      </div>
    );
  }

  if (localSession && validated) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  return (
    <div className="admin-login-bg admin-login-shell">
      <div className="admin-login-container">
        <div className="admin-glass-card admin-login-card w-full animate-scale-in">
          <header className="admin-login-header">
            <div className="admin-login-logo-wrap">
              <img
                src={BRAND_LOGO_URL}
                alt={`${BRAND_NAME} logo`}
                className="admin-login-logo"
                width={64}
                height={64}
                decoding="async"
              />
            </div>
            <h1 className="admin-login-title">Welcome back</h1>
            <p className="admin-login-subtitle">Sign in to manage {BRAND_NAME}</p>
            <p className="admin-login-tagline">{BRAND_TAGLINE}</p>
          </header>

          <form
            id={formId}
            className="grid gap-4 sm:gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const result = await login({ username, password });
                const session = {
                  token: result.token,
                  name: result.admin.displayName,
                  username: result.admin.username,
                  role: normalizeAdminRole(result.admin.role),
                  expiresAt: result.expiresAt,
                  createdAt: Date.now(),
                };
                setAdminSession(session);
                setLocalSession(session);
                navigate(from, { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Invalid username or password.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <AdminFormField label="Username" htmlFor={usernameId}>
              <AdminIconInput
                id={usernameId}
                name="username"
                icon={<User className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                placeholder="Enter admin username"
                required
              />
            </AdminFormField>

            <AdminFormField label="Password" htmlFor={passwordId}>
              <AdminIconInput
                id={passwordId}
                name="password"
                icon={<Lock className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                trailing={
                  <AdminPasswordToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    inputId={passwordId}
                  />
                }
              />
            </AdminFormField>

            {error ? (
              <div
                className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-snug text-red-700 sm:px-4 sm:py-3"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            ) : null}

            <button type="submit" className="admin-btn admin-login-submit w-full" disabled={loading}>
              <LogIn className="h-4 w-4 shrink-0" aria-hidden />
              <span>{loading ? 'Signing in…' : 'Sign in to Admin'}</span>
            </button>

            <div className="admin-login-demo" aria-label="Demo login credentials">
              <p className="admin-login-demo-label">Demo after seed</p>
              <div className="admin-login-demo-values">
                <span className="admin-login-demo-chip">
                  <User className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  admin
                </span>
                <span className="admin-login-demo-chip">
                  <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  admin123
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminLoginPage() {
  if (!hasConvex()) {
    return (
      <div className="admin-login-bg admin-login-shell grid place-items-center p-4 sm:p-8">
        <ConvexSetupNotice context="Admin login" />
      </div>
    );
  }
  return <AdminLoginForm />;
}
