/**
 * Instagram message parser — extracts messages and headers from Instagram Web Direct DOM.
 */

import { IG_SELECTORS } from './selectors';
import type { RawMessage } from '../common/messageNormalizer';
import { cleanMessageText } from '../common/formatter';

export function parseMessageElement(element: Element): RawMessage | null {
  // Determine direction based on classes or flex alignment style properties
  const isOutgoing = element.closest(IG_SELECTORS.OUTGOING_CONTAINER_SELECTOR) !== null
    || element.classList.contains(IG_SELECTORS.OUTGOING_CLASS)
    || element.querySelector('div[style*="justify-content: flex-end"]') !== null;

  const isIncoming = element.closest(IG_SELECTORS.INCOMING_CONTAINER_SELECTOR) !== null
    || element.classList.contains(IG_SELECTORS.INCOMING_CLASS)
    || element.querySelector('div[style*="justify-content: flex-start"]') !== null;

  // Default to outgoing if we find Outgoing, incoming otherwise
  const isMsgOutgoing = isOutgoing && !isIncoming;

  // Extract text
  let text = '';
  const textEl = element.querySelector(IG_SELECTORS.MESSAGE_TEXT)
    || element.querySelector(IG_SELECTORS.MESSAGE_TEXT_FALLBACK);

  if (textEl) {
    text = cleanMessageText(textEl.textContent || '');
  }

  if (!text) return null;

  // Extract timestamp
  let timestamp: string | undefined;
  const timestampEl = element.querySelector(IG_SELECTORS.MESSAGE_TIMESTAMP);
  if (timestampEl) {
    timestamp = timestampEl.textContent?.trim() || timestampEl.getAttribute('title') || undefined;
  }

  // Sender name
  const senderName = isMsgOutgoing ? 'You' : 'Contact';

  return {
    senderName,
    text,
    isOutgoing: isMsgOutgoing,
    timestamp,
  };
}

export function parseAllMessages(container: Element): RawMessage[] {
  const messageElements = container.querySelectorAll(IG_SELECTORS.MESSAGE_ROW);
  const messages: RawMessage[] = [];

  messageElements.forEach((el) => {
    const parsed = parseMessageElement(el);
    if (parsed) {
      messages.push(parsed);
    }
  });

  return messages;
}

export function getContactName(): string | null {
  const nameEl = document.querySelector(IG_SELECTORS.CONTACT_NAME)
    || document.querySelector(IG_SELECTORS.CONTACT_NAME_FALLBACK);

  if (nameEl) {
    return nameEl.textContent?.trim() || null;
  }

  return null;
}
