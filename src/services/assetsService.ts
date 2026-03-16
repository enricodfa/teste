import * as api from './apiService';
import { getToken } from './tokenHelper';

export interface Asset {
  name:   string;
  ticker: string;
  coingecko_id?: string;  
  logo:   string;
}

export async function searchAssets(query: string): Promise<Asset[]> {
  const token = await getToken();
  return api.get<Asset[]>(`/assets/search?q=${encodeURIComponent(query)}`, { token });
}
