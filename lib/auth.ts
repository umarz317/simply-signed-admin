'use client';

const TOKEN_STORAGE_KEY = 'simply-signed-admin-token';

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

export function clearToken() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY);
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
