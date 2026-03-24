'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash, Warning, CheckCircle, FloppyDisk, ChartPie,
} from '@phosphor-icons/react';
import AppLayout from '../../components/layout/AppLayout';
import { CryptoIcon } from '../../components/icons/CryptoIcons';
import { DEFAULT_TOLERANCE_BAND } from '../portfolio/mockData';
import { getAllocation, saveAllocation } from '../../services/allocationService';
import AssetSelector from '../../components/AssetSelector';
import type { Asset } from '../../services/assetsService';
import PremiumRoute from '../../components/PremiumRoute';
import { usePortfolio } from '../../contexts/PortfolioContext';

const DEFAULT_BAND_PCT = DEFAULT_TOLERANCE_BAND * 100;

const CHART_COLORS = ['#3B5BDB', '#059669', '#F7931A', '#627EEA', '#E84142', '#D97706', '#8B5CF6', '#EC4899'];
const KNOWN_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', SUI: '#4DA2FF',
  AVAX: '#E84142', USDC: '#2775CA', BNB: '#F3BA2F', ADA: '#0033AD',
};
function tickerColor(ticker: string, index: number) {
  return KNOWN_COLORS[ticker] ?? CHART_COLORS[index % CHART_COLORS.length];
}

interface TargetItem {
  id:        string;
  ticker:    string;
  name:      string;
  logo?:     string;
  targetPct: number;
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

      const rows: TargetItem[] = assets.map((a) => ({
        id:        a.ticker,
        ticker:    a.ticker,
        name:      a.ticker,
        targetPct: Number(a.target_pct ?? 0),
      }));

      const bandPct = (portfolio?.tolerance_band ?? DEFAULT_TOLERANCE_BAND) * 100;
      setDraft(rows);
      setSaved(rows);
      setBand(bandPct);
      setSavedBand(bandPct);
    }).catch(() => {
      // Sem portfolio ainda — começa em branco
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
      r.id === rowId ? { ...r, ticker: asset.ticker, name: asset.name, logo: asset.logo } : r,
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
        ticker:     row.ticker,
        target_pct: row.targetPct,
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
    <AppLayout title="Alocação Alvo" subtitle="Principal">
      {error && (
        <div className="px-4 py-2.5 mb-4 bg-[var(--red-subtle)] border border-[var(--red-border)] rounded-[var(--r)] text-[13px] text-[var(--red-text)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">

        {/* Left */}
        <div className="flex flex-col gap-3.5">

          {/* Tolerance band */}
          <div className="card px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[var(--t1)]">Banda de Tolerância</div>
                <div className="text-[12px] text-[var(--t3)] mt-0.5">Banda relativa: teto e piso calculados sobre o peso alvo de cada ativo</div>
              </div>
              <div className="flex gap-1.5">
                {[10, 15, 20].map((v) => (
                  <button
                    key={v} type="button"
                    onClick={() => { setBand(v); setDirty(true); }}
                    className={`px-3.5 py-[5px] rounded-[var(--r-sm)] text-[13px] font-semibold cursor-pointer transition-all duration-150 font-[var(--font-mono)] ${
                      band === v
                        ? 'bg-[var(--blue)] border border-[var(--blue)] text-white'
                        : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--t3)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Asset rows */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)] flex justify-between items-center">
              <span className="text-[13px] font-semibold text-[var(--t1)]">Ativos e Pesos Alvo</span>
              <span className="label">{draft.length} ativo{draft.length !== 1 ? 's' : ''}</span>
            </div>

            {draft.length === 0 && (
              <div className="px-5 py-12 flex flex-col items-center gap-3.5">
                <div className="w-12 h-12 rounded-[14px] bg-[var(--blue-subtle)] flex items-center justify-center">
                  <ChartPie size={22} className="text-[var(--blue)]" />
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-semibold text-[var(--t2)] mb-1">Nenhum ativo configurado</div>
                  <div className="text-[12.5px] text-[var(--t4)] leading-normal">Adicione os ativos da sua carteira e defina<br />o percentual alvo de cada um.</div>
                </div>
                <button
                  type="button" onClick={addRow}
                  className="inline-flex items-center gap-1.5 px-[18px] py-2 bg-[var(--blue)] text-white border-none rounded-[var(--r)] text-[13px] font-semibold cursor-pointer font-[inherit] transition-colors duration-150 hover:bg-[var(--blue-hover)]"
                >
                  <Plus size={13} weight="bold" />
                  Adicionar ativo
                </button>
              </div>
            )}

            {draft.length > 0 && (
              <div className="px-3.5 py-2.5 flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {draft.map((row) => {
                    const othersUsed = usedTickers.filter((t) => t !== row.ticker);
                    return (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        <div className="flex-1 min-w-0">
                          <AssetSelector
                            placeholder={row.ticker ? `${row.name} (${row.ticker})` : 'Selecionar ativo…'}
                            disabledTickers={othersUsed}
                            onSelectAsset={(asset) => selectAsset(row.id, asset)}
                          />
                        </div>

                        <div className="flex items-center border border-[var(--border)] rounded-[var(--r)] bg-[var(--surface)] overflow-hidden shrink-0 focus-within:border-[var(--blue)]">
                          <input
                            type="number" min={0} max={100}
                            value={row.targetPct || ''}
                            onChange={(e) => updatePct(row.id, parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-[52px] py-2 pl-2.5 pr-1 border-none outline-none text-[13px] font-bold text-right text-[var(--blue)] bg-transparent font-[var(--font-mono)]"
                          />
                          <span className="pr-2.5 text-[12px] text-[var(--t4)] font-semibold">%</span>
                        </div>

                        <button
                          type="button" onClick={() => deleteRow(row.id)}
                          className="w-[34px] h-9 flex items-center justify-center border border-[var(--border)] rounded-[var(--r-sm)] bg-transparent cursor-pointer text-[var(--t4)] transition-all duration-150 shrink-0 hover:bg-[var(--red-subtle)] hover:border-[var(--red-border)] hover:text-[var(--red)]"
                        >
                          <Trash size={13} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <button type="button" onClick={addRow}
                  className="w-full p-2 rounded-[var(--r)] border border-dashed border-[var(--border)] flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[var(--t4)] bg-transparent cursor-pointer transition-all duration-150 font-[inherit] mt-0.5 hover:border-[var(--blue)] hover:text-[var(--blue)] hover:bg-[var(--blue-subtle)]"
                >
                  <Plus size={13} />
                  Adicionar ativo
                </button>

                <div className={`flex items-center justify-between px-3.5 py-[9px] rounded-[var(--r)] border mt-1 ${
                  totalBarState === 'green'
                    ? 'bg-[var(--green-subtle)] border-[var(--green-border)]'
                    : totalBarState === 'amber'
                      ? 'bg-[var(--amber-subtle)] border-[var(--amber-border)]'
                      : 'bg-[var(--red-subtle)] border-[var(--red-border)]'
                }`}>
                  <div className="flex items-center gap-[7px]">
                    {valid100 && allFilled
                      ? <CheckCircle size={13} weight="fill" className="text-[var(--green)]" />
                      : <Warning size={13} className={totalBarState === 'amber' ? 'text-[var(--amber)]' : 'text-[var(--red)]'} />
                    }
                    <span className="text-[12px] font-medium text-[var(--t2)]">
                      {valid100 && allFilled ? 'Alocação completa — pronto para salvar' : totalPct > 100 ? `Excesso de ${(totalPct - 100).toFixed(0)}%` : `Faltam ${(100 - totalPct).toFixed(0)}%`}
                    </span>
                  </div>
                  <span className={`mono text-[15px] font-extrabold ${
                    totalBarState === 'green'
                      ? 'text-[var(--green-text)]'
                      : totalBarState === 'amber'
                        ? 'text-[var(--amber-text)]'
                        : 'text-[var(--red-text)]'
                  }`}>
                    {totalPct.toFixed(0)}%
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className={`w-full py-2.5 border-none rounded-[var(--r)] text-[13.5px] font-semibold flex items-center justify-center gap-[7px] transition-colors duration-150 font-[inherit] mt-1 ${
                    canSave && !saving
                      ? 'bg-[var(--blue)] text-white cursor-pointer hover:bg-[var(--blue-hover)]'
                      : 'bg-[var(--border)] text-[var(--t4)] cursor-not-allowed'
                  }`}
                >
                  <FloppyDisk size={14} weight="bold" />
                  {saving ? 'Salvando…' : 'Salvar alocação'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right — summary */}
        <div className="card px-5 py-[18px]">
          <div className="text-[13px] font-semibold text-[var(--t1)] mb-3.5">Estratégia Salva</div>
          {saved.length === 0 ? (
            <div className="text-[12.5px] text-[var(--t4)] leading-relaxed">
              Configure os ativos ao lado e clique em <strong className="text-[var(--t3)]">Salvar alocação</strong> para ver o resumo aqui.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 mb-4">
                {[
                  { label: 'Banda relativa',      value: `±${savedBand}%`,  color: 'text-[var(--blue)]' },
                  { label: 'Ativos configurados', value: `${saved.length}`, color: 'text-[var(--t1)]'   },
                  { label: 'Estratégia',          value: 'Oportunística',   color: 'text-[var(--t2)]'   },
                ].map(({ label, value, color }, i, arr) => (
                  <div key={label}>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[var(--t3)]">{label}</span>
                      <span className={`mono text-[12px] font-bold ${color}`}>{value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="h-px bg-[var(--border-2)] mt-2.5" />}
                  </div>
                ))}
              </div>
              <div className="h-px bg-[var(--border-2)] mb-3.5" />
              <div className="text-[12px] font-semibold text-[var(--t1)] mb-3">Distribuição Visual</div>
              {saved.map((t, idx) => {
                const color = tickerColor(t.ticker, idx);
                return (
                  <div key={t.id} className="mb-2.5">
                    <div className="flex items-center justify-between mb-[5px]">
                      <div className="flex items-center gap-[7px]">
                        {t.logo ? (
                          <img src={t.logo} alt={t.ticker} className="w-[18px] h-[18px] rounded-full object-cover" />
                        ) : (
                          <CryptoIcon ticker={t.ticker} size={18} />
                        )}
                        <span className="text-[12px] font-semibold text-[var(--t1)]">{t.ticker}</span>
                        {t.name !== t.ticker && (
                          <span className="text-[11px] text-[var(--t4)]">{t.name}</span>
                        )}
                      </div>
                      <span className="mono text-[12px] font-bold" style={{ color }}>{t.targetPct}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--border-2)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.targetPct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </AppLayout>
    </PremiumRoute>
  );
}