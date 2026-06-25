/**
 * Message and conversation type definitions.
 */
import type { Platform } from './platform';

export type MessageDirection = 'incoming' | 'outgoing';

export interface Message {
  sender: string;
  content: string;
  direction: MessageDirection;
  timestamp?: string;
}

export interface Conversation {
  platform: Platform;
  contactName: string;
  messages: Message[];
  currentUserName?: string;
}
