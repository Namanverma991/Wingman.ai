/**
 * Auth listener — listens for token-related messages in the background.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AUTH_STATUS_CHECK') {
    chrome.storage.local.get(['wingman_access_token', 'wingman_token_expires_at'], (result) => {
      const isAuthenticated = !!(
        result.wingman_access_token &&
        result.wingman_token_expires_at &&
        Date.now() < result.wingman_token_expires_at
      );
      sendResponse({ isAuthenticated });
    });
    return true; // async response
  }

  if (message.type === 'CLEAR_AUTH') {
    chrome.storage.local.remove(
      ['wingman_access_token', 'wingman_refresh_token', 'wingman_token_expires_at'],
      () => sendResponse({ cleared: true }),
    );
    return true;
  }

  return false;
});
