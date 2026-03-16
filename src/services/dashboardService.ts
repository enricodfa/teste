import * as api from './apiService';
import { getToken } from './tokenHelper';

export interface SignalSummary {
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
  realizedPnl:    number;
  unrealizedPnl:  number;
  totalPnl:       number;
  coingecko_id?:  string | null;
  logo?:          string | null;
}

export interface Portfolio {
  id:             string;
  name:           string;
  tolerance_band: number;
}

export interface DashboardSummary {
  portfolio:       Portfolio | null;
  signals:         SignalSummary[];
  totalValueUsd:   number;
  sellCount:       number;
  buyCount:        number;
  assetCount:      number;
  totalPnl:        number;
  totalRealized:   number;
  totalUnrealized: number;
}

/**
 * GET /dashboard?portfolio_id=<uuid>
 * Returns portfolio summary with live prices, signals, and P&L.
 * If portfolioId is omitted the backend falls back to the most recent portfolio.
 */
export async function getSummary(portfolioId?: string): Promise<DashboardSummary> {
  const token  = await getToken();
  const params = portfolioId ? `?portfolio_id=${portfolioId}` : '';
  return api.get<DashboardSummary>(`/dashboard${params}`, { token });
}