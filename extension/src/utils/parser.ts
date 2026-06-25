/**
 * DOM text parsing utilities for content scripts.
 */

export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractTextFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() || '';
  }
  if (node instanceof HTMLElement) {
    // Skip hidden elements
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return '';
    }
    return cleanText(node.innerText || '');
  }
  return '';
}

export function isEmoji(text: string): boolean {
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u;
  return emojiRegex.test(text);
}

export function removeEmojis(text: string): string {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
}
