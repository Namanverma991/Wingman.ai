/**
 * Conversation service — sends structured conversation data to the backend
 * for reply generation.
 */

import type { Conversation } from '../types/message';
import type { Tone, GenerateReplyResponse, ReplyHistoryItem } from '../types/reply';
import type { PaginatedResponse, CreditBalance, UsageSummary } from '../types/api';
import { LIMITS } from '../constants/limits';
import { apiRequest, API_ENDPOINTS } from './api';

export async function generateReplies(
  conversation: Conversation,
  tone: Tone,
  numReplies: number = LIMITS.DEFAULT_REPLIES_PER_REQUEST,
  maxLength?: number,
): Promise<GenerateReplyResponse> {
  return apiRequest<GenerateReplyResponse>(API_ENDPOINTS.GENERATE, {
    method: 'POST',
    body: {
      conversation,
      tone,
      num_replies: numReplies,
      max_length: maxLength,
    },
  });
}

export async function getReplyHistory(
  page: number = 1,
  pageSize: number = 20,
  platform?: string,
  tone?: string,
): Promise<PaginatedResponse<ReplyHistoryItem>> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  if (platform) params.append('platform', platform);
  if (tone) params.append('tone', tone);

  return apiRequest<PaginatedResponse<ReplyHistoryItem>>(
    `${API_ENDPOINTS.REPLY_HISTORY}?${params.toString()}`
  );
}

export async function getCreditBalance(): Promise<CreditBalance> {
  return apiRequest<CreditBalance>(API_ENDPOINTS.BALANCE);
}

export async function getUsageSummary(): Promise<UsageSummary> {
  return apiRequest<UsageSummary>(API_ENDPOINTS.USAGE_SUMMARY);
}
