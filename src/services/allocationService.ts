import * as api from './apiService';
import { getToken } from './tokenHelper';

/* ── Types ──────────────────────────────────────────────────── */
export interface AllocationAsset {
  ticker:                  string;
  net_quantity:            number;
  avg_cost:                number;
  total_invested:          number;
  total_received:          number;
  realized_pnl:            number;
  target_pct:              number | null;
  tolerance_band_override: number | null;
}

export interface Portfolio {
  id:             string;
  name:           string;
  tolerance_band: number;
  created_at:     string;
  updated_at:     string;
}

export interface AllocationResponse {
  portfolio: Portfolio;
  assets:    AllocationAsset[];
}

export interface SaveAllocationPayload {
  toleranceBand?: number;
  assets: {
    ticker:                  string;
    target_pct:              number;
    tolerance_band_override?: number | null;
  }[];
}

/* ── Endpoints ──────────────────────────────────────────────── */

/**
 * GET /portfolios/:portfolioId/allocation
 */
export async function getAllocation(portfolioId: string): Promise<AllocationResponse> {
  const token = await getToken();
  return api.get(`/portfolios/${portfolioId}/allocation`, { token });
}

/**
 * PUT /portfolios/:portfolioId/allocation
 * Replaces all allocation targets. target_pct values must sum to 100.
 * Optionally updates the global tolerance band in the same call.
 */
export async function saveAllocation(
  portfolioId: string,
  payload: SaveAllocationPayload,
): Promise<AllocationResponse> {
  const token = await getToken();
  return api.put(`/portfolios/${portfolioId}/allocation`, payload, { token });
}

/**
 * PATCH /portfolios/:portfolioId/allocation/band
 * Updates only the global tolerance band.
 */
export async function updateBand(portfolioId: string, toleranceBand: number): Promise<Portfolio> {
  const token = await getToken();
  return api.patch(`/portfolios/${portfolioId}/allocation/band`, { toleranceBand }, { token });
}