/**
 * Conversation hook — listens for conversation updates from content scripts
 * via Chrome messaging.
 */

import { useEffect, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';
import type { Conversation } from '../../types/message';

export function useConversation() {
  const { activeConversation, setActiveConversation, setDetectedPlatform } = useUIStore();

  const handleMessage = useCallback(
    (
      message: { type: string; payload?: Conversation },
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: unknown) => void,
    ) => {
      if (message.type === 'CONVERSATION_UPDATE' && message.payload) {
        setActiveConversation(message.payload);
        setDetectedPlatform(message.payload.platform);
      }
      if (message.type === 'CONVERSATION_CLEARED') {
        setActiveConversation(null);
      }
    },
    [setActiveConversation, setDetectedPlatform],
  );

  const requestConversation = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_CONVERSATION' }).catch(() => {});
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    // Request conversation on mount to load initial state
    requestConversation();
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [handleMessage, requestConversation]);

  return {
    activeConversation,
    requestConversation,
    hasConversation: activeConversation !== null,
    contactName: activeConversation?.contactName ?? null,
    platform: activeConversation?.platform ?? null,
    messageCount: activeConversation?.messages.length ?? 0,
  };
}
