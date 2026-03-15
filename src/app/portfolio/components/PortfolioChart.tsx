'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { AssetMetrics } from '../mockData';
import { formatCurrency } from '../mockData';

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; color: string; target?: number } }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r)',
      padding: '10px 14px',
      boxShadow: 'var(--s1)',
      fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: d.color, marginBottom: 4 }}>{d.name}</div>
      <div className="mono" style={{ color: 'var(--t2)' }}>{d.value.toFixed(2)}%</div>
      {d.target !== undefined && (
        <div style={{ color: 'var(--t4)', marginTop: 2 }}>alvo: {d.target}%</div>
      )}
    </div>
  );
};

export default function PortfolioChart({ metrics }: { metrics: AssetMetrics[] }) {
  const totalValue = metrics[0]?.totalValue ?? 0;

  const currentData = metrics.map((m) => ({
    name: m.ticker, value: parseFloat(m.currentPct.toFixed(2)),
    target: m.targetPct, color: m.color,
  }));

  const targetData = metrics.map((m) => ({
    name: m.ticker, value: m.targetPct, color: m.color,
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Current */}
      <div>
        <div className="label" style={{ marginBottom: 12 }}>Alocação Atual</div>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={currentData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {currentData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              {formatCurrency(totalValue)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 1 }}>total</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
          {currentData.map((d) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', flex: 1 }}>{d.name}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--t1)', fontWeight: 600 }}>{d.value.toFixed(1)}%</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--t4)' }}>/{d.target}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Target */}
      <div>
        <div className="label" style={{ marginBottom: 12 }}>Alocação Alvo</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={targetData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value" strokeWidth={0}>
              {targetData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.35} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
          {targetData.map((d) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, opacity: 0.5, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', flex: 1 }}>{d.name}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
