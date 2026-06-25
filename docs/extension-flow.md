# Wingman AI — Chrome Extension Flow

This document details the step-by-step process of extracting active chat streams from web pages and updating the Chrome Extension UI panel.

---

## Architecture Flow

```mermaid
sequenceDiagram
    participant DOM as WhatsApp/Instagram DOM
    participant CS as Content Script (whatsappContent/instagramContent)
    participant BG as Service Worker (Background)
    participant SP as Side Panel App (React)
    participant API as FastAPI Backend

    %% Initial Load
    Note over CS, DOM: User opens chat tab
    CS->>DOM: Load and start MutationObserver
    CS->>DOM: Inject Wingman Action Button (✨)
    
    %% Button Click
    Note over DOM, SP: User clicks ✨ Action Button
    DOM->>CS: Click event
    CS->>BG: Message: OPEN_SIDE_PANEL
    BG->>BG: chrome.sidePanel.open()
    BG->>SP: Mount and display panel

    %% Message Sync
    Note over SP, CS: Side Panel requests current chat
    SP->>BG: Message: REQUEST_CONVERSATION
    BG->>CS: Forward: REQUEST_CONVERSATION
    CS->>DOM: Extract conversation bubble elements
    CS->>CS: Normalize and deduplicate message contents
    CS->>BG: Message: CONVERSATION_UPDATE
    BG->>SP: Forward: CONVERSATION_UPDATE
    SP->>SP: Update UI state (contact name, message list)

    %% Tone Generation
    Note over SP, API: User selects tone and clicks Generate
    SP->>API: POST /api/v1/replies/generate
    API->>API: Deduct User Credit
    API-->>SP: Response: Array of suggested options
    SP->>SP: Render choices
    Note over SP, DOM: User clicks choice to copy
    SP->>API: POST /api/v1/replies/select (auditing)
```

## Key Operations

### 1. Active Element Extraction
- **WhatsApp**: Scans messages matching `message-in` and `message-out` inside target panels.
- **Instagram**: Scans rows matching `role="row"` or elements aligned by CSS styles.

### 2. Message Normalization
Both extractors translate raw elements into standard JSON arrays:
```typescript
interface Message {
  sender: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  timestamp?: string;
}
```

### 3. IPC Message Channels
Communication runs via `chrome.runtime.sendMessage` and `chrome.runtime.onMessage`:
- `OPEN_SIDE_PANEL`: Sent by content script to background thread to initialize panels.
- `REQUEST_CONVERSATION`: Sent by React component to request content scripts to sweep DOM.
- `CONVERSATION_UPDATE`: Push payload containing active threads.
- `CONVERSATION_CLEARED`: Fires when user switches away to empty screens.
