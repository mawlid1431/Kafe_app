const STORAGE_KEY = 'kafeeman.admin.session';

/**
 * Read directly from the environment rather than importing apiClient — that
 * module imports this one for the bearer token, and a cycle would break HMR.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';

export type AdminRole = 'superadmin' | 'staff';

export function normalizeAdminRole(role: string): AdminRole {
  if (role === 'superadmin') return 'superadmin';
  return 'staff';
}

export type AdminSession = {
  token: string;
  name: string;
  username: string;
  role: AdminRole;
  expiresAt: number;
  createdAt: number;
};

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (
      !parsed ||
      typeof parsed.token !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }
    if (parsed.expiresAt < Date.now()) {
      clearAdminSession();
      return null;
    }
    return {
      ...parsed,
      role: normalizeAdminRole(String(parsed.role)),
    };
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Revokes the session server-side, then clears it locally.
 *
 * The local session is cleared even if the network call fails — a user who
 * clicked "log out" must end up logged out of this browser regardless.
 */
export async function revokeAdminSession(token?: string) {
  const sessionToken = token ?? getAdminSession()?.token;
  if (sessionToken && API_URL) {
    try {
      await fetch(`${API_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
    } catch {
      // Local session still cleared below.
    }
  }
  clearAdminSession();
}
