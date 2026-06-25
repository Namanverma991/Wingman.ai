/**
 * Chrome Extension Service Worker — background script.
 *
 * Responsibilities:
 * - Opens side panel when extension icon is clicked
 * - Routes messages between content scripts and side panel
 * - Manages token refresh alarms
 */

// Open side panel on action click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Set up side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// Message routing between content scripts and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONVERSATION_UPDATE' || message.type === 'CONVERSATION_CLEARED') {
    // Forward from content script to side panel
    chrome.runtime.sendMessage(message).catch(() => {
      // Side panel might not be open yet — ignore
    });
    sendResponse({ received: true });
    return false;
  }

  if (message.type === 'REQUEST_CONVERSATION') {
    // Forward from side panel to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, message).catch(() => {});
      }
    });
    sendResponse({ received: true });
    return false;
  }

  if (message.type === 'OPEN_SIDE_PANEL') {
    if (sender.tab?.id) {
      const tabId = sender.tab.id;
      const windowId = sender.tab.windowId;
      const openOptions: { tabId: number; windowId?: number } = { tabId };
      if (windowId !== undefined) {
        openOptions.windowId = windowId;
      }
      chrome.sidePanel.open(openOptions).catch((err) => {
        console.error('[Wingman AI] Programmatic side panel open failed:', err);
        chrome.tabs.sendMessage(tabId, {
          type: 'SIDE_PANEL_OPEN_FAILED',
          error: err.message || String(err),
        }).catch(() => {});
      });
    }
    sendResponse({ received: true });
    return false;
  }

  return false;
});

// Set up token refresh alarm (every 25 minutes)
chrome.alarms.create('token-refresh', { periodInMinutes: 25 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'token-refresh') {
    try {
      const result = await chrome.storage.local.get([
        'wingman_refresh_token',
        'wingman_token_expires_at',
      ]);
      const expiresAt = result.wingman_token_expires_at;
      if (expiresAt && Date.now() >= expiresAt - 120_000) {
        // Token is expiring soon — trigger refresh
        chrome.runtime.sendMessage({ type: 'TOKEN_REFRESH_NEEDED' }).catch(() => {});
      }
    } catch {
      // Ignore errors in background alarm
    }
  }
});

// Content script install — inject on supported pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('web.whatsapp.com') || tab.url.includes('instagram.com/direct')) {
      // Side panel becomes available for this tab
      chrome.sidePanel.setOptions({
        tabId,
        path: 'src/sidepanel/index.html',
        enabled: true,
      }).catch(() => {});
    }
  }
});

// Configure all open tabs on initialization
function configureExistingTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id && tab.url && (tab.url.includes('web.whatsapp.com') || tab.url.includes('instagram.com/direct'))) {
        chrome.sidePanel.setOptions({
          tabId: tab.id,
          path: 'src/sidepanel/index.html',
          enabled: true,
        }).catch(() => {});
      }
    }
  });
}

chrome.runtime.onInstalled.addListener(configureExistingTabs);
chrome.runtime.onStartup.addListener(configureExistingTabs);
configureExistingTabs();

console.log('[Wingman AI] Service worker initialized');
