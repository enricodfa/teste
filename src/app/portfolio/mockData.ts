export interface CryptoAsset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  priceChange24h: number;
  color: string;
}

export interface PortfolioItem {
  assetId: string;
  targetPct: number;
  quantity: number;
}

export interface Portfolio {
  items: PortfolioItem[];
  // Relative band: thresholds = target ± (target * toleranceBand). Range: [0.10, 0.20].
  toleranceBand: number;
}

export interface AssetMetrics {
  assetId: string;
  ticker: string;
  name: string;
  price: number;
  priceChange24h: number;
  color: string;
  targetPct: number;
  quantity: number;
  value: number;
  currentPct: number;
  upperThreshold: number;
  lowerThreshold: number;
  deviation: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  actionPct: number;
  actionValue: number;
  totalValue: number;
}

export const DEFAULT_TOLERANCE_BAND = 0.15;
export const TOLERANCE_BAND_MIN     = 0.10;
export const TOLERANCE_BAND_MAX     = 0.20;

export const AVAILABLE_ASSETS: CryptoAsset[] = [
  { id: 'btc',  ticker: 'BTC',  name: 'Bitcoin',   price: 67420.50, priceChange24h:  2.34, color: '#F7931A' },
  { id: 'eth',  ticker: 'ETH',  name: 'Ethereum',  price:  3521.80, priceChange24h: -1.12, color: '#627EEA' },
  { id: 'sui',  ticker: 'SUI',  name: 'Sui',       price:     3.85, priceChange24h:  8.23, color: '#4DA2FF' },
  { id: 'avax', ticker: 'AVAX', name: 'Avalanche', price:    38.20, priceChange24h: -3.45, color: '#E84142' },
];

export const MOCK_PORTFOLIO: Portfolio = {
  toleranceBand: DEFAULT_TOLERANCE_BAND,
  items: [
    { assetId: 'btc',  targetPct: 50, quantity: 0.89  },
    { assetId: 'eth',  targetPct: 25, quantity: 14.5  },
    { assetId: 'sui',  targetPct: 15, quantity: 8420  },
    { assetId: 'avax', targetPct: 10, quantity: 120   },
  ],
};

export function getAssetById(id: string): CryptoAsset | undefined {
  return AVAILABLE_ASSETS.find((a) => a.id === id);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(2)}`;
}

export function formatPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function computePortfolioMetrics(portfolio: Portfolio): AssetMetrics[] {
  const enriched = portfolio.items.map((item) => {
    const asset = getAssetById(item.assetId)!;
    return { ...item, asset, value: asset.price * item.quantity };
  });

  const totalValue = enriched.reduce((s, i) => s + i.value, 0);

  return enriched.map((item) => {
    const currentPct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

    // Relative band: variance is proportional to the target weight itself.
    const bandVariance  = item.targetPct * portfolio.toleranceBand;
    const upperThreshold = item.targetPct + bandVariance;
    const lowerThreshold = item.targetPct - bandVariance;

    const deviation = currentPct - item.targetPct;

    let signal: 'BUY' | 'SELL' | 'HOLD';
    let actionPct: number;
    let actionValue: number;

    if (currentPct >= upperThreshold) {
      // Sell exactly enough to land back on target, not just inside the band.
      signal     = 'SELL';
      actionPct  = currentPct - item.targetPct;
      actionValue = (actionPct / 100) * totalValue;
    } else if (currentPct <= lowerThreshold) {
      signal     = 'BUY';
      actionPct  = item.targetPct - currentPct;
      actionValue = (actionPct / 100) * totalValue;
    } else {
      signal     = 'HOLD';
      actionPct  = 0;
      actionValue = 0;
    }

    return {
      assetId: item.assetId,
      ticker: item.asset.ticker,
      name: item.asset.name,
      price: item.asset.price,
      priceChange24h: item.asset.priceChange24h,
      color: item.asset.color,
      targetPct: item.targetPct,
      quantity: item.quantity,
      value: item.value,
      currentPct,
      upperThreshold,
      lowerThreshold,
      deviation,
      signal,
      actionPct,
      actionValue,
      totalValue,
    };
  });
}
