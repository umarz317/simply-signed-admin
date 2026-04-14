'use client';

const TOKEN_STORAGE_KEY = 'simply-signed-admin-token';
const USER_STORAGE_KEY = 'simply-signed-admin-user';

export type StoredAdminUser = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getStoredUser(): StoredAdminUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAdminUser;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function storeUser(user?: StoredAdminUser | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearToken() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function buildAuthHeaders(baseHeaders?: HeadersInit): HeadersInit {
  const token = getStoredToken();
  const headers = new Headers(baseHeaders ?? {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export function handleUnauthorized() {
  clearToken();
  if (typeof window !== 'undefined') {
    window.location.replace('/sign-in');
  }
}

export { TOKEN_STORAGE_KEY };
