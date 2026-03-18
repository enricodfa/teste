'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, AlertTriangle, CheckCircle2, Save, PieChart, Layers
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { DEFAULT_TOLERANCE_BAND } from '../portfolio/mockData';
import { CryptoIcon } from '../../components/icons/CryptoIcons';
import { getAllocation, saveAllocation } from '../../services/allocationService';
import AssetSelector from '../../components/AssetSelector';
import type { Asset } from '../../services/assetsService';
import PremiumRoute from '../../components/PremiumRoute';
import { usePortfolio } from '../../contexts/PortfolioContext';

const DEFAULT_BAND_PCT = DEFAULT_TOLERANCE_BAND * 100;

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#EF4444', '#D97706', '#8B5CF6', '#EC4899'];
const KNOWN_COLORS: Record<string, string> = {
  BTC: '#F59E0B', ETH: '#6366F1', SOL: '#9333EA', SUI: '#3B82F6',
  AVAX: '#EF4444', USDC: '#0EA5E9', BNB: '#EAB308', ADA: '#4338CA',
};
function tickerColor(ticker: string, index: number) {
  return KNOWN_COLORS[ticker] ?? CHART_COLORS[index % CHART_COLORS.length];
}

/* ── Motion & Styles ─────────────────────────────────────────── */
const ease = [0.23, 1, 0.32, 1] as const;

const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } }
};

const glassCard = "bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_-8px_rgba(79,70,229,0.08)] rounded-[24px]";
const textMain = "text-zinc-900";
const textMuted = "text-gray-500";

interface TargetItem {
  id:           string;
  ticker:       string;
  name:         string;
  logo?:        string | null;
  coingecko_id?: string | null;
  targetPct:    number;
}

export default function AllocationPage() {
  const { activePortfolioId } = usePortfolio();

  const [draft,     setDraft]     = useState<TargetItem[]>([]);
  const [saved,     setSaved]     = useState<TargetItem[]>([]);
  const [band,      setBand]      = useState(DEFAULT_BAND_PCT);
  const [savedBand, setSavedBand] = useState(DEFAULT_BAND_PCT);
  const [dirty,     setDirty]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!activePortfolioId) return;

    getAllocation(activePortfolioId).then(({ portfolio, assets }) => {
      if (!assets.length) return;

      const rows: TargetItem[] = assets.map((a: any) => ({
        id:           a.ticker,
        ticker:       a.ticker,
        name:         a.name || a.ticker,
        logo:         a.logo || null,
        coingecko_id: a.coingecko_id || null,
        targetPct:    Number(a.target_pct ?? 0),
      }));

      const bandPct = (portfolio?.tolerance_band ?? DEFAULT_TOLERANCE_BAND) * 100;
      setDraft(rows);
      setSaved(rows);
      setBand(bandPct);
      setSavedBand(bandPct);
    }).catch(() => {
    });
  }, [activePortfolioId]);

  const totalPct  = draft.reduce((s, t) => s + (t.targetPct || 0), 0);
  const valid100  = Math.abs(totalPct - 100) < 0.01;
  const allFilled = draft.every((t) => t.ticker && t.targetPct > 0);
  const canSave   = dirty && draft.length > 0 && valid100 && allFilled;
  const usedTickers = draft.map((t) => t.ticker).filter(Boolean);

  function addRow() {
    setDraft((prev) => [...prev, { id: Date.now().toString(), ticker: '', name: '', targetPct: 0 }]);
    setDirty(true);
  }

  function selectAsset(rowId: string, asset: Asset) {
    setDraft((prev) => prev.map((r) =>
      r.id === rowId ? { ...r, ticker: asset.ticker, name: asset.name, logo: asset.logo, coingecko_id: asset.coingecko_id } : r,
    ));
    setDirty(true);
  }

  function updatePct(rowId: string, pct: number) {
    setDraft((prev) => prev.map((r) => r.id === rowId ? { ...r, targetPct: pct } : r));
    setDirty(true);
  }

  function deleteRow(rowId: string) {
    setDraft((prev) => prev.filter((r) => r.id !== rowId));
    setDirty(true);
  }

  async function handleSave() {
    if (!canSave || !activePortfolioId) return;
    setSaving(true);
    setError(null);
    try {
      const assets = draft.map((row) => ({
        ticker:       row.ticker,
        target_pct:   row.targetPct,
        coingecko_id: row.coingecko_id || null,
        logo:         row.logo || null,
      }));

      await saveAllocation(activePortfolioId, { toleranceBand: band / 100, assets });

      setSaved([...draft]);
      setSavedBand(band);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const totalBarState = valid100 && allFilled ? 'green' : Math.abs(totalPct - 100) < 15 ? 'amber' : 'red';

  return (
    <PremiumRoute>
      <AppLayout title="Alocação Alvo" subtitle="Otimização 60-30-10">
        <div className="max-w-[1100px] mx-auto w-full pb-[80px] text-zinc-900 bg-[#F8F9FA] rounded-[32px] p-6">
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard} flex items-center gap-3 p-4 bg-red-50/80 border-red-100 mb-6 shadow-sm`}>
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0" strokeWidth={2}/>
                <span className="text-[14px] text-red-700 font-medium tracking-tight">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* Left Column */}
            <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-6">

              {/* Tolerance Band Box */}
              <motion.div variants={itemVars} className={`${glassCard} p-6 bg-white overflow-hidden`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <h2 className={`text-[16px] font-sans font-bold ${textMain} tracking-tight`}>Banda de Tolerância Global</h2>
                    <p className={`text-[13px] font-medium ${textMuted} tracking-tight mt-1.5`}>Margem flexível aplicada sobre o peso ideal de cada holding ativo na carteira.</p>
                  </div>
                  <div className="flex bg-gray-50/80 border border-gray-100 p-1 rounded-[14px] shadow-inner shrink-0">
                    {[10, 15, 20].map((v) => {
                      const isActive = band === v;
                      return (
                        <button
                          key={v} type="button"
                          onClick={() => { setBand(v); setDirty(true); }}
                          className={`relative px-6 py-2.5 rounded-[12px] text-[14px] font-bold cursor-pointer transition-all duration-300 font-mono ${
                            isActive
                              ? 'text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.4)]'
                              : 'text-gray-400 hover:text-gray-600 bg-transparent border-none'
                          }`}
                        >
                          {isActive && (
                            <motion.div layoutId="activeBandIndicator" className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[12px]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                          )}
                          <span className="relative z-10">±{v}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Editor List */}
              <motion.div variants={itemVars} className={`${glassCard} bg-white overflow-hidden`}>
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
                  <span className={`text-[16px] font-sans font-bold ${textMain} tracking-tight`}>Composição do Portfólio</span>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${draft.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'} uppercase tracking-widest`}>
                    {draft.length} ativo{draft.length !== 1 ? 's' : ''} alocado{draft.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-6">
                  {draft.length === 0 && (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-100 rounded-[24px] bg-slate-50/50">
                        <div className="w-16 h-16 rounded-[16px] bg-white shadow-sm border border-gray-200 flex items-center justify-center text-indigo-400">
                          <PieChart size={28} strokeWidth={2}/>
                        </div>
                        <div className="text-center">
                          <h3 className={`text-[16px] font-bold ${textMain} tracking-tight mb-1`}>Nenhum ativo na carteira</h3>
                          <p className={`text-[14px] ${textMuted} tracking-tight`}>Construa seu portfólio dividindo os pesos percentuais ideais.</p>
                        </div>
                        <button
                          type="button" onClick={addRow}
                          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-none rounded-[12px] text-[14px] font-bold cursor-pointer transition-all duration-300 shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
                        >
                          <Plus size={16} strokeWidth={2.5}/>
                          Adicionar primeiro ativo
                        </button>
                     </motion.div>
                  )}

                  {draft.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <AnimatePresence initial={false}>
                        {draft.map((row) => {
                          const othersUsed = usedTickers.filter((t) => t !== row.ticker);
                          return (
                            <motion.div
                              key={row.id}
                              initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.98 }} transition={{ duration: 0.25, ease }}
                              className="flex items-center gap-3 overflow-hidden py-1"
                            >
                              <div className="flex-1 min-w-0 bg-gray-50/50 border border-gray-200 rounded-[14px] focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                <AssetSelector
                                  placeholder={row.ticker ? `${row.name} (${row.ticker})` : 'Buscar ativo por nome ou ticker...'}
                                  disabledTickers={othersUsed}
                                  onSelectAsset={(asset) => selectAsset(row.id, asset)}
                                />
                              </div>

                              <div className="flex items-center w-[110px] bg-gray-50/50 border border-gray-200 rounded-[14px] overflow-hidden shrink-0 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                <input
                                  type="number" min={0} max={100}
                                  value={row.targetPct || ''}
                                  onChange={(e) => updatePct(row.id, parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full py-3 pl-4 pr-1 outline-none text-[15px] font-bold text-indigo-600 bg-transparent font-mono text-right"
                                />
                                <span className="pr-4 text-[14px] text-gray-400 font-bold">%</span>
                              </div>

                              <button
                                type="button" onClick={() => deleteRow(row.id)}
                                className="w-[46px] h-[46px] flex items-center justify-center border border-gray-200 rounded-[14px] bg-white cursor-pointer text-gray-400 transition-all duration-200 shrink-0 hover:bg-red-50 hover:border-red-200 hover:text-red-500 shadow-sm"
                              >
                                <Trash2 size={18} strokeWidth={2}/>
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      <button type="button" onClick={addRow}
                        className="w-full py-3.5 rounded-[14px] border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-[14px] font-bold text-gray-400 bg-transparent cursor-pointer transition-all duration-200 mt-2 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50"
                      >
                        <Plus size={16} strokeWidth={2.5}/>
                        Adicionar novo ativo
                      </button>

                      <div className={`mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 rounded-[16px] border transition-colors duration-300 shadow-sm ${
                        totalBarState === 'green' ? 'bg-emerald-50 border-emerald-200' : 
                        totalBarState === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          {valid100 && allFilled ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={16} className="text-emerald-600" strokeWidth={2.5}/>
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${totalBarState === 'amber' ? 'bg-amber-100' : 'bg-red-100'}`}>
                              <AlertTriangle size={16} className={totalBarState === 'amber' ? 'text-amber-600' : 'text-red-600'} strokeWidth={2.5}/>
                            </div>
                          )}
                          <span className={`text-[14px] font-bold tracking-tight ${
                             totalBarState === 'green' ? 'text-emerald-800' : 
                             totalBarState === 'amber' ? 'text-amber-800' : 'text-red-800'
                          }`}>
                            {valid100 && allFilled ? 'Montagem perfeita. Pronto para salvar' : totalPct > 100 ? `Volume excede o máximo em ${(totalPct - 100).toFixed(0)}%` : `Espaço livre de ${(100 - totalPct).toFixed(0)}%`}
                          </span>
                        </div>
                        <span className={`font-mono text-[22px] font-extrabold tracking-tight ${
                          totalBarState === 'green' ? 'text-emerald-600' : 
                          totalBarState === 'amber' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {totalPct.toFixed(0)}%
                        </span>
                      </div>

                      <button
                        onClick={handleSave}
                        disabled={!canSave || saving}
                        className={`w-full py-4 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 transition-all duration-300 mt-2 shadow-sm border-none ${
                          canSave && !saving
                            ? 'bg-zinc-900 text-white cursor-pointer hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Save size={18} strokeWidth={2} />
                        {saving ? 'Validando e Registrando...' : 'Confirmar Alocação Global'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column — Summary */}
            <motion.div variants={itemVars} initial="hidden" animate="show" className={`${glassCard} p-6 bg-white sticky top-6`}>
              <h3 className={`text-[16px] font-sans font-bold ${textMain} mb-4 tracking-tight`}>Extrato da Estratégia</h3>
              
              {saved.length === 0 ? (
                <div className="py-8 text-center bg-gray-50/50 rounded-[16px] border border-gray-100 px-6">
                  <div className="text-[14px] text-gray-400 font-medium tracking-tight leading-relaxed">
                    Especifique as regras do target à esquerda. A estratégia firmada aparecerá condensada aqui.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Status List */}
                  <div className="flex flex-col gap-3.5 mb-6">
                    {[
                      { label: 'Oscilação Máxima', value: `±${savedBand}%`, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' },
                      { label: 'Volume Alocado', value: `${saved.length} posições`, color: 'text-zinc-700 bg-gray-100 border border-gray-200' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between items-center pb-3.5 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <span className={`text-[13px] font-medium ${textMuted} tracking-tight`}>{label}</span>
                        <span className={`font-mono text-[12px] font-bold px-3 py-1.5 rounded-[8px] ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Distribuição Analítica</div>
                  
                  {/* Bars loop */}
                  <div className="flex flex-col gap-5">
                    {saved.map((t, idx) => {
                      const color = tickerColor(t.ticker, idx);
                      return (
                        <div key={t.id} className="group">
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                {t.logo ? (
                                  <img src={t.logo} alt={t.ticker} className="w-5 h-5 object-cover" />
                                ) : (
                                  <CryptoIcon ticker={t.ticker} size={18} />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[14px] font-bold ${textMain} tracking-tight leading-none`}>{t.ticker}</span>
                                {t.name && t.name !== t.ticker && (
                                  <span className="text-[11px] font-medium text-gray-400 mt-1 truncate max-w-[120px] leading-none">{t.name}</span>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-[14px] font-bold" style={{ color }}>{t.targetPct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${t.targetPct}%` }} 
                              transition={{ duration: 1, ease }}
                              className="h-full rounded-full" 
                              style={{ background: color }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </AppLayout>
    </PremiumRoute>
  );
}