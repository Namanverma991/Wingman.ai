/**
 * Auth service — handles login, register, logout, and token lifecycle.
 */

import { apiRequest, API_ENDPOINTS } from './api';
import { saveTokens, clearTokens } from './storage';
import type { LoginCredentials, RegisterCredentials, TokenPair } from '../types/auth';
import type { UserProfile } from '../types/user';

export async function login(credentials: LoginCredentials): Promise<TokenPair> {
  const data = await apiRequest<TokenPair>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: credentials,
    skipAuth: true,
  });
  await saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data;
}

export async function register(credentials: RegisterCredentials): Promise<TokenPair> {
  const data = await apiRequest<TokenPair>(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: credentials,
    skipAuth: true,
  });
  await saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await apiRequest(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      body: { refresh_token: refreshToken },
    });
  } finally {
    await clearTokens();
  }
}

export async function getProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE);
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE, {
    method: 'PATCH',
    body: data,
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  });
  await clearTokens();
}
