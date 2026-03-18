'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, ComposedChart,
  CartesianGrid,
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Minus, ArrowRight, 
  AlertTriangle, CheckCircle2, Wallet, Layers, 
  Activity, TrendingUp as BuyIcon, TrendingDown as SellIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../components/layout/AppLayout';
import { formatCurrency } from '../portfolio/mockData';
import { getAnalysis } from '../../services/analysisService';
import type { Signal, AnalysisResult } from '../../services/analysisService';
import PremiumRoute from '../../components/PremiumRoute';

/* ── Motion & Styles ─────────────────────────────────────────── */
const ease = [0.23, 1, 0.32, 1] as const;
const transition = { duration: 0.6, ease };

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, ease } }
};

const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition }
};

const glassCard = "bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_-8px_rgba(79,70,229,0.08)] rounded-[24px]";
const glassWidget = "bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm rounded-[16px]";
const textMain = "text-zinc-900";
const textMuted = "text-gray-500";

/* ── Custom tooltips ─────────────────────────────────────────── */
function DeviationTooltip({ active, payload, signals }: { active?: boolean; payload?: any; signals: Signal[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const s = signals.find((m) => m.ticker === d.ticker);
  if (!s) return null;
  
  const isPositive = d.deviation >= 0;
  
  return (
    <div className={`${glassWidget} px-4 py-3 min-w-[180px]`}>
      <div className={`font-sans font-semibold ${textMain} mb-2 flex items-center gap-2 tracking-tight`}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
        {d.ticker}
      </div>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[12px] font-medium ${textMuted}`}>Atual</span>
        <strong className={`font-mono text-[13px] ${textMain}`}>{(s.currentPct * 100).toFixed(1)}%</strong>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[12px] font-medium ${textMuted}`}>Alvo</span>
        <strong className={`font-mono text-[13px] ${textMain}`}>{(s.targetPct * 100).toFixed(1)}%</strong>
      </div>
      <div className="h-px w-full bg-gray-200 my-2" />
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[12px] font-medium ${textMuted}`}>Desvio</span>
        <strong className={`font-mono text-[13px] ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
          {isPositive ? '+' : ''}{d.deviation.toFixed(1)}%
        </strong>
      </div>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${d.signal === 'SELL' ? 'bg-red-50 text-red-700 border-red-100' : d.signal === 'BUY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
        {d.signal === 'SELL' ? <TrendingDown size={12} strokeWidth={2.5}/> : d.signal === 'BUY' ? <TrendingUp size={12} strokeWidth={2.5}/> : <Minus size={12} strokeWidth={2.5}/>}
        {d.signal}
      </div>
    </div>
  );
}

function AllocationTooltip({ active, payload, label, signals }: { active?: boolean; payload?: any; label?: string | number; signals: Signal[] }) {
  if (!active || !payload?.length) return null;
  const s = signals.find((m) => m.ticker === label);
  
  return (
    <div className={`${glassWidget} px-4 py-3 min-w-[180px]`}>
      <div className={`font-sans font-semibold ${textMain} mb-3 tracking-tight`}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-6 mb-1.5 items-center">
          <span className={`text-[12px] font-medium ${textMuted}`}>{p.dataKey}</span>
          <strong style={{ color: p.fill }} className="font-mono text-[13px]">{(p.value * 100).toFixed(1)}%</strong>
        </div>
      ))}
      {s && (
        <>
          <div className="h-px w-full bg-gray-200 my-2" />
          <div className={`text-[11px] font-medium ${textMuted} flex justify-between gap-4`}>
            <span>Banda Limite</span>
            <span className="font-mono">{(s.lowerThreshold * 100).toFixed(1)}% – {(s.upperThreshold * 100).toFixed(1)}%</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Signal badge config ─────────────────────────────────────── */
const SIGNAL_CONFIG = {
  SELL: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', label: 'Venda', Icon: SellIcon, color: '#ef4444' },
  BUY:  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', label: 'Compra', Icon: BuyIcon, color: '#10b981' },
  HOLD: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-500', label: 'Aguardar', Icon: Minus, color: '#94a3b8' },
};

/* ── Page ───────────────────────────────────────────────────── */
export default function AnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalysis()
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const signals = result?.signals ?? [];
  const bandPct = (result?.portfolio?.tolerance_band ?? 0.15) * 100;
  const activeSignals = signals.filter((s) => s.signal !== 'HOLD');
  const activeSells = signals.filter((s) => s.signal === 'SELL');
  const activeBuys = signals.filter((s) => s.signal === 'BUY');
  const totalValue = signals.reduce((sum, s) => sum + (s.totalValueUsd || 0), 0);

  const deviationData = signals.map((s) => ({
    ticker: s.ticker,
    deviation: parseFloat((s.deviationPct * 100).toFixed(2)),
    signal: s.signal,
    color: SIGNAL_CONFIG[s.signal].color,
  }));

  const allocationData = signals.map((s) => ({
    ticker: s.ticker,
    Alvo: s.targetPct,
    Atual: s.currentPct,
    signal: s.signal,
    color: SIGNAL_CONFIG[s.signal].color,
  }));

  if (loading) {
    return (
      <PremiumRoute>
        <AppLayout title="Análise de Rebalanceamento" subtitle="Monitoramento SaaS">
          <div className="flex py-[120px] items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Activity className="text-indigo-500" size={32} strokeWidth={2}/>
            </motion.div>
          </div>
        </AppLayout>
      </PremiumRoute>
    );
  }

  return (
    <PremiumRoute>
      <AppLayout title="Análise de Rebalanceamento" subtitle="Otimização 60-30-10">
        <div className="max-w-[1200px] mx-auto w-full pb-[80px] text-zinc-900 bg-[#F8F9FA] rounded-[32px] p-6">
          
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard} flex items-center gap-3 p-4 bg-red-50/80 border-red-100 mb-6`}>
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0" strokeWidth={2}/>
                <span className="text-[14px] text-red-700 font-medium tracking-tight">Erro ao carregar análise: {error}</span>
              </motion.div>
            )}

            {!error && activeSignals.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`${glassCard} flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50/70 to-violet-50/70 border-indigo-100 mb-6 shadow-sm`}>
                <Activity size={18} className="text-indigo-600 flex-shrink-0" strokeWidth={2}/>
                <span className="text-[14px] text-indigo-900 font-medium tracking-tight">
                  <strong className="font-bold text-indigo-950">{activeSignals.length} alocação(ões)</strong> fora da banda de tolerância (±{bandPct.toFixed(0)}%). O portfólio exige rebalanceamento.
                </span>
              </motion.div>
            )}

            {!error && signals.length > 0 && activeSignals.length === 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard} flex items-center gap-3 p-4 bg-emerald-50/70 border-emerald-100 mb-6`}>
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" strokeWidth={2}/>
                <span className="text-[14px] text-emerald-800 font-medium tracking-tight">
                  Portfólio equilibrado — todas as alocações monitoradas dentro da banda (±{bandPct.toFixed(0)}%).
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!error && signals.length === 0 && !loading && (
            <div className="p-16 text-center text-gray-400 text-[14px] font-medium tracking-tight bg-white overflow-hidden rounded-[24px]">
              Nenhum dado financeiro rastreado. Acesse a configuração do portfólio.
            </div>
          )}

          {/* Widgets Grid */}
          {signals.length > 0 && (
            <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {signals.map((s) => {
                const cfg = SIGNAL_CONFIG[s.signal];
                const IconComp = cfg.Icon;
                
                return (
                  <motion.div
                    variants={itemVars}
                    whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(79,70,229,0.15)" }}
                    transition={transition}
                    key={s.ticker}
                    className={`${glassCard} p-6 relative group overflow-hidden bg-white`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: cfg.color }} />
                    
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
                          {s.logo ? (
                            <img src={s.logo} alt={s.ticker} className="w-6 h-6 object-cover" />
                          ) : (
                            <Layers size={18} strokeWidth={2}/>
                          )}
                        </div>
                        <div>
                          <div className={`text-[15px] font-sans font-bold ${textMain} tracking-tight`}>{s.ticker}</div>
                          <div className={`text-[12px] font-medium ${textMuted} tracking-tight`}>Alocação de Risco</div>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        <IconComp size={12} strokeWidth={2.5} />
                        <span className="uppercase tracking-wider">{cfg.label}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className={`text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1`}>Atual</div>
                        <div className={`font-mono text-[24px] font-bold tracking-tight ${cfg.text}`}>
                          {(s.currentPct * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1`}>Alvo</div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <ArrowRight size={14} strokeWidth={2}/>
                          <span className={`font-mono text-[16px] font-semibold ${textMain}`}>{(s.targetPct * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Micro-interaction */}
                    <div className="w-full bg-gray-100 rounded-full h-[6px] mb-5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s.currentPct * 100}%` }}
                        transition={{ duration: 1, ease }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: cfg.color }} 
                      />
                    </div>

                    {/* Unrealized P&L Info */}
                    {s.quantity > 0 && (
                      <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100 mb-4">
                        <div>
                          <div className={`text-[11px] font-semibold ${textMuted} uppercase tracking-widest mb-1`}>P&L Aberto</div>
                          <div className={`font-mono text-[13px] font-bold ${s.unrealizedPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[11px] font-semibold ${textMuted} uppercase tracking-widest mb-1`}>P&L Total</div>
                          <div className={`font-mono text-[13px] font-bold ${s.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {s.totalPnl >= 0 ? '+' : ''}{formatCurrency(s.totalPnl)}
                          </div>
                        </div>
                      </div>
                    )}

                    {s.signal !== 'HOLD' ? (
                      <div className={`p-4 rounded-[16px] border ${cfg.bg} ${cfg.border} transition-colors group-hover:bg-opacity-80`}>
                        <div className={`text-[11px] font-bold mb-1.5 uppercase tracking-wider ${cfg.text} flex items-center gap-1.5`}>
                          {s.signal === 'SELL' ? 'Take Profit — Reduzir' : 'Buy the Dip — Aumentar'}
                        </div>
                        <div className={`font-mono text-[18px] font-bold tracking-tight ${cfg.text}`}>
                          {formatCurrency(s.actionValueUsd)}
                        </div>
                        <div className={`text-[12px] font-medium text-gray-500 mt-1 tracking-tight`}>
                          {(s.actionPct * 100).toFixed(1)}% do capital
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-[16px] flex items-center justify-center text-[12px] text-gray-400 font-semibold tracking-wide uppercase">
                        Sincronizado na Banda
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Charts Area */}
          {signals.length > 0 && (
            <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              <motion.div variants={itemVars} className={`${glassCard} p-6 bg-white overflow-hidden`}>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className={`text-[16px] font-sans font-bold ${textMain} tracking-tight`}>Desvio da Banda de Tolerância</h3>
                    <p className={`text-[13px] font-medium ${textMuted} tracking-tight mt-1.5`}>Distância relativa entre o peso atual e o alvo estipulado</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[12px] flex items-center justify-center">
                    <Activity size={18} strokeWidth={2}/>
                  </div>
                </div>
                
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#F3F4F6" />
                      <XAxis dataKey="ticker" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#6B7280', fontFamily: 'inherit' }} dy={12} />
                      <YAxis tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#9CA3AF', fontFamily: 'monospace' }} domain={['auto', 'auto']} dx={-10} />
                      <Tooltip content={(props) => <DeviationTooltip {...props} signals={signals} />} cursor={{ fill: 'rgba(79,70,229,0.04)', radius: 8 }} />
                      <ReferenceLine y={bandPct} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} label={{ value: `+${bandPct.toFixed(0)}%`, position: 'insideTopLeft', fontSize: 10, fill: '#ef4444', fontWeight: 700 }} />
                      <ReferenceLine y={-bandPct} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} label={{ value: `-${bandPct.toFixed(0)}%`, position: 'insideBottomLeft', fontSize: 10, fill: '#10b981', fontWeight: 700 }} />
                      <ReferenceLine y={0} stroke="#E5E7EB" strokeWidth={2} />
                      <Bar dataKey="deviation" radius={[6, 6, 6, 6]} barSize={32}>
                        {deviationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVars} className={`${glassCard} p-6 bg-white overflow-hidden`}>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className={`text-[16px] font-sans font-bold ${textMain} tracking-tight`}>Distribuição do Capital</h3>
                    <p className={`text-[13px] font-medium ${textMuted} tracking-tight mt-1.5`}>Comparativo de alocação alvo vs. retenção atual</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[12px] flex items-center justify-center">
                    <Wallet size={18} strokeWidth={2}/>
                  </div>
                </div>

                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={allocationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#F3F4F6" />
                      <XAxis dataKey="ticker" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#6B7280', fontFamily: 'inherit' }} dy={12} />
                      <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#9CA3AF', fontFamily: 'monospace' }} dx={-10} />
                      <Tooltip content={(props) => <AllocationTooltip {...props} signals={signals} />} cursor={{ fill: 'rgba(79,70,229,0.04)', radius: 8 }} />
                      <Bar dataKey="Alvo" barSize={36} radius={[6, 6, 0, 0]} fill="#EEF2FF" />
                      <Bar dataKey="Atual" barSize={20} radius={[6, 6, 0, 0]}>
                        {allocationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* O Pulso - Action Plan Component */}
          {signals.length > 0 && (
            <motion.div variants={itemVars} initial="hidden" animate="show" className={`${glassCard} bg-white overflow-hidden`}>
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className={`text-[18px] font-sans font-bold ${textMain} tracking-tight`}>O Pulso: Monitor de Rebalanceamento</h3>
                  <p className={`text-[13px] font-medium ${textMuted} tracking-tight mt-1.5`}>Relação de ordens sistemáticas exigidas para centralizar portfólio no alvo de risco</p>
                </div>
                <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-[12px] tracking-wide shadow-sm border border-indigo-100">
                  Ação Recomendada
                </div>
              </div>

              <div className="overflow-x-auto scroller-clean">
                <div className="min-w-[1000px]">
                  {/* Dense Grid Header */}
                  <div className="grid grid-cols-[1.5fr_100px_100px_100px_130px_180px_130px_130px] px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    <div>Ativo Base</div>
                    <div>Atual</div>
                    <div>Alvo</div>
                    <div>Desvio</div>
                    <div>Limites (Banda)</div>
                    <div>Ajuste (P/ Retornar)</div>
                    <div>Resultado (P&L)</div>
                    <div className="text-right">Sinalização</div>
                  </div>

                  {/* Density Rows */}
                  <div className="divide-y divide-gray-100/80">
                    {signals.map((s) => {
                      const cfg = SIGNAL_CONFIG[s.signal];
                      const IconComp = cfg.Icon;
                      const deviationAbsolute = (s.currentPct - s.targetPct) * 100;
                      
                      return (
                        <div key={s.ticker} className="grid grid-cols-[1.5fr_100px_100px_100px_130px_180px_130px_130px] px-8 py-5 items-center hover:bg-slate-50/70 transition-colors duration-200 group">
                          
                          {/* Col 1 */}
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 overflow-hidden transition-colors">
                              {s.logo ? (
                                <img src={s.logo} alt={s.ticker} className="w-6 h-6 object-cover" />
                              ) : (
                                <Layers size={18} strokeWidth={2}/>
                              )}
                            </div>
                            <span className={`text-[15px] font-bold ${textMain} tracking-tight`}>{s.ticker}</span>
                          </div>

                          {/* Col 2 */}
                          <div className={`font-mono text-[14px] font-bold ${textMain}`}>{(s.currentPct * 100).toFixed(1)}%</div>

                          {/* Col 3 */}
                          <div className={`font-mono text-[14px] font-medium text-gray-400`}>{(s.targetPct * 100).toFixed(1)}%</div>

                          {/* Col 4 */}
                          <div className={`font-mono text-[14px] font-bold ${deviationAbsolute > 0 ? 'text-red-500' : deviationAbsolute < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                            {deviationAbsolute >= 0 ? '+' : ''}{deviationAbsolute.toFixed(1)}%
                          </div>

                          {/* Col 5 */}
                          <div className="font-mono text-[12px] font-medium text-gray-400 tracking-tighter">
                            {(s.lowerThreshold * 100).toFixed(1)}% - {(s.upperThreshold * 100).toFixed(1)}%
                          </div>

                          {/* Col 6 */}
                          <div>
                            {s.signal !== 'HOLD' ? (
                              <div>
                                <div className={`font-mono text-[15px] font-bold ${cfg.text} tracking-tight`}>
                                  {formatCurrency(s.actionValueUsd)}
                                </div>
                                <div className={`text-[12px] font-medium text-gray-400 mt-1 tracking-tight`}>
                                  {s.signal === 'SELL' ? 'Vender volume' : 'Comprar volume'}
                                </div>
                              </div>
                            ) : (
                              <div className="text-[13px] font-medium text-gray-400 italic">Dentro da margem</div>
                            )}
                          </div>

                          {/* Col 7 (P&L) */}
                          <div>
                            <div className={`font-mono text-[14px] font-bold ${s.unrealizedPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}
                            </div>
                            {s.realizedPnl !== 0 && (
                              <div className="text-[11px] font-medium text-gray-400 mt-1 tracking-tight">
                                Fix.: {s.realizedPnl >= 0 ? '+' : ''}{formatCurrency(s.realizedPnl)}
                              </div>
                            )}
                          </div>

                          {/* Col 8 */}
                          <div className="flex justify-end">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                              <IconComp size={12} strokeWidth={2.5} />
                              <span className="uppercase tracking-widest">{cfg.label}</span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-8 py-5 bg-gradient-to-r from-gray-50/80 to-indigo-50/20 border-t border-gray-100 flex gap-10 items-center flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Capital Analisado (AUM)</span>
                  <strong className="font-mono text-[18px] text-indigo-950 font-bold">{formatCurrency(totalValue)}</strong>
                </div>
                
                <div className="w-px h-10 bg-gray-200/80" />
                
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-1.5">Volume Excedente (SELL)</span>
                  <strong className="font-mono text-[18px] text-red-600 font-bold">{formatCurrency(activeSells.reduce((s, m) => s + m.actionValueUsd, 0))}</strong>
                </div>

                <div className="w-px h-10 bg-gray-200/80" />
                
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Volume Faltante (BUY)</span>
                  <strong className="font-mono text-[18px] text-emerald-600 font-bold">{formatCurrency(activeBuys.reduce((s, m) => s + m.actionValueUsd, 0))}</strong>
                </div>

                <div className="w-px h-10 bg-gray-200/80" />

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Regra Operacional</span>
                  <strong className="font-mono text-[18px] text-indigo-600 font-bold tracking-tight">Tolerância de ±{bandPct.toFixed(0)}%</strong>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </AppLayout>
    </PremiumRoute>
  );
}
