import * as api from './apiService';
import { getToken } from './tokenHelper';

export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  user_id: string;
  portfolio_id: string;
  ticker: string;
  type: TradeType;
  quantity: number;
  price_usd: number;
  total_usd: number;
  traded_at: string;
  notes: string | null;
  created_at: string;
}

export interface ListOperationsParams {
  portfolioId?: string;
  ticker?: string;
  type?: TradeType;
  limit?: number;
  offset?: number;
}

export interface ListOperationsResponse {
  trades: Trade[];
  total: number;
}

export interface CreateOperationPayload {
  portfolioId: string;
  ticker: string;
  type: TradeType;
  quantity: number;
  price_usd?: number;
  traded_at?: string;
  notes?: string;
}

export interface UpdateOperationPayload {
  quantity?: number;
  price_usd?: number;
  traded_at?: string;
  notes?: string;
}

/**
 * GET /operations
 */
export async function listOperations(params: ListOperationsParams = {}): Promise<ListOperationsResponse> {
  const token = await getToken();
  const qs    = new URLSearchParams();
  if (params.portfolioId) qs.set('portfolioId', params.portfolioId);
  if (params.ticker)      qs.set('ticker', params.ticker);
  if (params.type)        qs.set('type', params.type);
  if (params.limit  != null) qs.set('limit',  String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));

  const path = `/operations${qs.toString() ? `?${qs}` : ''}`;
  return api.get<ListOperationsResponse>(path, { token });
}

/**
 * POST /operations
 * If price_usd is omitted, the backend fetches the live price.
 */
export async function createOperation(payload: CreateOperationPayload): Promise<Trade> {
  const token = await getToken();
  return api.post<Trade>('/operations', payload, { token });
}

/**
 * PATCH /operations/:id
 */
export async function updateOperation(id: string, payload: UpdateOperationPayload): Promise<Trade> {
  const token = await getToken();
  return api.patch<Trade>(`/operations/${id}`, payload, { token });
}

/**
 * DELETE /operations/:id
 */
export async function deleteOperation(id: string): Promise<void> {
  const token = await getToken();
  return api.del<void>(`/operations/${id}`, { token });
}
