'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, X, TrendingUp, TrendingDown, Calendar, DollarSign, Hash, Trash2, PencilLine, Activity, Layers
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { CryptoIcon } from '../../components/icons/CryptoIcons';
import { formatCurrency } from '../portfolio/mockData';
import AssetSelector from '../../components/AssetSelector';
import type { Asset } from '../../services/assetsService';
import {
  listOperations, createOperation, updateOperation, deleteOperation,
} from '../../services/operationsService';
import type { Trade } from '../../services/operationsService';
import { usePortfolio } from '../../contexts/PortfolioContext';

type OpType = 'BUY' | 'SELL';

/* ── Motion & Styles ─────────────────────────────────────────── */
const ease = [0.23, 1, 0.32, 1] as const;

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, ease } }
};

const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } }
};

const glassCard = "bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_-8px_rgba(79,70,229,0.08)] rounded-[24px]";
const inputGlass = "w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-[14px] text-[15px] font-bold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 font-mono shadow-sm";
const labelCls = "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5";

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(79,70,229,0.15)" }} className={`${glassCard} p-6 bg-white overflow-hidden relative`}>
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500/20 group-hover:bg-indigo-400 transition-colors" />
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="font-mono text-[30px] font-bold text-gray-900 tracking-tight leading-none mb-3 truncate">{value}</div>
      <div className="text-[13px] font-medium text-gray-500 tracking-tight">{sub}</div>
    </motion.div>
  );
}

function OperationModal({
  onClose, onSave, initial, portfolioId,
}: {
  onClose:     () => void;
  onSave:      (trade: Trade) => void;
  initial?:    Trade;
  portfolioId: string | null;
}) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    initial ? { ticker: initial.ticker, name: '', logo: initial.logo ?? '' } : null
  );
  const [type,     setType]     = useState<OpType>(initial?.type ?? 'BUY');
  const [date,     setDate]     = useState(initial ? initial.traded_at.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [price,    setPrice]    = useState(initial?.price_usd ? String(initial.price_usd) : '');
  const [quantity, setQuantity] = useState(initial?.quantity  ? String(initial.quantity)  : '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const total = price && quantity ? parseFloat(price) * parseFloat(quantity) : 0;
  const valid = !!(selectedAsset && price && quantity && parseFloat(price) > 0 && parseFloat(quantity) > 0);

  async function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      if (initial) {
        const updated = await updateOperation(initial.id, {
          quantity:  parseFloat(quantity),
          price_usd: parseFloat(price),
          traded_at: date,
        });
        onSave(updated);
      } else {
        if (!portfolioId) {
          setError('Nenhuma carteira ativa no contexto.');
          setSaving(false);
          return;
        }
        const created = await createOperation({
          portfolioId,
          ticker:       selectedAsset!.ticker,
          type,
          quantity:     parseFloat(quantity),
          price_usd:    parseFloat(price),
          traded_at:    date,
          coingecko_id: selectedAsset?.coingecko_id,
          logo:         selectedAsset?.logo || '',
        });
        onSave(created);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro genérico ao salvar a transação.');
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease }}
        className="bg-white rounded-[28px] w-full max-w-[500px] shadow-2xl overflow-hidden my-auto"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/40">
          <div>
            <h2 className="text-[20px] font-sans font-bold text-gray-900 tracking-tight leading-none mb-1.5">
              {initial ? 'Editar Registro' : 'Nova Transação'}
            </h2>
            <p className="text-[13px] font-medium text-gray-500 tracking-tight">
              {initial ? 'Modifique as condições históricas deste lote.' : 'Atribua as variáveis do lote adquirido ou alienado.'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm shrink-0">
            <X size={18} strokeWidth={2.5}/>
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-600 font-semibold flex items-center gap-2">
                  <Activity size={14} className="shrink-0" strokeWidth={2.5}/>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 space-y-0">
            <div>
              <div className={labelCls}>Ativo Vinculado</div>
              {initial ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-[14px] opacity-80 cursor-not-allowed shadow-sm">
                  {selectedAsset?.logo ? (
                     <img src={selectedAsset.logo} alt={initial.ticker} className="w-[22px] h-[22px] object-cover rounded-full" />
                  ) : (
                     <CryptoIcon ticker={initial.ticker} size={22} />
                  )}
                  <span className="text-[15px] font-bold text-gray-800">{initial.ticker}</span>
                </div>
              ) : (
                <div className="relative group bg-gray-50/50 border border-gray-200 rounded-[14px] focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all shadow-sm">
                  <AssetSelector
                    placeholder="Buscar ticket..."
                    onSelectAsset={(asset: Asset) => setSelectedAsset(asset)}
                    disabledTickers={[]} // operations allow duplicates
                  />
                </div>
              )}
            </div>

            <div>
              <div className={labelCls}>Natureza (Sentido)</div>
              <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-[14px] border border-gray-200 shadow-inner">
                {(['BUY', 'SELL'] as OpType[]).map((t) => {
                  const isActive = type === t;
                  return (
                    <button key={t} onClick={() => setType(t)}
                      className={`relative py-2.5 rounded-[10px] text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors duration-200 border-none ${
                        isActive
                          ? t === 'BUY'
                            ? 'text-emerald-700'
                            : 'text-red-700'
                          : 'text-gray-500 bg-transparent hover:text-gray-700'
                      }`}>
                      {isActive && (
                         <motion.div layoutId="modalSegmentBg" className={`absolute inset-0 rounded-[10px] shadow-sm bg-white ${t === 'BUY' ? 'border border-emerald-200' : 'border border-red-200'}`} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                      )}
                      {t === 'BUY' ? <TrendingUp size={14} className={`relative z-10 ${isActive ? 'text-emerald-500' : ''}`} strokeWidth={2.5} /> : <TrendingDown size={14} className={`relative z-10 ${isActive ? 'text-red-500' : ''}`} strokeWidth={2.5}/>}
                      <span className="relative z-10 tracking-tight">{t === 'BUY' ? 'Compra' : 'Venda'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className={labelCls}><Calendar size={13} strokeWidth={2.5}/> Base de Tempo / Liquidação</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputGlass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div>
              <div className={labelCls}><DollarSign size={13} strokeWidth={2.5}/> Preço Unitário (PM)</div>
              <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className={inputGlass} />
            </div>
            <div>
              <div className={labelCls}><Hash size={13} strokeWidth={2.5}/> Volume (Qtde)</div>
              <input type="number" placeholder="0.0000" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputGlass} />
            </div>
          </div>

          <div className="px-5 py-4 bg-indigo-50/50 border border-indigo-100 rounded-[16px] flex justify-between items-center mb-6 shadow-inner">
            <span className="text-[13px] text-indigo-900/60 font-bold uppercase tracking-widest">Montante Presumido</span>
            <span className={`font-mono text-[22px] font-black tracking-tight ${total > 0 ? 'text-indigo-600' : 'text-indigo-300'}`}>
              {total > 0 ? formatCurrency(total) : '$—'}
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-[1] py-3.5 bg-white border border-gray-200 rounded-[14px] text-[14px] font-bold text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-gray-800 shadow-sm">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!valid || saving}
              className={`flex-[2] py-3.5 border-none rounded-[14px] text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.1)] ${
                valid && !saving
                  ? type === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:-translate-y-px cursor-pointer'
                    : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] hover:-translate-y-px cursor-pointer'
                  : 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
              }`}
            >
              {type === 'BUY' ? <TrendingUp size={16} strokeWidth={2.5} /> : <TrendingDown size={16} strokeWidth={2.5} />}
              {saving ? 'Registrando no Ledger...' : initial ? 'Consolidar Alterações' : type === 'BUY' ? 'Liquidar Compra Frontal' : 'Liquidar Venda (Take)'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function OperationsPage() {
  const { activePortfolioId, refresh: refreshPortfolio } = usePortfolio();

  const [operations, setOperations] = useState<Trade[]>([]);
  const [showModal,  setShowModal]  = useState(false);
  const [editOp,     setEditOp]     = useState<Trade | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!activePortfolioId) return;

    setLoading(true);
    listOperations({ portfolioId: activePortfolioId })
      .then(({ trades }) => setOperations(trades))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activePortfolioId]);

  const totalBuys   = operations.filter((o) => o.type === 'BUY').length;
  const totalSells  = operations.filter((o) => o.type === 'SELL').length;
  const totalVolume = operations.reduce((s, o) => s + o.total_usd, 0);

  function handleCreated(trade: Trade) {
    setOperations((prev) => [trade, ...prev]);
    if (!activePortfolioId) refreshPortfolio();
  }

  function handleUpdated(trade: Trade) {
    setOperations((prev) => prev.map((o) => o.id === trade.id ? trade : o));
    setEditOp(null);
  }

  async function handleDelete(id: string) {
    try {
      await deleteOperation(id);
      setOperations((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro genérico ao excluir do servidor.');
    }
  }

  function formatDate(iso: string) {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  return (
    <AppLayout title="Operações Globais" subtitle="Registro Financeiro (Ledger)">
      <div className="max-w-[1200px] mx-auto w-full pb-[80px] text-zinc-900 bg-[#F8F9FA] rounded-[32px] p-4 sm:p-6">
        
        <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard label="Total Histórico" value={String(operations.length)} sub="Lances registrados na base" />
          <StatCard label="Volume Equivalente" value={formatCurrency(totalVolume)} sub="Soma nominal liquidada" />
          <StatCard label="Aportes (Buys)" value={String(totalBuys)} sub="Ordens de entrada" />
          <StatCard label="Realizações (Sells)" value={String(totalSells)} sub="Ordens de alienação" />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`${glassCard} flex items-center gap-3 p-4 bg-red-50/80 border-red-100 mb-6 shadow-sm`}>
              <Activity size={18} className="text-red-500 flex-shrink-0" strokeWidth={2.5}/>
              <span className="text-[14px] text-red-700 font-bold tracking-tight">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVars} initial="hidden" animate="show" className={`${glassCard} bg-white overflow-hidden`}>
          <div className="pl-6 sm:pl-8 pr-4 sm:pr-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
            <div>
              <h2 className={`text-[18px] font-sans font-bold text-gray-900 tracking-tight leading-none mb-1.5`}>Histórico Imutável</h2>
              <p className={`text-[13px] font-medium text-gray-500 tracking-tight`}>Fluxo de ordens ativas consolidadas.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`hidden sm:inline-block text-[11px] font-bold px-3 py-1.5 rounded-full ${operations.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'} uppercase tracking-widest shrink-0`}>
                {operations.length} ordens passadas
              </span>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-none rounded-[12px] text-[13px] font-bold cursor-pointer transition-all duration-300 font-sans shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 shrink-0"
              >
                <Plus size={16} strokeWidth={2.5} />
                Lançar Ordem
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scroller-clean">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_1.2fr_1.2fr_1.2fr_100px] px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                <div>Data</div>
                <div>Ativo Tracionado</div>
                <div>Sentido</div>
                <div>Ponto Médio (PM)</div>
                <div>Lote (Qtd)</div>
                <div>Financeiro Movido</div>
                <div className="text-right">Ações</div>
              </div>

              {loading && (
                <div className="py-16 flex justify-center">
                  <Activity size={24} className="text-indigo-400 animate-pulse" strokeWidth={2}/>
                </div>
              )}
              
              {!loading && operations.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-[16px] bg-slate-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-2">
                     <Layers size={28} strokeWidth={2}/>
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">O Ledger está varrido</h3>
                  <p className="text-[14px] font-medium text-gray-500 max-w-[300px]">Ainda não há registro de eventos financeiros para esta conta raiz.</p>
                </div>
              )}

              <div className="divide-y divide-gray-100/80">
                {operations.map((op) => (
                  <div
                    key={op.id}
                    className="grid grid-cols-[1fr_1.2fr_1fr_1.2fr_1.2fr_1.2fr_100px] px-8 py-4 items-center transition-colors duration-200 hover:bg-slate-50/70 group"
                  >
                    <div className="font-mono text-[13px] font-medium text-gray-500">{formatDate(op.traded_at)}</div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                        {op.logo ? (
                          <img src={op.logo} alt={op.ticker} className="w-5 h-5 object-cover" />
                        ) : (
                          <CryptoIcon ticker={op.ticker} size={18} />
                        )}
                      </div>
                      <span className="text-[15px] font-bold text-gray-900 tracking-tight">{op.ticker}</span>
                    </div>

                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-bold border shadow-sm ${
                        op.type === 'SELL'
                          ? 'bg-red-50 border-red-100 text-red-700'
                          : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      }`}>
                        {op.type === 'SELL' ? <TrendingDown size={14} strokeWidth={2.5}/> : <TrendingUp size={14} strokeWidth={2.5} />}
                        <span className="tracking-widest uppercase">{op.type === 'SELL' ? 'Venda' : 'Compra'}</span>
                      </div>
                    </div>

                    <div className="font-mono text-[15px] font-bold text-gray-700 tracking-tight">{formatCurrency(op.price_usd)}</div>
                    
                    <div className="font-mono text-[15px] font-bold text-gray-700 tracking-tight">
                      {op.quantity < 1
                        ? op.quantity.toFixed(5)
                        : op.quantity.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      <span className="text-[12px] text-gray-400 font-medium ml-1 tracking-tighter">uts</span>
                    </div>
                    
                    <div className="font-mono text-[15px] font-bold text-indigo-700 tracking-tight">{formatCurrency(op.total_usd)}</div>
                    
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => setEditOp(op)}
                        title="Modificar Documento"
                        className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-[10px] bg-white cursor-pointer text-gray-400 transition-all duration-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 shadow-sm"
                      >
                        <PencilLine size={16} strokeWidth={2.5}/>
                      </button>
                      <button
                        onClick={() => handleDelete(op.id)}
                        title="Apurar Objeto"
                        className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-[10px] bg-white cursor-pointer text-gray-400 transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
                      >
                        <Trash2 size={16} strokeWidth={2.5}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showModal && (
            <OperationModal
              portfolioId={activePortfolioId}
              onClose={() => setShowModal(false)}
              onSave={handleCreated}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {editOp && (
            <OperationModal
              portfolioId={activePortfolioId}
              initial={editOp}
              onClose={() => setEditOp(null)}
              onSave={handleUpdated}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}