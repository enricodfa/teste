'use client';

import { motion } from 'framer-motion';

interface BandIndicatorProps {
  current: number;
  target: number;
  lower: number;
  upper: number;
  color: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
}

export default function BandIndicator({ current, target, lower, upper, color, signal }: BandIndicatorProps) {
  // Build a visible range centered on target
  const pad = Math.max(upper - target, 3) * 2.8;
  const min = Math.max(0, target - pad);
  const max = Math.min(100, target + pad);
  const range = max - min || 1;
  const toPos = (v: number) => Math.max(0, Math.min(100, ((v - min) / range) * 100));

  const lPos = toPos(lower);
  const uPos = toPos(upper);
  const tPos = toPos(target);
  const cPos = toPos(current);

  const dotColor =
    signal === 'SELL' ? 'var(--red)' :
    signal === 'BUY'  ? 'var(--green)' :
    'var(--blue)';

  const bandColor =
    signal === 'SELL' ? 'rgba(220,38,38,0.08)' :
    signal === 'BUY'  ? 'rgba(5,150,105,0.08)' :
    'rgba(59,91,219,0.07)';

  return (
    <div>
      {/* Threshold labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 10, color: 'var(--t4)', marginBottom: 5,
        fontFamily: 'var(--font-mono)',
      }}>
        <span>{lower.toFixed(0)}%</span>
        <span style={{ color, fontWeight: 600 }}>alvo {target}%</span>
        <span>{upper.toFixed(0)}%</span>
      </div>

      {/* Track */}
      <div style={{
        position: 'relative',
        height: 8,
        background: 'var(--bg)',
        borderRadius: 99,
        border: '1px solid var(--border-2)',
      }}>
        {/* Band zone */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${lPos}%`,
          width: `${uPos - lPos}%`,
          background: bandColor,
          borderRadius: 99,
        }} />

        {/* Target line */}
        <div style={{
          position: 'absolute', top: -2, bottom: -2,
          left: `${tPos}%`,
          width: 2,
          background: color,
          borderRadius: 1,
          opacity: 0.5,
        }} />

        {/* Current dot */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: `${cPos}%`,
            transform: 'translate(-50%, -50%)',
            width: 12, height: 12,
            borderRadius: '50%',
            background: dotColor,
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            zIndex: 2,
          }}
          animate={signal !== 'HOLD' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>

      {/* Current value label */}
      <div style={{
        textAlign: 'right',
        fontSize: 10,
        marginTop: 4,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color: dotColor,
      }}>
        {current.toFixed(2)}% atual
      </div>
    </div>
  );
}
