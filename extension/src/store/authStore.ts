/**
 * Authentication state store (Zustand).
 */

import { create } from 'zustand';
import type { UserProfile } from '../types/user';
import * as authService from '../services/auth';
import { getRefreshToken, clearTokens } from '../services/storage';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthStore {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  initialize: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await get().fetchProfile();
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(credentials);
      await get().fetchProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(credentials);
      await get().fetchProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      await clearTokens();
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
