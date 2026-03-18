'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Briefcase, Plus } from '@phosphor-icons/react';
import { usePortfolio } from '@/contexts/PortfolioContext';

interface CreatePortfolioModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePortfolioModal({ open, onClose }: CreatePortfolioModalProps) {
  const { create } = usePortfolio();
  const [name, setName] = useState('');
  const [band, setBand] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or Outside Click
  useEffect(() => {
    if (!open) {
      setName('');
      setBand('5');
      setError(null);
      return;
    }

    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };

    document.addEventListener('keydown', onEsc);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await create({
        name: name.trim(),
        tolerance_band: parseFloat(band) / 100, // backend expects 0.05
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar carteira');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-[400px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Briefcase size={20} weight="duotone" className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Nova Carteira</h2>
              <p className="text-[13px] text-gray-500 font-medium">Crie um novo portfólio de ativos.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-[12px] text-[13px] font-medium leading-snug">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-gray-700">Nome da Carteira</label>
            <input 
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aposentadoria, Reserva..."
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-gray-700">Banda de Tolerância (%)</label>
            <div className="relative">
              <input 
                type="number"
                required
                min="1"
                max="50"
                step="0.5"
                value={band}
                onChange={(e) => setBand(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-gray-400 pointer-events-none">%</span>
            </div>
            <p className="text-[12px] text-gray-400 leading-tight mt-1">
              Desvio máximo permitido antes do sistema acionar alerta de rebalanceamento. Padrão: 5%.
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={16} weight="bold" /> Criar Carteira
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
