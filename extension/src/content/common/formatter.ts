/**
 * Common text formatter for content script output.
 */

export function cleanMessageText(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')  // Collapse multiple newlines
    .replace(/\t/g, ' ')         // Replace tabs
    .replace(/\s{2,}/g, ' ')     // Collapse multiple spaces
    .trim();
}

export function extractContactName(rawName: string): string {
  // Remove status indicators, online markers, etc.
  return rawName
    .replace(/online|typing\.\.\.|last seen.*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
