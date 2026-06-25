/**
 * Message normalizer — converts raw extracted messages into a standard format.
 */

import type { Message, MessageDirection } from '../../types/message';

export interface RawMessage {
  senderName: string;
  text: string;
  isOutgoing: boolean;
  timestamp?: string;
}

export function normalizeMessage(raw: RawMessage): Message {
  return {
    sender: raw.senderName.trim(),
    content: raw.text.trim(),
    direction: raw.isOutgoing ? 'outgoing' : 'incoming' as MessageDirection,
    timestamp: raw.timestamp,
  };
}

export function normalizeMessages(rawMessages: RawMessage[]): Message[] {
  return rawMessages
    .filter((msg) => msg.text && msg.text.trim().length > 0)
    .map(normalizeMessage)
    .slice(-50); // Keep last 50 messages max
}

export function deduplicateMessages(messages: Message[]): Message[] {
  const seen = new Set<string>();
  return messages.filter((msg) => {
    const key = `${msg.sender}:${msg.content}:${msg.timestamp || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
