'use client';

import { useState } from 'react';
import { Wallet, ChartDonut, Scales, TrendDown, TrendUp } from '@phosphor-icons/react';
import AppLayout from '../../components/layout/AppLayout';
import type { Portfolio } from './mockData';
import { MOCK_PORTFOLIO, computePortfolioMetrics, formatCurrency } from './mockData';
import PortfolioSetup from './components/PortfolioSetup';
import AssetCard from './components/AssetCard';
import RebalanceAlert from './components/RebalanceAlert';
import PortfolioChart from './components/PortfolioChart';

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ label, value, sub, Icon, accentColor }: {
  label: string; value: string; sub: string;
  Icon: React.ElementType; accentColor: string;
}) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span className="label">{label}</span>
        <div style={{
          width: 30, height: 30, borderRadius: 'var(--r-sm)',
          background: accentColor + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} style={{ color: accentColor }} weight="fill" />
        </div>
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

/* ── Portfolio page ───────────────────────────────────────── */
export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  /* ── Empty state ── */
  if (!portfolio) {
    return (
      <AppLayout
        title="Cadastrar Carteira"
        subtitle="Carteira"
      >
        <PortfolioSetup
          onComplete={(p) => setPortfolio(p)}
          onLoadMock={() => setPortfolio(MOCK_PORTFOLIO)}
        />
      </AppLayout>
    );
  }

  /* ── Dashboard ── */
  const metrics = computePortfolioMetrics(portfolio);
  const totalValue  = metrics[0]?.totalValue ?? 0;
  const sellCount   = metrics.filter((m) => m.signal === 'SELL').length;
  const buyCount    = metrics.filter((m) => m.signal === 'BUY').length;
  const actionCount = sellCount + buyCount;
  const avgDev      = metrics.reduce((s, m) => s + Math.abs(m.deviation), 0) / metrics.length;

  return (
    <AppLayout
      title="Minha Carteira"
      subtitle="Carteira"
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Valor Total"      value={formatCurrency(totalValue)} sub={`${metrics.length} ativos`}       Icon={Wallet}     accentColor="var(--blue)" />
        <StatCard label="Sinais Ativos"    value={String(actionCount)}         sub={actionCount === 0 ? 'Balanceado' : `${sellCount} venda · ${buyCount} compra`} Icon={Scales}     accentColor={actionCount > 0 ? 'var(--amber)' : 'var(--green)'} />
        <StatCard label="Sinais de Venda"  value={String(sellCount)}           sub="Take Profit"                      Icon={TrendDown}  accentColor={sellCount > 0 ? 'var(--red)' : '#9CA3AF'} />
        <StatCard label="Sinais de Compra" value={String(buyCount)}            sub="Buy the Dip"                      Icon={TrendUp}    accentColor={buyCount > 0 ? 'var(--green)' : '#9CA3AF'} />
      </div>

      {/* Rebalance alerts */}
      <div style={{ marginBottom: 20 }}>
        <RebalanceAlert metrics={metrics} />
      </div>

      {/* Charts + params */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 14, marginBottom: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <ChartDonut size={15} style={{ color: 'var(--blue)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>Distribuição de Ativos</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Alocação atual vs. alvo</div>
          </div>
          <PortfolioChart metrics={metrics} />
        </div>

        {/* Params + targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 12 }}>Parâmetros</div>
            {[
              { label: 'Banda de tolerância', value: `±${portfolio.toleranceBand}%`, color: 'var(--blue)' },
              { label: 'Desvio médio atual',  value: `${avgDev.toFixed(2)}%`, color: avgDev > portfolio.toleranceBand ? 'var(--red-text)' : 'var(--green-text)' },
              { label: 'Estratégia',          value: 'Bandas Oportunísticas', color: 'var(--t2)' },
            ].map(({ label, value, color }, i, arr) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>{label}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
                </div>
                {i < arr.length - 1 && <div className="divider" />}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 12 }}>Alvos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {metrics.map((m) => (
                <div key={m.assetId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{m.ticker}</span>
                  <div style={{ width: 56, height: 4, background: 'var(--border-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (m.currentPct / m.targetPct) * 100)}%`,
                      height: '100%', borderRadius: 99,
                      background: m.signal === 'SELL' ? 'var(--red)' : m.signal === 'BUY' ? 'var(--green)' : m.color,
                    }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)', width: 28, textAlign: 'right' }}>{m.targetPct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset cards */}
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>Análise por Ativo</span>
        <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>posição atual vs. bandas de tolerância</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {metrics.map((m, i) => (
          <AssetCard key={m.assetId} metrics={m} index={i} />
        ))}
      </div>
    </AppLayout>
  );
}
