import * as api from './apiService';
import { getToken } from './tokenHelper';

/* ── Types ──────────────────────────────────────────────────── */
export interface Portfolio {
  id:             string;
  name:           string;
  tolerance_band: number;
  created_at:     string;
  updated_at:     string;
}

export interface CreatePortfolioPayload {
  name?:           string;
  tolerance_band?: number;
}

export interface UpdatePortfolioPayload {
  name?:           string;
  tolerance_band?: number;
}

/* ── Endpoints ──────────────────────────────────────────────── */

/**
 * GET /portfolios
 * Lists all active portfolios for the authenticated user.
 */
export async function listPortfolios(): Promise<{ portfolios: Portfolio[] }> {
  const token = await getToken();
  return api.get('/portfolios', { token });
}

/**
 * POST /portfolios
 * Creates a new portfolio.
 * Free plan: backend enforces max 1. Returns 403 with error: 'free_plan_limit' if exceeded.
 */
export async function createPortfolio(payload: CreatePortfolioPayload = {}): Promise<Portfolio> {
  const token = await getToken();
  return api.post('/portfolios', payload, { token });
}

/**
 * POST /portfolios/find-or-create
 * Returns the user's most recent active portfolio, or creates a default one.
 * Safe to call when portfolioId is unknown (e.g. first-time user).
 */
export async function findOrCreatePortfolio(): Promise<Portfolio> {
  const token = await getToken();
  return api.post('/portfolios/find-or-create', {}, { token });
}

/**
 * PATCH /portfolios/:id
 * Updates name and/or global tolerance band.
 */
export async function updatePortfolio(id: string, payload: UpdatePortfolioPayload): Promise<Portfolio> {
  const token = await getToken();
  return api.patch(`/portfolios/${id}`, payload, { token });
}

/**
 * DELETE /portfolios/:id
 * Soft-deletes a portfolio. Backend prevents deleting the last one.
 */
export async function deletePortfolio(id: string): Promise<void> {
  const token = await getToken();
  return api.del(`/portfolios/${id}`, { token });
}