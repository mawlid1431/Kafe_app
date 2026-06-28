import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';
import {
  clearAdminSession,
  getAdminSession,
  normalizeAdminRole,
  setAdminSession,
} from '@/admin/auth';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { ConvexSetupNotice, hasConvex } from '@/providers/ConvexProvider';

function AdminLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useMutation(api.admins.login);

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
      <div className="admin-login-bg grid min-h-screen place-items-center text-sm text-muted">
        <div className="admin-skeleton h-4 w-32" />
      </div>
    );
  }

  if (localSession && validated) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  return (
    <div className="admin-login-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-12">
        <div className="admin-glass-card w-full animate-scale-in">
          <div className="mb-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-outline-variant/40 bg-gradient-to-br from-primary-soft to-white text-primary shadow-float transition-transform duration-300 hover:scale-105">
              <span className="font-display text-lg font-bold">KE</span>
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-coffee-dark">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to manage {BRAND_NAME}</p>
            <p className="mt-0.5 text-xs tracking-wide text-primary/80">{BRAND_TAGLINE}</p>
          </div>

          <form
            className="grid gap-5"
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
            <AdminFormField label="Username">
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="admin-input pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </AdminFormField>

            <AdminFormField label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="admin-input pl-10 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-coffee-title transition hover:bg-cream hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </AdminFormField>

            {error && (
              <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="admin-btn w-full py-3" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to Admin'}
            </button>
            <p className="text-center text-xs text-muted">Default after seed: <span className="font-medium text-coffee-title">admin</span> / <span className="font-medium text-coffee-title">admin123</span></p>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminLoginPage() {
  if (!hasConvex()) {
    return (
      <div className="admin-login-bg grid min-h-screen place-items-center p-8">
        <ConvexSetupNotice context="Admin login" />
      </div>
    );
  }
  return <AdminLoginForm />;
}
