/**
 * Instagram Web DOM selectors.
 *
 * Targets direct messages section of Instagram Web (instagram.com/direct/*).
 */

export const IG_SELECTORS = {
  // Chat header — contains contact/username
  CHAT_HEADER: 'div[role="main"] header, div[role="presentation"] header, header',
  CONTACT_NAME: 'header span[role="link"] span, header div[role="button"] span, header span[role="button"]',
  CONTACT_NAME_FALLBACK: 'div[role="main"] span[role="link"] span, header span[dir="auto"]',

  // Message list container
  MESSAGE_LIST: 'div[role="presentation"] div[role="button"] ~ div, div[aria-label="Messages"], div.x78zum5.xdt5ytf.x1iyjqo2.xs8306g',
  MESSAGE_ROW: 'div[role="row"], div.x1qjc9v5.x972f71, div[data-testid="message-container"]',

  // Individual message components
  MESSAGE_TEXT: 'div[dir="auto"] span, div.x5yr21d.x1120s5i.x1a2a7hz',
  MESSAGE_TEXT_FALLBACK: 'div[dir="auto"]',
  MESSAGE_TIMESTAMP: 'div[role="row"] time, div.x2b8uid time',

  // Message direction detection
  INCOMING_CLASS: 'x1gan731',
  OUTGOING_CLASS: 'x1grzw77',
  
  // Containers with flex alignment style properties to detect direction
  OUTGOING_CONTAINER_SELECTOR: 'div.x1vq458c, div[style*="justify-content: flex-end"]',
  INCOMING_CONTAINER_SELECTOR: 'div.x2lah0s, div[style*="justify-content: flex-start"]',

  // Conversation panel
  CONVERSATION_PANEL: 'div[role="main"]',
  CONVERSATION_PANEL_FALLBACK: 'div[role="presentation"]',

  // Input textbox to check if active chat and for button injection
  INPUT_FIELD: 'div[role="textbox"]',
} as const;
