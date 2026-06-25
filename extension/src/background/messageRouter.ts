/**
 * Message router — central routing for Chrome extension messages.
 */

export type MessageType =
  | 'CONVERSATION_UPDATE'
  | 'CONVERSATION_CLEARED'
  | 'REQUEST_CONVERSATION'
  | 'OPEN_SIDE_PANEL'
  | 'TOKEN_REFRESH_NEEDED'
  | 'AUTH_STATUS_CHECK'
  | 'CLEAR_AUTH';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export function sendToBackground(message: ExtensionMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

export function sendToTab(tabId: number, message: ExtensionMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}
