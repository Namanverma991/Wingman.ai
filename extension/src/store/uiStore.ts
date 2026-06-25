/**
 * UI state store (Zustand) — manages navigation, modals, and global UI state.
 */

import { create } from 'zustand';
import type { Conversation } from '../types/message';
import type { Platform } from '../types/platform';

type Page = 'login' | 'dashboard' | 'replies' | 'account' | 'settings';

interface UIStore {
  // Navigation
  currentPage: Page;
  setPage: (page: Page) => void;

  // Active conversation
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;

  // Platform detection
  detectedPlatform: Platform | null;
  setDetectedPlatform: (platform: Platform | null) => void;

  // Side panel
  isSidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;

  // Notifications
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'login',
  setPage: (page) => set({ currentPage: page }),

  activeConversation: null,
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  detectedPlatform: null,
  setDetectedPlatform: (platform) => set({ detectedPlatform: platform }),

  isSidePanelOpen: false,
  setSidePanelOpen: (open) => set({ isSidePanelOpen: open }),

  notification: null,
  showNotification: (message, type) => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 4000);
  },
  clearNotification: () => set({ notification: null }),
}));
