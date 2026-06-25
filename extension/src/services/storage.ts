/**
 * Chrome storage service — wraps chrome.storage.local with typed helpers.
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wingman_access_token',
  REFRESH_TOKEN: 'wingman_refresh_token',
  EXPIRES_AT: 'wingman_token_expires_at',
  USER_PROFILE: 'wingman_user_profile',
  SETTINGS: 'wingman_settings',
} as const;

export async function getStorageItem<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? null);
    });
  });
}

export async function setStorageItem(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

export async function removeStorageItem(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, resolve);
  });
}

export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve);
  });
}

// ── Token storage helpers ───────────────────────────────────────────

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  const expiresAt = Date.now() + expiresIn * 1000;
  await Promise.all([
    setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    setStorageItem(STORAGE_KEYS.EXPIRES_AT, expiresAt),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function getTokenExpiresAt(): Promise<number | null> {
  return getStorageItem<number>(STORAGE_KEYS.EXPIRES_AT);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN),
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
    removeStorageItem(STORAGE_KEYS.EXPIRES_AT),
  ]);
}

export async function isTokenExpired(): Promise<boolean> {
  const expiresAt = await getTokenExpiresAt();
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - 60_000; // 1 min buffer
}

export { STORAGE_KEYS };
