const STORAGE_KEY = 'kafeeman.admin.session';

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

export async function revokeAdminSession(
  logoutMutation?: (args: { adminToken: string }) => Promise<unknown>,
  token?: string,
) {
  const sessionToken = token ?? getAdminSession()?.token;
  if (logoutMutation && sessionToken) {
    try {
      await logoutMutation({ adminToken: sessionToken });
    } catch {
      // Local session still cleared.
    }
  }
  clearAdminSession();
}
