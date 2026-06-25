/**
 * WhatsApp DOM observer — watches for new messages and chat switches.
 */

import { WA_SELECTORS } from './selectors';
import { debounce } from '../../utils/debounce';

type ChangeCallback = () => void;

let observer: MutationObserver | null = null;

export function startObserving(onConversationChange: ChangeCallback): void {
  if (observer) {
    observer.disconnect();
  }

  const debouncedCallback = debounce(onConversationChange, 500);

  observer = new MutationObserver((mutations) => {
    let hasRelevantChange = false;

    for (const mutation of mutations) {
      // Check for new message nodes
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            const className = typeof node.className === 'string' ? node.className : '';
            if (
              className.includes('message-in') ||
              className.includes('message-out') ||
              node.querySelector(WA_SELECTORS.MESSAGE_TEXT) ||
              node.querySelector(WA_SELECTORS.MESSAGE_ROW) ||
              node.querySelector('[data-testid="msg-container"]')
            ) {
              hasRelevantChange = true;
              break;
            }
          }
        }
      }

      // Check for attribute changes (e.g., chat switch or title updates)
      if (mutation.type === 'attributes' && (mutation.attributeName === 'title' || mutation.attributeName === 'aria-selected')) {
        hasRelevantChange = true;
      }
    }

    if (hasRelevantChange) {
      debouncedCallback();
    }
  });

  // Always observe document.body for full coverage and resilience against dynamic DOM updates
  const targetNode = document.body;

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title', 'aria-selected'],
  });

  console.log('[Wingman AI] WhatsApp observer started');
}

export function stopObserving(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('[Wingman AI] WhatsApp observer stopped');
  }
}
