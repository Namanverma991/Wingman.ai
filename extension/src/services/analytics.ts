/**
 * Simple analytics service for tracking extension events.
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

const eventQueue: AnalyticsEvent[] = [];

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  eventQueue.push({
    event,
    properties,
    timestamp: Date.now(),
  });

  // In production, this would flush to an analytics endpoint
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, properties);
  }
}

export function trackReplyGeneration(platform: string, tone: string): void {
  trackEvent('reply_generated', { platform, tone });
}

export function trackReplyCopied(platform: string, tone: string, index: number): void {
  trackEvent('reply_copied', { platform, tone, index });
}

export function trackLogin(): void {
  trackEvent('user_login');
}

export function trackLogout(): void {
  trackEvent('user_logout');
}

export function trackConversationDetected(platform: string): void {
  trackEvent('conversation_detected', { platform });
}

export function getEventQueue(): AnalyticsEvent[] {
  return [...eventQueue];
}
