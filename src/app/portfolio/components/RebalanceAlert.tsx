'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrendUp, TrendDown, CheckCircle, Warning } from '@phosphor-icons/react';
import { CryptoIcon } from '../../../components/icons/CryptoIcons';
import type { AssetMetrics } from '../mockData';
import { formatCurrency } from '../mockData';

export default function RebalanceAlert({ metrics }: { metrics: AssetMetrics[] }) {
  const sells  = metrics.filter((m) => m.signal === 'SELL');
  const buys   = metrics.filter((m) => m.signal === 'BUY');
  const all    = [...sells, ...buys];

  if (all.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: 'var(--green-subtle)',
        border: '1px solid var(--green-border)',
        borderRadius: 'var(--r)',
      }}>
        <CheckCircle size={16} weight="fill" style={{ color: 'var(--green)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-text)' }}>Carteira balanceada</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>
            Todos os ativos estão dentro das bandas de tolerância.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Warning size={14} style={{ color: 'var(--amber)' }} />
        <span className="label">
          {all.length} sinal{all.length !== 1 ? 'is' : ''} de rebalanceamento
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {[
            ...sells.map((m) => ({ ...m, type: 'SELL' as const })),
            ...buys.map((m) => ({ ...m, type: 'BUY' as const })),
          ].map((m, i) => {
            const isSell = m.type === 'SELL';
            return (
              <motion.div
                key={m.assetId + m.type}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: isSell ? 'var(--red-subtle)' : 'var(--green-subtle)',
                  border: `1px solid ${isSell ? 'var(--red-border)' : 'var(--green-border)'}`,
                  borderRadius: 'var(--r)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CryptoIcon ticker={m.ticker} size={32} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                        {isSell ? 'Vender' : 'Comprar'} {m.ticker}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '1px 8px',
                        borderRadius: 99,
                        background: isSell ? 'var(--red-border)' : 'var(--green-border)',
                        color: isSell ? 'var(--red-text)' : 'var(--green-text)',
                      }}>
                        {isSell ? 'Take Profit' : 'Buy the Dip'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
                      Peso atual{' '}
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--t2)' }}>
                        {m.currentPct.toFixed(2)}%
                      </span>
                      {' '}→ alvo{' '}
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--t2)' }}>
                        {m.targetPct}%
                      </span>
                      {' '}({isSell ? '+' : '-'}{m.actionPct.toFixed(2)}% desvio)
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    {isSell
                      ? <TrendDown size={13} weight="bold" style={{ color: 'var(--red-text)' }} />
                      : <TrendUp size={13} weight="bold" style={{ color: 'var(--green-text)' }} />
                    }
                    <span className="mono" style={{
                      fontSize: 15, fontWeight: 700,
                      color: isSell ? 'var(--red-text)' : 'var(--green-text)',
                    }}>
                      {formatCurrency(m.actionValue)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>
                    {isSell ? 'a vender' : 'a comprar'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
