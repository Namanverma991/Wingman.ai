/**
 * Replies hook — convenience wrapper around the reply store.
 */

import { useReplyStore } from '../../store/replyStore';
import type { Conversation } from '../../types/message';

export function useReplies() {
  const store = useReplyStore();

  const generate = async (conversation: Conversation) => {
    await store.generateReplies(conversation);
  };

  return {
    replies: store.replies,
    isGenerating: store.isGenerating,
    selectedTone: store.selectedTone,
    error: store.error,
    creditsRemaining: store.creditsRemaining,
    latencyMs: store.latencyMs,
    model: store.model,
    history: store.history,
    historyTotal: store.historyTotal,
    historyPage: store.historyPage,

    generate,
    setTone: store.setTone,
    clearReplies: store.clearReplies,
    clearError: store.clearError,
    fetchHistory: store.fetchHistory,
    copyReply: store.copyReply,
  };
}
