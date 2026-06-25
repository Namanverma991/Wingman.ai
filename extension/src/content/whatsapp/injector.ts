/**
 * WhatsApp injector — UI elements injected into WhatsApp Web.
 */

export function injectWingmanButton(): void {
  // Check if button already exists
  if (document.getElementById('wingman-trigger-btn')) return;

  const footer = document.querySelector('footer');
  if (!footer) return;

  const btn = document.createElement('button');
  btn.id = 'wingman-trigger-btn';
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

  // Insert relative to footer
  const parent = footer.parentElement;
  if (parent) {
    parent.style.position = 'relative';
    parent.appendChild(btn);
  }
}

export function removeWingmanButton(): void {
  const btn = document.getElementById('wingman-trigger-btn');
  if (btn) btn.remove();
}
