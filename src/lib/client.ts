// Client-side helpers: safe storage (never blocks first paint — the lesson
// from the earlier black-screen bug: every read/write goes through try/catch
// with an in-memory fallback) and an API client that sends the auth token.
const mem = new Map<string, string>();

export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return mem.get(key) ?? null;
  }
}

export function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    mem.set(key, value);
  }
}

export function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    mem.delete(key);
  }
}

export function authToken(): string | null {
  return storageGet('violet-token');
}

export async function api(path: string, opts: RequestInit = {}): Promise<any> {
  const token = authToken();
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `request_failed_${res.status}`);
  return data;
}

export function priceLabel(cents: number): string {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}
