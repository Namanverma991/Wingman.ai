/**
 * User profile type definitions.
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  credits_remaining: number;
  credits_reset_at: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
