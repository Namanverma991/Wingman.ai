/**
 * Platform detector — determines which messaging platform the user is on.
 */

import type { Platform } from '../../types/platform';

export function detectPlatform(): Platform | null {
  const url = window.location.href;

  if (url.includes('web.whatsapp.com')) {
    return 'whatsapp';
  }
  if (url.includes('instagram.com/direct')) {
    return 'instagram';
  }

  return null;
}

export function isWhatsApp(): boolean {
  return detectPlatform() === 'whatsapp';
}

export function isInstagram(): boolean {
  return detectPlatform() === 'instagram';
}
