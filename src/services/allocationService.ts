import * as api from './apiService';
import { getToken } from './tokenHelper';

export interface PortfolioAsset {
  ticker:         string;
  net_quantity:   number;
  avg_cost:       number;
  total_invested: number;
  total_received: number;
  realized_pnl:   number;
  target_pct:     number | null;
}

export interface Portfolio {
  id:             string;
  name:           string;
  tolerance_band: number;
  targets:        { ticker: string; target_pct: number }[];
  created_at:     string;
  updated_at:     string;
}

export interface AllocationResponse {
  portfolio: Portfolio | null;
  assets:    PortfolioAsset[];
}

export interface SaveAllocationPayload {
  portfolioName?: string;
  toleranceBand:  number;
  assets: {
    ticker:     string;
    target_pct: number;
  }[];
}

/**
 * GET /allocation
 * Returns portfolio with trade-derived holdings and saved allocation targets.
 */
export async function getAllocation(): Promise<AllocationResponse> {
  const token = await getToken();
  return api.get<AllocationResponse>('/allocation', { token });
}

/**
 * PUT /allocation
 * Saves target percentages. target_pct values must sum to 100.
 */
export async function saveAllocation(payload: SaveAllocationPayload): Promise<AllocationResponse> {
  const token = await getToken();
  return api.put<AllocationResponse>('/allocation', payload, { token });
}

/**
 * PATCH /allocation/band
 * Updates only the global tolerance band of the portfolio.
 */
export async function updateBand(toleranceBand: number): Promise<Portfolio> {
  const token = await getToken();
  return api.patch<Portfolio>('/allocation/band', { toleranceBand }, { token });
}
