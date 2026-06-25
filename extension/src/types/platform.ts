/**
 * Platform type definitions.
 */
export type Platform = 'whatsapp' | 'instagram';

export interface PlatformConfig {
  name: string;
  platform: Platform;
  urlPattern: RegExp;
  icon: string;
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  whatsapp: {
    name: 'WhatsApp',
    platform: 'whatsapp',
    urlPattern: /web\.whatsapp\.com/,
    icon: '💬',
  },
  instagram: {
    name: 'Instagram',
    platform: 'instagram',
    urlPattern: /instagram\.com\/direct/,
    icon: '📸',
  },
};
