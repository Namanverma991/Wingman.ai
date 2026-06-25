/**
 * API client — handles all HTTP requests to the Wingman backend.
 *
 * Features:
 * - Automatic auth header injection
 * - Token refresh on 401
 * - Structured error handling
 */

import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens, isTokenExpired } from './storage';
import type { TokenPair } from '../types/auth';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      await clearTokens();
      return null;
    }

    const data: TokenPair = await response.json();
    await saveTokens(data.access_token, data.refresh_token, data.expires_in);
    return data.access_token;
  } catch {
    await clearTokens();
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const expired = await isTokenExpired();
  if (!expired) {
    return getAccessToken();
  }

  // Coalesce concurrent refresh calls
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = await getValidAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = 'Request failed';
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, detail);
  }

  return response.json();
}

export { API_ENDPOINTS };
