/**
 * Instagram injector — UI elements injected into Instagram Web Direct.
 */

export function injectWingmanButton(): void {
  // Check if button already exists
  if (document.getElementById('wingman-trigger-btn-ig')) return;

  const textBox = document.querySelector('div[role="textbox"]');
  if (!textBox) return;

  const btn = document.createElement('button');
  btn.id = 'wingman-trigger-btn-ig';
  btn.innerHTML = '✨';
  btn.title = 'Open Wingman AI';
  btn.style.cssText = `
    position: absolute;
    right: 16px;
    bottom: 72px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    z-index: 9999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
  });

  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
  });

  // Inject relative to main conversation/chat panel
  const chatContainer = document.querySelector('div[role="main"]') || textBox.parentElement;
  if (chatContainer) {
    const computedStyle = window.getComputedStyle(chatContainer);
    if (computedStyle.position === 'static') {
      (chatContainer as HTMLElement).style.position = 'relative';
    }
    chatContainer.appendChild(btn);
  }
}

export function removeWingmanButton(): void {
  const btn = document.getElementById('wingman-trigger-btn-ig');
  if (btn) btn.remove();
}
