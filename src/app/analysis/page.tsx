'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, ComposedChart,
  CartesianGrid,
} from 'recharts';
import { TrendUp, TrendDown, Minus, ArrowRight, Warning, CheckCircle } from '@phosphor-icons/react';
import AppLayout from '../../components/layout/AppLayout';
import { CryptoIcon } from '../../components/icons/CryptoIcons';
import { AVAILABLE_ASSETS, formatCurrency } from '../portfolio/mockData';
import { getAnalysis } from '../../services/analysisService';
import type { Signal, AnalysisResult } from '../../services/analysisService';
import PremiumRoute from '../../components/PremiumRoute';

function getAssetName(ticker: string) {
  return AVAILABLE_ASSETS.find((a) => a.ticker === ticker)?.name ?? ticker;
}

/* ── Custom tooltips ─────────────────────────────────────────── */
function DeviationTooltip({ active, payload, signals }: { active?: boolean; payload?: any; signals: Signal[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const s = signals.find((m) => m.ticker === d.ticker);
  if (!s) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] px-3.5 py-2.5 shadow-[var(--s2)] text-[12px]">
      <div className="font-bold text-[var(--t1)] mb-1.5">{d.ticker}</div>
      <div className="text-[var(--t3)] mb-0.5">Atual: <strong className="text-[var(--t1)]">{(s.currentPct * 100).toFixed(1)}%</strong></div>
      <div className="text-[var(--t3)] mb-0.5">Alvo: <strong className="text-[var(--t1)]">{(s.targetPct * 100).toFixed(1)}%</strong></div>
      <div className="text-[var(--t3)] mb-1.5">
        Desvio relativo: <strong className={d.deviation >= 0 ? 'text-[#DC2626]' : 'text-[#059669]'}>
          {d.deviation >= 0 ? '+' : ''}{d.deviation.toFixed(1)}%
        </strong>
      </div>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        d.signal === 'SELL'
          ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
          : d.signal === 'BUY'
            ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
            : 'bg-[#F9FAFB] text-[#374151] border-[#E5E7EB]'
      }`}>{d.signal}</div>
    </div>
  );
}

function AllocationTooltip({ active, payload, label, signals }: { active?: boolean; payload?: any; label?: string | number; signals: Signal[] }) {
  if (!active || !payload?.length) return null;
  const s = signals.find((m) => m.ticker === label);
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] px-3.5 py-2.5 shadow-[var(--s2)] text-[12px] min-w-[160px]">
      <div className="font-bold text-[var(--t1)] mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
          <span className="text-[var(--t3)]">{p.dataKey}</span>
          <strong style={{ color: p.fill }} className="font-[var(--font-mono)]">{(p.value * 100).toFixed(1)}%</strong>
        </div>
      ))}
      {s && (
        <div className="mt-1.5 pt-1.5 border-t border-[var(--border-2)] text-[var(--t4)] text-[11px]">
          Banda: {(s.lowerThreshold * 100).toFixed(1)}% – {(s.upperThreshold * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/* ── Signal badge config ─────────────────────────────────────── */
const SIGNAL_CONFIG = {
  SELL: { bg: 'var(--red-subtle)',   border: 'var(--red-border)',   text: 'var(--red-text)',   label: 'Venda',    Icon: TrendDown },
  BUY:  { bg: 'var(--green-subtle)', border: 'var(--green-border)', text: 'var(--green-text)', label: 'Compra',   Icon: TrendUp   },
  HOLD: { bg: 'var(--bg)',           border: 'var(--border)',       text: 'var(--t3)',          label: 'Aguardar', Icon: Minus     },
};

/* ── Page ───────────────────────────────────────────────────── */
export default function AnalysisPage() {
  const [result,  setResult]  = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    getAnalysis()
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const signals      = result?.signals ?? [];
  const bandPct      = (result?.portfolio?.tolerance_band ?? 0.15) * 100;
  const activeSignals = signals.filter((s) => s.signal !== 'HOLD');
  const activeSells   = signals.filter((s) => s.signal === 'SELL');
  const activeBuys    = signals.filter((s) => s.signal === 'BUY');
  const totalValue    = signals[0]?.totalValueUsd ?? 0;

  // Derived chart data — percentages multiplied by 100 for display
  const deviationData = signals.map((s) => ({
    ticker:    s.ticker,
    deviation: parseFloat((s.deviationPct * 100).toFixed(2)),
    signal:    s.signal,
    color:     s.signal === 'SELL' ? '#DC2626' : s.signal === 'BUY' ? '#059669' : '#9CA3AF',
  }));

  const allocationData = signals.map((s) => ({
    ticker:  s.ticker,
    Alvo:    s.targetPct,
    Atual:   s.currentPct,
    signal:  s.signal,
    color:   s.signal === 'SELL' ? '#DC2626' : s.signal === 'BUY' ? '#059669' : '#6B7280',
  }));

  if (loading) {
    return (
      <PremiumRoute>
        <AppLayout title="Análise de Rebalanceamento" subtitle="Principal">
          <div className="py-[60px] text-center text-[var(--t4)] text-[13px]">
            Carregando análise…
          </div>
        </AppLayout>
      </PremiumRoute>
    );
  }

  return (
    <PremiumRoute>
    <AppLayout title="Análise de Rebalanceamento" subtitle="Principal">

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 mb-5 bg-[var(--red-subtle)] border border-[var(--red-border)] rounded-[var(--r)]">
          <Warning size={15} className="text-[var(--red)] shrink-0" />
          <span className="text-[13px] text-[var(--red-text)]">Erro ao carregar análise: {error}</span>
        </div>
      )}

      {/* Alert banner */}
      {!error && activeSignals.length > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 mb-5 bg-[var(--amber-subtle)] border border-[var(--amber-border)] rounded-[var(--r)]">
          <Warning size={15} className="text-[var(--amber)] shrink-0" />
          <span className="text-[13px] text-[var(--amber-text)] font-medium">
            <strong>{activeSignals.length} ativo{activeSignals.length > 1 ? 's' : ''}</strong> fora da banda de tolerância (±{bandPct.toFixed(0)}%) — ação recomendada.
          </span>
        </div>
      )}
      {!error && signals.length > 0 && activeSignals.length === 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 mb-5 bg-[var(--green-subtle)] border border-[var(--green-border)] rounded-[var(--r)]">
          <CheckCircle size={15} weight="fill" className="text-[var(--green)] shrink-0" />
          <span className="text-[13px] text-[var(--green-text)] font-medium">
            Carteira equilibrada — todos os ativos dentro da banda de tolerância.
          </span>
        </div>
      )}

      {/* No portfolio */}
      {!error && signals.length === 0 && !loading && (
        <div className="p-12 text-center text-[var(--t4)] text-[13px]">
          Nenhuma alocação configurada. Configure sua carteira na página de Alocação.
        </div>
      )}

      {/* Signal cards */}
      {signals.length > 0 && (
        <div className="grid grid-cols-4 gap-3.5 mb-6">
          {signals.map((s) => {
            const cfg = SIGNAL_CONFIG[s.signal];
            const IconComp = cfg.Icon;
            return (
              <div
                key={s.ticker}
                className={`card px-[18px] py-4 border-l-[3px] ${
                  s.signal === 'SELL'
                    ? 'border-l-[var(--red)]'
                    : s.signal === 'BUY'
                      ? 'border-l-[var(--green)]'
                      : 'border-l-[var(--border)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <CryptoIcon ticker={s.ticker} size={26} />
                    <div>
                      <div className="text-[13px] font-bold text-[var(--t1)]">{s.ticker}</div>
                      <div className="text-[11px] text-[var(--t4)]">{getAssetName(s.ticker)}</div>
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[10px] font-bold border"
                    style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
                  >
                    <IconComp size={9} weight="bold" />
                    {cfg.label}
                  </div>
                </div>

                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-[var(--t4)]">Atual</span>
                  <span className="text-[11px] text-[var(--t4)]">Alvo</span>
                </div>
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className={`mono text-[18px] font-[800] ${
                    s.signal === 'SELL'
                      ? 'text-[var(--red)]'
                      : s.signal === 'BUY'
                        ? 'text-[var(--green)]'
                        : 'text-[var(--t1)]'
                  }`}>
                    {(s.currentPct * 100).toFixed(1)}%
                  </span>
                  <div className="flex items-center gap-[5px] text-[var(--t3)]">
                    <ArrowRight size={11} />
                    <span className="mono text-[14px] font-bold">{(s.targetPct * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* P&L row */}
                {s.quantity > 0 && (
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-[10px] text-[var(--t4)] mb-px">Não realizado</div>
                      <div className={`mono text-[12px] font-bold ${s.unrealizedPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                        {s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[var(--t4)] mb-px">P&L Total</div>
                      <div className={`mono text-[12px] font-bold ${s.totalPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                        {s.totalPnl >= 0 ? '+' : ''}{formatCurrency(s.totalPnl)}
                      </div>
                    </div>
                  </div>
                )}

                {s.signal !== 'HOLD' ? (
                  <div className={`px-2.5 py-[7px] rounded-[var(--r-sm)] border ${
                    s.signal === 'SELL'
                      ? 'bg-[var(--red-subtle)] border-[var(--red-border)]'
                      : 'bg-[var(--green-subtle)] border-[var(--green-border)]'
                  }`}>
                    <div className={`text-[10px] font-semibold mb-px ${
                      s.signal === 'SELL' ? 'text-[var(--red-text)]' : 'text-[var(--green-text)]'
                    }`}>
                      {s.signal === 'SELL' ? 'TAKE PROFIT — Vender excesso' : 'BUY THE DIP — Comprar déficit'}
                    </div>
                    <div className={`mono text-[13px] font-[800] ${
                      s.signal === 'SELL' ? 'text-[var(--red)]' : 'text-[var(--green)]'
                    }`}>
                      {formatCurrency(s.actionValueUsd)}
                    </div>
                    <div className="text-[10px] text-[var(--t4)] mt-px">
                      {(s.actionPct * 100).toFixed(1)}% da carteira
                    </div>
                  </div>
                ) : (
                  <div className="px-2.5 py-[7px] bg-[var(--bg)] border border-[var(--border-2)] rounded-[var(--r-sm)] text-[11px] text-[var(--t4)]">
                    Dentro da banda ±{bandPct.toFixed(0)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      {signals.length > 0 && (
        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Deviation chart */}
          <div className="card px-5 py-[18px]">
            <div className="mb-4">
              <div className="text-[13px] font-bold text-[var(--t1)] mb-[3px]">Desvio Relativo ao Alvo</div>
              <div className="text-[12px] text-[var(--t3)]">(atual − alvo) ÷ alvo × 100. Gatilho em ±{bandPct.toFixed(0)}%</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deviationData} barSize={36} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-2)" />
                <XAxis dataKey="ticker" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--t2)', fontFamily: 'inherit' }} />
                <YAxis tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t4)', fontFamily: 'var(--font-mono)' }} domain={['auto', 'auto']} />
                <Tooltip content={(props) => <DeviationTooltip {...props} signals={signals} />} cursor={{ fill: 'var(--bg)', radius: 4 }} />
                <ReferenceLine y={bandPct}  stroke="#DC2626" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: `+${bandPct.toFixed(0)}% SELL`, position: 'right', fontSize: 9, fill: '#DC2626', fontWeight: 700 }} />
                <ReferenceLine y={-bandPct} stroke="#059669" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: `-${bandPct.toFixed(0)}% BUY`,  position: 'right', fontSize: 9, fill: '#059669', fontWeight: 700 }} />
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                <Bar dataKey="deviation" radius={[4, 4, 0, 0]}>
                  {deviationData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {[{ color: '#DC2626', label: 'Acima da banda (SELL)' }, { color: '#9CA3AF', label: 'Dentro da banda (HOLD)' }, { color: '#059669', label: 'Abaixo da banda (BUY)' }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-[5px]">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
                  <span className="text-[10px] text-[var(--t4)] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation comparison */}
          <div className="card px-5 py-[18px]">
            <div className="mb-4">
              <div className="text-[13px] font-bold text-[var(--t1)] mb-[3px]">Alocação Atual vs Alvo</div>
              <div className="text-[12px] text-[var(--t3)]">Comparação direta entre o peso atual e o peso alvo</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={allocationData} barCategoryGap="30%" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-2)" />
                <XAxis dataKey="ticker" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--t2)', fontFamily: 'inherit' }} />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t4)', fontFamily: 'var(--font-mono)' }} />
                <Tooltip content={(props) => <AllocationTooltip {...props} signals={signals} />} cursor={{ fill: 'var(--bg)', radius: 4 }} />
                <Bar dataKey="Alvo"  barSize={32} radius={[3, 3, 0, 0]} fill="#C7D2FE" opacity={0.9} />
                <Bar dataKey="Atual" barSize={20} radius={[3, 3, 0, 0]}>
                  {allocationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {[{ color: '#C7D2FE', label: 'Alvo' }, { color: '#6B7280', label: 'Atual (HOLD)' }, { color: '#DC2626', label: 'Atual (SELL)' }, { color: '#059669', label: 'Atual (BUY)' }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-[5px]">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
                  <span className="text-[10px] text-[var(--t4)] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action plan table */}
      {signals.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)]">
            <div className="text-[13px] font-bold text-[var(--t1)] mb-0.5">Plano de Ação</div>
            <div className="text-[12px] text-[var(--t3)]">Operações necessárias para rebalancear ao alvo</div>
          </div>

          <div className="grid grid-cols-[160px_90px_90px_90px_100px_1fr_110px_110px] px-5 py-2 bg-[var(--bg)] border-b border-[var(--border-2)]">
            {['Ativo', 'Atual', 'Alvo', 'Desvio', 'Banda', 'Ação necessária', 'P&L N. Real.', 'Sinal'].map((h) => (
              <div key={h} className="label">{h}</div>
            ))}
          </div>

          {signals.map((s, i) => {
            const cfg = SIGNAL_CONFIG[s.signal];
            const IconComp = cfg.Icon;
            const deviationAbsolute = (s.currentPct - s.targetPct) * 100;
            const unrealizedColor = s.unrealizedPnl > 0 ? 'text-[var(--green)]' : s.unrealizedPnl < 0 ? 'text-[var(--red)]' : 'text-[var(--t4)]';
            return (
              <div
                key={s.ticker}
                className={`grid grid-cols-[160px_90px_90px_90px_100px_1fr_110px_110px] px-5 py-[13px] items-center transition-colors duration-150 hover:bg-[var(--bg)] border-l-[3px] ${
                  i < signals.length - 1 ? 'border-b border-b-[var(--border-2)]' : ''
                } ${
                  s.signal === 'SELL'
                    ? 'border-l-[var(--red)]'
                    : s.signal === 'BUY'
                      ? 'border-l-[var(--green)]'
                      : 'border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-[9px]">
                  <CryptoIcon ticker={s.ticker} size={26} />
                  <div>
                    <div className="text-[13px] font-bold text-[var(--t1)]">{s.ticker}</div>
                    <div className="text-[11px] text-[var(--t4)]">{getAssetName(s.ticker)}</div>
                  </div>
                </div>
                <div className="mono text-[13px] font-bold text-[var(--t1)]">{(s.currentPct * 100).toFixed(1)}%</div>
                <div className="mono text-[13px] font-semibold text-[var(--t3)]">{(s.targetPct * 100).toFixed(1)}%</div>
                <div className={`mono text-[13px] font-bold ${
                  deviationAbsolute > 0 ? 'text-[var(--red)]' : deviationAbsolute < 0 ? 'text-[var(--green)]' : 'text-[var(--t4)]'
                }`}>
                  {deviationAbsolute >= 0 ? '+' : ''}{deviationAbsolute.toFixed(1)}%
                </div>
                <div className="mono text-[11px] text-[var(--t4)]">
                  {(s.lowerThreshold * 100).toFixed(1)}% – {(s.upperThreshold * 100).toFixed(1)}%
                </div>
                <div>
                  {s.signal !== 'HOLD' ? (
                    <div>
                      <div className={`text-[12px] font-semibold mb-0.5 ${
                        s.signal === 'SELL' ? 'text-[var(--red-text)]' : 'text-[var(--green-text)]'
                      }`}>
                        {s.signal === 'SELL' ? 'Vender' : 'Comprar'} {formatCurrency(s.actionValueUsd)}
                      </div>
                      <div className="text-[11px] text-[var(--t4)]">
                        Para retornar de {(s.currentPct * 100).toFixed(1)}% → {(s.targetPct * 100).toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    <div className="text-[12px] text-[var(--t4)]">Nenhuma ação necessária</div>
                  )}
                </div>
                <div>
                  <div className={`mono text-[12px] font-bold ${unrealizedColor}`}>
                    {s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}
                  </div>
                  {s.realizedPnl !== 0 && (
                    <div className="text-[10px] text-[var(--t4)] mt-px">
                      Real.: {s.realizedPnl >= 0 ? '+' : ''}{formatCurrency(s.realizedPnl)}
                    </div>
                  )}
                </div>
                <div
                  className="inline-flex items-center gap-[5px] px-3 py-1 rounded-full w-fit text-[11px] font-bold border"
                  style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
                >
                  <IconComp size={10} weight="bold" />
                  {cfg.label.toUpperCase()}
                </div>
              </div>
            );
          })}

          <div className="px-5 py-3 bg-[var(--bg)] border-t border-[var(--border)] flex gap-6 flex-wrap">
            <div className="text-[12px] text-[var(--t3)]">
              Valor total: <strong className="mono text-[var(--t1)]">{formatCurrency(totalValue)}</strong>
            </div>
            <div className="text-[12px] text-[var(--red-text)]">
              Volume a vender: <strong className="mono">{formatCurrency(activeSells.reduce((s, m) => s + m.actionValueUsd, 0))}</strong>
            </div>
            <div className="text-[12px] text-[var(--green-text)]">
              Volume a comprar: <strong className="mono">{formatCurrency(activeBuys.reduce((s, m) => s + m.actionValueUsd, 0))}</strong>
            </div>
            {(() => {
              const totalPnlAll = signals.reduce((sum, s) => sum + s.totalPnl, 0);
              const pnlColor = totalPnlAll >= 0 ? 'text-[var(--green-text)]' : 'text-[var(--red-text)]';
              return (
                <div className="text-[12px] text-[var(--t3)]">
                  P&L total: <strong className={`mono ${pnlColor}`}>{totalPnlAll >= 0 ? '+' : ''}{formatCurrency(totalPnlAll)}</strong>
                </div>
              );
            })()}
            <div className="text-[12px] text-[var(--t4)]">
              Banda: <strong className="mono text-[var(--blue)]">±{bandPct.toFixed(0)}%</strong>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
    </PremiumRoute>
  );
}
