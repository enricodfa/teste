import * as api from './apiService';
import { getToken } from './tokenHelper';

export interface PlanStatus {
  is_premium: boolean;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
}

export interface ActivateResponse {
  ok: boolean;
  subscription: PlanStatus;
}

/**
 * GET /plans
 * Returns the current subscription status.
 */
export async function getStatus(): Promise<PlanStatus> {
  const token = await getToken();
  return api.get<PlanStatus>('/plans/status', { token });
}

/**
 * POST /plans/activate
 * Immediately activates the premium plan (no payment required yet).
 */
export async function activatePlan(): Promise<ActivateResponse> {
  const token = await getToken();
  return api.post<ActivateResponse>('/plans/activate', {}, { token });
}

/**
 * POST /plans/cancel
 * Cancels the premium plan.
 */
export async function cancelPlan(): Promise<ActivateResponse> {
  const token = await getToken();
  return api.post<ActivateResponse>('/plans/cancel', {}, { token });
}
