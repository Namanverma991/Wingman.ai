/**
 * API type definitions.
 */
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreditBalance {
  credits_remaining: number;
  daily_limit: number;
  plan: string;
  resets_at: string;
}

export interface UsageSummary {
  user_id: string;
  plan: string;
  credits_remaining: number;
  credits_used_today: number;
  daily_limit: number;
  credits_reset_at: string;
  total_replies_generated: number;
  total_credits_consumed: number;
}
