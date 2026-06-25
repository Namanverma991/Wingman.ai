/**
 * Conversation builder — assembles a structured conversation object
 * from normalized messages.
 */

import type { Conversation, Message } from '../../types/message';
import type { Platform } from '../../types/platform';

export function buildConversation(
  platform: Platform,
  contactName: string,
  messages: Message[],
  currentUserName?: string,
): Conversation {
  return {
    platform,
    contactName: contactName.trim(),
    messages,
    currentUserName: currentUserName?.trim(),
  };
}

export function isValidConversation(conversation: Conversation): boolean {
  return (
    conversation.contactName.length > 0 &&
    conversation.messages.length > 0 &&
    conversation.messages.some((m) => m.content.length > 0)
  );
}
