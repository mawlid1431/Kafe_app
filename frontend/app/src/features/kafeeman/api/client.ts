/**
 * REST client for the Kafe Eman API.
 *
 * Auth comes from Clerk: `ApiProvider` registers a token getter here, so call
 * sites never touch tokens themselves.
 */

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';

/** Trailing slashes would produce `//api/...` paths. */
export const API_URL = rawBaseUrl.replace(/\/+$/, '');

export const isApiEnabled = API_URL.length > 0;

/**
 * Clerk JWT template name, from `EXPO_PUBLIC_CLERK_JWT_TEMPLATE`.
 *
 * The app requests a token from this template; the API verifies the resulting
 * `aud` claim against `CLERK_JWT_AUDIENCE`. The two must always name the same
 * template, so both are configured rather than hardcoded — change one and you
 * must change the other.
 */
export const CLERK_JWT_TEMPLATE = process.env.EXPO_PUBLIC_CLERK_JWT_TEMPLATE?.trim() ?? '';

type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter | null): void {
  getToken = getter;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attach the Clerk bearer token. Default false — most catalog reads are public. */
  auth?: boolean;
  signal?: AbortSignal;
};

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload?.message) return payload.message;
  } catch {
    // Fall through.
  }
  return `Request failed (${response.status})`;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isApiEnabled) {
    throw new ApiError('API is not configured. Set EXPO_PUBLIC_API_URL.', 0);
  }

  const { method = 'GET', body, auth = false, signal } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = await getToken?.();
    if (!token) {
      throw new ApiError('Not authenticated', 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
