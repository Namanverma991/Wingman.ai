/**
 * Popup component — opens side panel on click.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

const Popup: React.FC = () => {
  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        // Open the side panel for the current tab
        chrome.sidePanel.open({ tabId }).catch(console.error);
        window.close();
      }
    });
  };

  return (
    <div className="popup-container">
      <div className="popup-logo">W</div>
      <h1 className="popup-title">Wingman AI</h1>
      <p className="popup-subtitle">Smart replies for your conversations</p>

      <button className="popup-btn" onClick={openSidePanel}>
        ✨ Open Side Panel
      </button>

      <div className="popup-status">
        <span className="status-dot" />
        Ready to assist
      </div>
    </div>
  );
};

// Mount
const root = document.getElementById('popup-root');
if (root) {
  createRoot(root).render(<Popup />);
}
