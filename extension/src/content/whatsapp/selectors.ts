/**
 * WhatsApp Web DOM selectors.
 *
 * These target WhatsApp Web's current DOM structure. WhatsApp periodically
 * changes class names, so selectors use data attributes and structural
 * patterns where possible for resilience.
 */

export const WA_SELECTORS = {
  // Chat header — contains contact name
  CHAT_HEADER: '#main header, [data-testid="conversation-panel-wrapper"] header, header._amid',
  CONTACT_NAME: '#main header span[dir="auto"][title], [data-testid="conversation-info-header-name"]',
  CONTACT_NAME_FALLBACK: 'header span[dir="auto"][title], header span[title]',

  // Message list container
  MESSAGE_LIST: 'div[role="application"], #main div[role="region"]',
  MESSAGE_ROW: 'div.message-in, div.message-out, div[class*="message-in"], div[class*="message-out"], [data-testid="msg-container"]',

  // Individual message components
  MESSAGE_TEXT: 'span.selectable-text span, span.selectable-text, [data-testid="msg-copyable-text"]',
  MESSAGE_TEXT_FALLBACK: 'div[class*="copyable-text"] span, div[class*="copyable-text"]',
  MESSAGE_TIMESTAMP: 'span[data-testid="msg-meta"] span, [data-testid="msg-meta"]',

  // Message direction detection
  INCOMING_CLASS: 'message-in',
  OUTGOING_CLASS: 'message-out',

  // Conversation pane
  CONVERSATION_PANEL: '#main',
  CONVERSATION_PANEL_FALLBACK: 'div[data-testid="conversation-panel-wrapper"]',

  // Chat list (for detecting chat switches)
  CHAT_LIST: 'div[aria-label="Chat list"]',
  ACTIVE_CHAT: 'div[data-testid="cell-frame-container"][aria-selected="true"]',

  // Input field (for detecting active chat)
  INPUT_FIELD: 'footer div[contenteditable="true"]',
} as const;
