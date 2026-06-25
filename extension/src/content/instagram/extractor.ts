/**
 * Instagram content script — main entry point.
 *
 * Orchestrates:
 * 1. DOM observation for new messages / chat switches
 * 2. Message parsing and normalization
 * 3. Sending structured conversations to the background/side panel
 * 4. Injecting the Wingman UI trigger button
 */

import { IG_SELECTORS } from './selectors';
import { parseAllMessages, getContactName } from './parser';
import { startObserving } from './observer';
import { injectWingmanButton } from './injector';
import { normalizeMessages, deduplicateMessages } from '../common/messageNormalizer';
import { buildConversation, isValidConversation } from '../common/conversationBuilder';

let lastContactName: string | null = null;

function extractAndSendConversation(): void {
  const contactName = getContactName();
  if (!contactName) {
    chrome.runtime.sendMessage({ type: 'CONVERSATION_CLEARED' }).catch(() => {});
    return;
  }

  // Find the message container
  const container = document.querySelector(IG_SELECTORS.CONVERSATION_PANEL)
    || document.querySelector(IG_SELECTORS.CONVERSATION_PANEL_FALLBACK);

  if (!container) return;

  // Inject trigger button if not already present
  injectWingmanButton();

  // Parse messages from the DOM
  const rawMessages = parseAllMessages(container);
  const normalizedMessages = normalizeMessages(rawMessages);
  const uniqueMessages = deduplicateMessages(normalizedMessages);

  if (uniqueMessages.length === 0) return;

  // Update contact name for sender detection
  uniqueMessages.forEach((msg) => {
    if (msg.direction === 'incoming' && msg.sender === 'Contact') {
      msg.sender = contactName;
    }
  });

  // Build conversation object
  const conversation = buildConversation(
    'instagram',
    contactName,
    uniqueMessages,
    'You',
  );

  if (!isValidConversation(conversation)) return;

  // Track chat switches
  if (contactName !== lastContactName) {
    lastContactName = contactName;
    console.log(`[Wingman AI] Chat switched to: ${contactName}`);
  }

  // Send to background → side panel
  chrome.runtime.sendMessage({
    type: 'CONVERSATION_UPDATE',
    payload: conversation,
  }).catch(() => {
    // Side panel might not be open — that's fine
  });
}

// Listen for requests from the side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REQUEST_CONVERSATION') {
    extractAndSendConversation();
    sendResponse({ received: true });
    return false;
  }
  if (message.type === 'SIDE_PANEL_OPEN_FAILED') {
    alert(
      '✨ Wingman AI: To open the side panel, please click the Wingman AI extension icon (purple ✨ logo) in your Chrome toolbar!'
    );
    sendResponse({ received: true });
    return false;
  }
  return false;
});

// ── Initialization ────────────────────────────────────────────────────

function initialize(): void {
  console.log('[Wingman AI] Instagram content script loaded');

  // Start observing for changes immediately
  startObserving(() => {
    extractAndSendConversation();
  });

  // Try extracting in case a chat is already open on load
  setTimeout(extractAndSendConversation, 1500);
  setTimeout(extractAndSendConversation, 3000);

  console.log('[Wingman AI] Instagram integration initialized');
}

// Run when DOM is ready
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}
