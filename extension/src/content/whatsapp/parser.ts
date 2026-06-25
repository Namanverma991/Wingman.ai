/**
 * WhatsApp message parser — extracts individual messages from DOM elements.
 */

import { WA_SELECTORS } from './selectors';
import type { RawMessage } from '../common/messageNormalizer';
import { cleanMessageText } from '../common/formatter';

export function parseMessageElement(element: Element): RawMessage | null {
  // Determine direction
  const classList = element.className || '';
  const isOutgoing = classList.includes(WA_SELECTORS.OUTGOING_CLASS);
  const isIncoming = classList.includes(WA_SELECTORS.INCOMING_CLASS);

  if (!isOutgoing && !isIncoming) return null;

  // Extract text
  let text = '';
  const textEl = element.querySelector(WA_SELECTORS.MESSAGE_TEXT)
    || element.querySelector(WA_SELECTORS.MESSAGE_TEXT_FALLBACK);

  if (textEl) {
    text = cleanMessageText(textEl.textContent || '');
  }

  if (!text) return null;

  // Extract timestamp
  let timestamp: string | undefined;
  const timestampEl = element.querySelector(WA_SELECTORS.MESSAGE_TIMESTAMP);
  if (timestampEl) {
    timestamp = timestampEl.textContent?.trim();
  }

  // Sender name — for group chats, extract from message header
  let senderName = isOutgoing ? 'You' : 'Contact';

  // In group chats, sender name appears in a specific span
  const senderEl = element.querySelector('span[data-testid="author"]');
  if (senderEl) {
    senderName = senderEl.textContent?.trim() || senderName;
  }

  return {
    senderName,
    text,
    isOutgoing,
    timestamp,
  };
}

export function parseAllMessages(container: Element): RawMessage[] {
  const messageElements = container.querySelectorAll(WA_SELECTORS.MESSAGE_ROW);
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
  const header = document.querySelector('#main header')
    || document.querySelector('[data-testid="conversation-panel-wrapper"] header')
    || document.querySelector(WA_SELECTORS.CHAT_HEADER);

  if (!header) return null;

  const selectors = [
    '[data-testid="conversation-info-header-name"]',
    'span[dir="auto"][title]',
    'span[title]',
    'span[dir="auto"]',
    'span',
  ];

  for (const selector of selectors) {
    const el = header.querySelector(selector);
    if (el) {
      const name = el.getAttribute('title') || el.textContent;
      if (name && name.trim()) {
        return name.trim();
      }
    }
  }

  return null;
}
