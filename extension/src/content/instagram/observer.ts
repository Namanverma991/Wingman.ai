/**
 * Instagram DOM observer — watches for new messages and chat switches.
 */

import { IG_SELECTORS } from './selectors';
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
            const className = node.className || '';
            const testId = node.getAttribute('data-testid') || '';
            if (
              className.includes(IG_SELECTORS.INCOMING_CLASS) ||
              className.includes(IG_SELECTORS.OUTGOING_CLASS) ||
              testId.includes('message') ||
              node.querySelector(IG_SELECTORS.MESSAGE_TEXT) ||
              node.closest(IG_SELECTORS.MESSAGE_ROW)
            ) {
              hasRelevantChange = true;
              break;
            }
          }
        }
      }

      // Check for active conversation node changes or inputs
      if (mutation.type === 'attributes' && mutation.attributeName === 'role') {
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
    attributeFilter: ['role', 'class'],
  });

  console.log('[Wingman AI] Instagram observer started');
}

export function stopObserving(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('[Wingman AI] Instagram observer stopped');
  }
}
