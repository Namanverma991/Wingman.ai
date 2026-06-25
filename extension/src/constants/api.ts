/**
 * API endpoint constants.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  CHANGE_PASSWORD: '/auth/change-password',

  // Users
  PROFILE: '/users/me',

  // Replies
  GENERATE: '/replies/generate',
  REPLY_HISTORY: '/replies/history',

  // Usage
  BALANCE: '/usage/balance',
  USAGE_SUMMARY: '/usage/summary',
  USAGE_HISTORY: '/usage/history',

  // Health
  HEALTH: '/health',
} as const;
