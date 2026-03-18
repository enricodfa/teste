import * as api from './apiService';
import { getToken } from './tokenHelper';

export interface Signal {
  ticker:         string;
  signal:         'BUY' | 'SELL' | 'HOLD';
  currentPct:     number;
  targetPct:      number;
  upperThreshold: number;
  lowerThreshold: number;
  deviationPct:   number;
  actionPct:      number;
  actionValueUsd: number;
  priceUsd:       number;
  totalValueUsd:  number;
  quantity:       number;
  avgCost:        number;
  totalInvested:  number;
  totalReceived:  number;
  realizedPnl:    number;
  unrealizedPnl:  number;
  totalPnl:       number;
  logo?:          string;
  coingecko_id?:  string;
}

export interface ActionPlanItem {
  ticker:         string;
  signal:         'BUY' | 'SELL';
  actionValueUsd: number;
  actionPct:      number;
  currentPct:     number;
  targetPct:      number;
  deviationPct:   number;
  priceUsd:       number;
  unitsToTrade:   number;
}

export interface Portfolio {
  id:             string;
  name:           string;
  tolerance_band: number;
}

export interface AnalysisResult {
  portfolio:  Portfolio | null;
  signals:    Signal[];
  actionPlan: ActionPlanItem[];
}

/**
 * GET /analysis
 * Returns full rebalance analysis + P&L for the user's latest portfolio.
 */
export async function getAnalysis(): Promise<AnalysisResult> {
  const token = await getToken();
  return api.get<AnalysisResult>('/analysis', { token });
}

/**
 * GET /analysis/:portfolioId
 * Same as above but for a specific portfolio.
 */
export async function getAnalysisById(portfolioId: string): Promise<AnalysisResult> {
  const token = await getToken();
  return api.get<AnalysisResult>(`/analysis/${portfolioId}`, { token });
}
