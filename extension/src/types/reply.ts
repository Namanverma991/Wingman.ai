/**
 * Reply type definitions.
 */
export type Tone =
  | 'flirty'
  | 'confident'
  | 'funny'
  | 'casual'
  | 'formal'
  | 'witty'
  | 'sarcastic'
  | 'romantic'
  | 'friendly';

export interface SingleReply {
  index: number;
  text: string;
  tone: string;
}

export interface GenerateReplyResponse {
  replies: SingleReply[];
  credits_used: number;
  credits_remaining: number;
  model: string;
  latency_ms: number;
}

export interface ReplyHistoryItem {
  id: string;
  platform: string;
  tone: string;
  contact_name: string | null;
  conversation_snippet: string;
  replies: { items: string[] } | null;
  selected_reply_index: number | null;
  model_used: string;
  created_at: string;
}

export const TONE_CONFIG: Record<Tone, { label: string; emoji: string; color: string }> = {
  flirty: { label: 'Flirty', emoji: '😏', color: '#FF6B9D' },
  confident: { label: 'Confident', emoji: '💪', color: '#4A90D9' },
  funny: { label: 'Funny', emoji: '😂', color: '#FFB347' },
  casual: { label: 'Casual', emoji: '😎', color: '#77DD77' },
  formal: { label: 'Formal', emoji: '🎩', color: '#9B9B9B' },
  witty: { label: 'Witty', emoji: '🧠', color: '#BB77FF' },
  sarcastic: { label: 'Sarcastic', emoji: '😒', color: '#FF7744' },
  romantic: { label: 'Romantic', emoji: '❤️', color: '#FF4D6A' },
  friendly: { label: 'Friendly', emoji: '🤗', color: '#4ECDC4' },
};
