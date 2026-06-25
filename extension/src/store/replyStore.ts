/**
 * Reply generation state store (Zustand).
 */

import { create } from 'zustand';
import type { SingleReply, Tone, ReplyHistoryItem } from '../types/reply';
import type { Conversation } from '../types/message';
import * as conversationService from '../services/conversation';

interface ReplyStore {
  // State
  replies: SingleReply[];
  isGenerating: boolean;
  selectedTone: Tone;
  error: string | null;
  creditsRemaining: number | null;
  latencyMs: number | null;
  model: string | null;

  // History
  history: ReplyHistoryItem[];
  historyTotal: number;
  historyPage: number;

  // Actions
  generateReplies: (conversation: Conversation) => Promise<void>;
  setTone: (tone: Tone) => void;
  clearReplies: () => void;
  clearError: () => void;
  fetchHistory: (page?: number) => Promise<void>;
  copyReply: (index: number) => void;
}

export const useReplyStore = create<ReplyStore>((set, get) => ({
  replies: [],
  isGenerating: false,
  selectedTone: 'confident',
  error: null,
  creditsRemaining: null,
  latencyMs: null,
  model: null,

  history: [],
  historyTotal: 0,
  historyPage: 1,

  generateReplies: async (conversation) => {
    const { selectedTone } = get();
    set({ isGenerating: true, error: null, replies: [] });

    try {
      const response = await conversationService.generateReplies(
        conversation,
        selectedTone,
      );
      set({
        replies: response.replies,
        creditsRemaining: response.credits_remaining,
        latencyMs: response.latency_ms,
        model: response.model,
        isGenerating: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate replies';
      set({ error: message, isGenerating: false });
    }
  },

  setTone: (tone) => set({ selectedTone: tone }),

  clearReplies: () =>
    set({ replies: [], error: null, latencyMs: null, model: null }),

  clearError: () => set({ error: null }),

  fetchHistory: async (page = 1) => {
    try {
      const response = await conversationService.getReplyHistory(page);
      set({
        history: response.items,
        historyTotal: response.total,
        historyPage: page,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history';
      set({ error: message });
    }
  },

  copyReply: (index) => {
    const { replies } = get();
    const reply = replies[index];
    if (reply) {
      navigator.clipboard.writeText(reply.text).catch(console.error);
    }
  },
}));
