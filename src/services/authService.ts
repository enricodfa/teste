import * as api from './apiService';
import { getToken } from './tokenHelper';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  is_premium: boolean;
  status: string;
  current_period_end?: string;
}

export interface MeResponse {
  profile: Profile;
  subscription: Subscription;
}

export interface CallbackResponse {
  redirect: '/dashboard' | '/planos';
}

/**
 * POST /auth/callback
 * Sends the JWT to the backend, which checks the subscription and returns the redirect target.
 */
export async function checkPlanAndRedirect(): Promise<CallbackResponse> {
  const token = await getToken();
  return api.post<CallbackResponse>('/auth/callback', {}, { token });
}

/**
 * GET /auth/me
 * Returns the user's profile + subscription status.
 */
export async function getMe(): Promise<MeResponse> {
  const token = await getToken();
  return api.get<MeResponse>('/auth/me', { token });
}
