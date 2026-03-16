'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, X, TrendUp, TrendDown, CalendarBlank, CurrencyDollar, Hash, Trash, PencilSimple,
} from '@phosphor-icons/react';
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

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card px-[18px] py-4">
      <div className="label mb-2">{label}</div>
      <div className="mono text-[22px] font-bold tracking-[-0.02em]" style={{ color }}>{value}</div>
    </div>
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
    initial ? { ticker: initial.ticker, name: '', logo: '' } : null
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
          setError('Nenhuma carteira selecionada');
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
          logo:         selectedAsset?.logo ?? '',
        });
        onSave(created);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-[9px] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r)] text-[13.5px] text-[var(--t1)] outline-none font-[inherit]';
  const labelCls = 'text-[11px] font-semibold text-[var(--t4)] tracking-[0.06em] uppercase mb-1.5 flex items-center gap-[5px]';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-xl)] w-full max-w-[480px] shadow-[0_24px_60px_rgba(14,17,23,0.14)]"
      >
        <div className="px-5 pt-[18px] pb-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-[var(--t1)]">{initial ? 'Editar Operação' : 'Nova Operação'}</div>
            <div className="text-xs text-[var(--t4)] mt-px">{initial ? 'Altere os dados da operação' : 'Registre uma compra ou venda'}</div>
          </div>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[var(--r)] bg-transparent border-none flex items-center justify-center cursor-pointer text-[var(--t3)] transition-colors duration-150 hover:bg-[var(--bg)]">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="px-3 py-2 mb-3.5 bg-[var(--red-subtle)] border border-[var(--red-border)] rounded-[var(--r)] text-xs text-[var(--red-text)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div>
              <div className={labelCls}>Ativo</div>
              {initial ? (
                <div className="flex items-center gap-2 px-3 py-[9px] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r)] opacity-70">
                  <CryptoIcon ticker={initial.ticker} size={20} />
                  <span className="text-[13.5px] font-semibold text-[var(--t1)]">{initial.ticker}</span>
                </div>
              ) : (
                <AssetSelector
                  placeholder="Selecionar ativo…"
                  onSelectAsset={(asset: Asset) => setSelectedAsset(asset)}
                />
              )}
            </div>
            <div>
              <div className={labelCls}>Tipo</div>
              <div className="grid grid-cols-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r)] p-[3px] gap-[3px]">
                {(['BUY', 'SELL'] as OpType[]).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`py-[7px] rounded-[6px] text-xs font-bold cursor-pointer flex items-center justify-center gap-[5px] transition-all duration-150 border ${
                      type === t
                        ? t === 'BUY'
                          ? 'bg-[var(--green-subtle)] text-[var(--green-text)] border-[var(--green-border)]'
                          : 'bg-[var(--red-subtle)] text-[var(--red-text)] border-[var(--red-border)]'
                        : 'bg-transparent text-[var(--t3)] border-transparent'
                    }`}>
                    {t === 'BUY' ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                    {t === 'BUY' ? 'Compra' : 'Venda'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className={labelCls}><CalendarBlank size={11} />Data</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div>
              <div className={labelCls}><CurrencyDollar size={11} />Preço unitário</div>
              <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
            </div>
            <div>
              <div className={labelCls}><Hash size={11} />Quantidade</div>
              <input type="number" placeholder="0.00000" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="px-3.5 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r)] flex justify-between items-center mb-5">
            <span className="text-xs text-[var(--t3)] font-medium">Total estimado</span>
            <span className={`mono text-base font-bold ${total > 0 ? 'text-[var(--t1)]' : 'text-[var(--t4)]'}`}>
              {total > 0 ? formatCurrency(total) : '—'}
            </span>
          </div>

          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 bg-transparent border border-[var(--border)] rounded-[var(--r)] text-[13.5px] font-semibold text-[var(--t2)] cursor-pointer transition-colors duration-150 hover:bg-[var(--bg)]">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!valid || saving}
              className={`flex-[2] py-2.5 border-none rounded-[var(--r)] text-[13.5px] font-semibold transition-colors duration-150 flex items-center justify-center gap-[7px] ${
                valid && !saving
                  ? type === 'BUY'
                    ? 'bg-[var(--green)] text-white cursor-pointer hover:opacity-90'
                    : 'bg-[var(--red)] text-white cursor-pointer hover:opacity-90'
                  : 'bg-[var(--border)] text-[var(--t4)] cursor-not-allowed'
              }`}
            >
              {type === 'BUY' ? <TrendUp size={14} weight="bold" /> : <TrendDown size={14} weight="bold" />}
              {saving ? 'Salvando…' : initial ? 'Salvar alterações' : type === 'BUY' ? 'Registrar Compra' : 'Registrar Venda'}
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
      setError(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  function formatDate(iso: string) {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  const COL = '1fr 80px 80px 1fr 1fr 1fr 88px';

  return (
    <AppLayout title="Operações" subtitle="Principal">
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Total de Operações" value={String(operations.length)}    color="var(--blue)"  />
        <StatCard label="Volume Total"        value={formatCurrency(totalVolume)} color="var(--t1)"    />
        <StatCard label="Compras"             value={String(totalBuys)}           color="var(--green)" />
        <StatCard label="Vendas"              value={String(totalSells)}          color="var(--red)"   />
      </div>

      {error && (
        <div className="px-4 py-2.5 mb-4 bg-[var(--red-subtle)] border border-[var(--red-border)] rounded-[var(--r)] text-[13px] text-[var(--red-text)]">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="pl-5 pr-4 py-3 border-b border-[var(--border)] flex justify-between items-center">
          <span className="text-sm font-semibold text-[var(--t1)]">Registro de Operações</span>
          <div className="flex items-center gap-3">
            <span className="label">{operations.length} registros</span>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-[13px] py-1.5 bg-[var(--blue)] text-white border-none rounded-[var(--r)] text-[12.5px] font-semibold cursor-pointer transition-colors duration-150 font-[inherit] hover:bg-[var(--blue-hover)]"
            >
              <Plus size={13} weight="bold" />
              Nova Operação
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: COL }} className="px-5 py-2 bg-[var(--bg)] border-b border-[var(--border-2)]">
          {['Data', 'Ativo', 'Tipo', 'Preço', 'Quantidade', 'Total', 'Ações'].map((h) => (
            <div key={h} className="label">{h}</div>
          ))}
        </div>

        {loading && (
          <div className="px-5 py-10 text-center text-[var(--t4)] text-[13px]">Carregando…</div>
        )}
        {!loading && operations.length === 0 && (
          <div className="px-5 py-10 text-center text-[var(--t4)] text-[13.5px]">
            Nenhuma operação registrada ainda.
          </div>
        )}

        {operations.map((op, i) => (
          <div
            key={op.id}
            style={{ display: 'grid', gridTemplateColumns: COL }}
            className={`px-5 py-3 items-center transition-colors duration-100 hover:bg-[var(--bg)] ${
              i < operations.length - 1 ? 'border-b border-[var(--border-2)]' : ''
            }`}
          >
            <div className="mono text-xs text-[var(--t3)]">{formatDate(op.traded_at)}</div>
           <div className="flex items-center gap-[7px]">
  {op.logo ? (
    <img src={op.logo} alt={op.ticker} className="w-[22px] h-[22px] rounded-full object-cover" />
  ) : (
    <CryptoIcon ticker={op.ticker} size={22} />
  )}
  <span className="text-[13px] font-bold text-[var(--t1)]">{op.ticker}</span>
</div>
            <div className={`inline-flex items-center gap-1 px-[9px] py-0.5 rounded-full w-fit text-[11px] font-bold border ${
              op.type === 'SELL'
                ? 'bg-[var(--red-subtle)] border-[var(--red-border)] text-[var(--red-text)]'
                : 'bg-[var(--green-subtle)] border-[var(--green-border)] text-[var(--green-text)]'
            }`}>
              {op.type === 'SELL' ? <TrendDown size={10} weight="bold" /> : <TrendUp size={10} weight="bold" />}
              {op.type === 'SELL' ? 'Venda' : 'Compra'}
            </div>
            <div className="mono text-[13px] font-semibold text-[var(--t2)]">{formatCurrency(op.price_usd)}</div>
            <div className="mono text-[13px] font-semibold text-[var(--t2)]">
              {op.quantity < 1
                ? op.quantity.toFixed(5)
                : op.quantity.toLocaleString('en-US', { maximumFractionDigits: 4 })}
            </div>
            <div className="mono text-[13px] font-bold text-[var(--t1)]">{formatCurrency(op.total_usd)}</div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEditOp(op)}
                title="Editar"
                className="w-7 h-7 flex items-center justify-center border border-[var(--border)] rounded-[var(--r-sm)] bg-transparent cursor-pointer text-[var(--t4)] transition-colors duration-150 hover:bg-[var(--blue-subtle)] hover:border-[var(--blue)] hover:text-[var(--blue)]"
              >
                <PencilSimple size={12} />
              </button>
              <button
                onClick={() => handleDelete(op.id)}
                title="Excluir"
                className="w-7 h-7 flex items-center justify-center border border-[var(--border)] rounded-[var(--r-sm)] bg-transparent cursor-pointer text-[var(--t4)] transition-colors duration-150 hover:bg-[var(--red-subtle)] hover:border-[var(--red-border)] hover:text-[var(--red)]"
              >
                <Trash size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

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
    </AppLayout>
  );
}