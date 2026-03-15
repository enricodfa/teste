'use client';

import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { CryptoIcon } from '../../../components/icons/CryptoIcons';
import type { AssetMetrics } from '../mockData';
import { formatCurrency, formatPct } from '../mockData';
import BandIndicator from './BandIndicator';

const SIGNAL = {
  SELL: { label: 'Vender',  color: 'var(--red)',   bg: 'var(--red-subtle)',   border: 'var(--red-border)',   text: 'var(--red-text)',   Icon: TrendDown, sub: 'Acima da banda' },
  BUY:  { label: 'Comprar', color: 'var(--green)', bg: 'var(--green-subtle)', border: 'var(--green-border)', text: 'var(--green-text)', Icon: TrendUp,   sub: 'Abaixo da banda' },
  HOLD: { label: 'Manter',  color: 'var(--blue)',  bg: 'var(--blue-subtle)',  border: 'var(--border-2)',     text: 'var(--blue-text)',  Icon: Minus,     sub: 'Dentro da banda' },
};

interface AssetCardProps {
  metrics: AssetMetrics;
  index: number;
}

export default function AssetCard({ metrics, index }: AssetCardProps) {
  const {
    ticker, name, price, priceChange24h, color,
    targetPct, quantity, value,
    currentPct, upperThreshold, lowerThreshold,
    deviation, signal, actionValue,
  } = metrics;

  const s = SIGNAL[signal];
  const up = priceChange24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.28 }}
      className="card"
      style={{
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        /* left accent by signal */
        borderLeft: `3px solid ${signal === 'SELL' ? 'var(--red)' : signal === 'BUY' ? 'var(--green)' : 'var(--border)'}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CryptoIcon ticker={ticker} size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.01em' }}>{ticker}</div>
            <div style={{ fontSize: 12, color: 'var(--t4)', marginTop: 1 }}>{name}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>
            {formatCurrency(price)}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end',
            marginTop: 3, fontSize: 11, fontWeight: 600,
            color: up ? 'var(--green-text)' : 'var(--red-text)',
          }}>
            {up ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />}
            <span className="mono">{formatPct(priceChange24h)}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          {
            label: 'Quantidade',
            value: quantity < 1
              ? quantity.toFixed(4)
              : quantity.toLocaleString('en-US', { maximumFractionDigits: 2 }),
            valueColor: 'var(--t1)',
          },
          {
            label: 'Valor',
            value: formatCurrency(value),
            valueColor: color,
          },
          {
            label: 'Desvio',
            value: `${deviation >= 0 ? '+' : ''}${deviation.toFixed(2)}%`,
            valueColor:
              Math.abs(deviation) < 2 ? 'var(--green-text)' :
              Math.abs(deviation) < 4 ? 'var(--amber-text)' :
              'var(--red-text)',
          },
        ].map(({ label, value: v, valueColor }) => (
          <div
            key={label}
            style={{
              padding: '8px 10px',
              background: 'var(--bg)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--r-sm)',
            }}
          >
            <div className="label" style={{ marginBottom: 4 }}>{label}</div>
            <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: valueColor }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Band */}
      <BandIndicator
        current={currentPct}
        target={targetPct}
        lower={lowerThreshold}
        upper={upperThreshold}
        color={color}
        signal={signal}
      />

      {/* Signal footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 12, padding: '8px 10px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--r-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <s.Icon size={13} weight="bold" style={{ color: s.text }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: s.text }}>{s.label}</span>
          <span style={{ fontSize: 11, color: 'var(--t4)' }}>— {s.sub}</span>
        </div>
        {signal !== 'HOLD' && (
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: s.text }}>
            {formatCurrency(actionValue)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
