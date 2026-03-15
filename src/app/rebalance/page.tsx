'use client';

import { TrendUp, TrendDown, Info } from '@phosphor-icons/react';
import AppLayout from '../../components/layout/AppLayout';
import { CryptoIcon } from '../../components/icons/CryptoIcons';
import { MOCK_PORTFOLIO, computePortfolioMetrics, formatCurrency } from '../portfolio/mockData';
import BandIndicator from '../portfolio/components/BandIndicator';

const metrics = computePortfolioMetrics(MOCK_PORTFOLIO);
const { toleranceBand } = MOCK_PORTFOLIO;

export default function RebalancePage() {
  const actions = metrics.filter((m) => m.signal !== 'HOLD');
  const holds   = metrics.filter((m) => m.signal === 'HOLD');

  return (
    <AppLayout title="Rebalancear" subtitle="Principal">
      {/* Info banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', marginBottom: 22,
        background: 'var(--blue-subtle)',
        border: '1px solid rgba(59,91,219,0.18)',
        borderRadius: 'var(--r)',
      }}>
        <Info size={15} style={{ color: 'var(--blue)', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--blue-text)' }}>
          Banda de tolerância configurada em <strong>±{toleranceBand}%</strong>.
          O rebalanceamento é acionado apenas quando o peso do ativo ultrapassa os limites definidos.
        </div>
      </div>

      {/* Actions needed */}
      {actions.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 12 }}>
            Ações Necessárias
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actions.map((m) => (
              <div
                key={m.assetId}
                className="card"
                style={{
                  padding: '18px 20px',
                  borderLeft: `3px solid ${m.signal === 'SELL' ? 'var(--red)' : 'var(--green)'}`,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20, alignItems: 'center' }}>
                  {/* Asset */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CryptoIcon ticker={m.ticker} size={36} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{m.ticker}</div>
                      <div style={{ fontSize: 12, color: 'var(--t4)' }}>{m.name}</div>
                    </div>
                  </div>

                  {/* Band */}
                  <div>
                    <BandIndicator
                      current={m.currentPct}
                      target={m.targetPct}
                      lower={m.lowerThreshold}
                      upper={m.upperThreshold}
                      color={m.color}
                      signal={m.signal}
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--t4)' }}>Atual</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{m.currentPct.toFixed(2)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--t4)' }}>Alvo</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>{m.targetPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--t4)' }}>Desvio</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: m.signal === 'SELL' ? 'var(--red-text)' : 'var(--green-text)' }}>
                        {m.deviation >= 0 ? '+' : ''}{m.deviation.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{
                    padding: '12px 16px',
                    background: m.signal === 'SELL' ? 'var(--red-subtle)' : 'var(--green-subtle)',
                    border: `1px solid ${m.signal === 'SELL' ? 'var(--red-border)' : 'var(--green-border)'}`,
                    borderRadius: 'var(--r)',
                    textAlign: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                      {m.signal === 'SELL'
                        ? <TrendDown size={14} weight="bold" style={{ color: 'var(--red-text)' }} />
                        : <TrendUp size={14} weight="bold" style={{ color: 'var(--green-text)' }} />
                      }
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: m.signal === 'SELL' ? 'var(--red-text)' : 'var(--green-text)',
                      }}>
                        {m.signal === 'SELL' ? 'Take Profit' : 'Buy the Dip'}
                      </span>
                    </div>
                    <div className="mono" style={{
                      fontSize: 16, fontWeight: 800,
                      color: m.signal === 'SELL' ? 'var(--red-text)' : 'var(--green-text)',
                    }}>
                      {formatCurrency(m.actionValue)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>
                      {m.signal === 'SELL' ? 'a vender' : 'a comprar'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In balance */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 12 }}>
          Dentro da Banda
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {holds.map((m) => (
            <div key={m.assetId} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <CryptoIcon ticker={m.ticker} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{m.ticker}</div>
                <BandIndicator
                  current={m.currentPct}
                  target={m.targetPct}
                  lower={m.lowerThreshold}
                  upper={m.upperThreshold}
                  color={m.color}
                  signal={m.signal}
                />
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: 99,
                background: 'var(--green-subtle)',
                border: '1px solid var(--green-border)',
                fontSize: 11, fontWeight: 700, color: 'var(--green-text)', flexShrink: 0,
              }}>
                Manter
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
