'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Zap, Layers, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { formatCurrency } from '@/app/portfolio/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { getSummary } from '@/services/dashboardService';
import type { DashboardSummary, SignalSummary } from '@/services/dashboardService';

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
const textMain = "text-zinc-900";
const textMuted = "text-gray-500";

/* ── Signal badge config ─────────────────────────────────────── */
const SIGNAL_CONFIG = {
  SELL: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', label: 'Venda', Icon: TrendingDown, color: '#ef4444' },
  BUY:  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', label: 'Compra', Icon: TrendingUp, color: '#10b981' },
  HOLD: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-500', label: 'Aguardar', Icon: Minus, color: '#94a3b8' },
};

function useGreeting(firstName: string) {
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    function update() {
      const h = new Date().getHours();
      const salute = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
      setGreeting(`${salute}, ${firstName}`);
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [firstName]);
  return greeting;
}

function PnlValue({ value, loading }: { value: number; loading: boolean }) {
  if (loading) return <span className="text-gray-300">—</span>;
  const color =
    value > 0
      ? 'text-emerald-500'
      : value < 0
        ? 'text-red-500'
        : 'text-gray-400';
  return (
    <span className={color}>
      {value >= 0 ? '+' : ''}{formatCurrency(value)}
    </span>
  );
}

function UpgradeBanner() {
  const GHOST_ROWS = [
    { ticker: 'BTC', signal: 'SELL', action: '$1,240' },
    { ticker: 'ETH', signal: 'HOLD', action: '—' },
    { ticker: 'SOL', signal: 'BUY',  action: '$430' },
  ];

  return (
    <motion.div variants={itemVars} className="relative mb-6 rounded-[24px] overflow-hidden">
      <div className="pointer-events-none select-none opacity-40 blur-[6px]">
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <span className="text-[16px] font-sans font-bold text-gray-900 tracking-tight">Ativos Monitorados</span>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-6 py-3 bg-gray-50/60 border-b border-gray-100/80">
            {['Ativo', 'Preço', 'Posição', 'P&L', 'Total', 'Status'].map((h) => (
              <div key={h} className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{h}</div>
            ))}
          </div>
          {GHOST_ROWS.map((r) => (
            <div key={r.ticker} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center border-b border-gray-50 last:border-b-0">
              <div className="flex items-center gap-3">
                <AssetIcon ticker={r.ticker} size={32} />
                <div className="text-[14px] font-bold text-gray-900">{r.ticker}</div>
              </div>
              <div className="text-[13px] font-semibold font-mono">$—</div>
              <div className="text-[13px] font-semibold font-mono">$—</div>
              <div className="text-[13px] font-semibold font-mono">—</div>
              <div className="text-[13px] font-semibold font-mono">{r.action}</div>
              <div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold ${
                  r.signal === 'SELL' ? 'bg-red-50 text-red-600' : 
                  r.signal === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {r.signal}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-[24px] border border-indigo-200/40 bg-gradient-to-br from-indigo-950/90 via-[#0f172a]/95 to-indigo-950/90 backdrop-blur-[2px]">
        <div className="absolute inset-0 rounded-[24px] opacity-40 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.5)_0%,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-10 py-8 rounded-[20px] bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl shadow-black/50">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-400/30">
            <Lock size={24} className="text-indigo-300" strokeWidth={2}/>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-sans font-bold text-white mb-2 tracking-tight">
              Análise de Rebalanceamento
            </div>
            <div className="text-[14px] text-indigo-200/80 leading-relaxed max-w-[360px] font-medium tracking-tight">
              Sinais e alertas estratégicos baseados em algoritmos e bandas de tolerância.
              Exclusivo do plano Premium.
            </div>
          </div>
          <Link
            href="/planos"
            className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-[14px] font-bold rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 no-underline"
          >
            <Zap size={16} className="fill-white" />
            <span className="tracking-wide">Desbloquear Premium</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, isPremium, planStatus, planLoading } = useAuth();
  const hasPlan = planStatus === 'active';
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullName: string = (user?.user_metadata?.full_name as string | undefined)
    ?? (user?.user_metadata?.name as string | undefined)
    ?? user?.email ?? 'usuário';
  const firstName = fullName.split(' ')[0];
  const greeting  = useGreeting(firstName);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !planLoading && user && !hasPlan) router.replace('/planos');
  }, [authLoading, planLoading, user, hasPlan, router]);

  useEffect(() => {
    if (authLoading || planLoading || !user || !hasPlan) return;
    setLoading(true);
    getSummary()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, planLoading, user, hasPlan]);

  const signals         = data?.signals ?? [];
  const totalValue      = data?.totalValueUsd ?? 0;
  const sellCount       = data?.sellCount ?? 0;
  const buyCount        = data?.buyCount  ?? 0;
  const totalPnl        = data?.totalPnl        ?? 0;
  const totalRealized   = data?.totalRealized    ?? 0;
  const totalUnrealized = data?.totalUnrealized  ?? 0;
  const assetCount      = data?.assetCount ?? 0;

  if (authLoading || planLoading || !user || !hasPlan) {
    return (
      <AppLayout title="Visão Geral" subtitle="Principal">
        <div className="flex py-[120px] items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Activity className="text-indigo-500" size={32} strokeWidth={2}/>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Visão Geral" subtitle="Monitoramento SaaS">
      <div className="max-w-[1200px] mx-auto w-full pb-[80px] text-zinc-900 bg-[#F8F9FA] rounded-[32px] p-6">
        
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h1 className="text-[28px] font-sans font-bold text-gray-900 tracking-tight">
              {greeting}
            </h1>
            <p className="text-[14px] font-medium text-gray-500 mt-1.5 tracking-tight">
              Seu portfólio está sendo monitorado em tempo real
            </p>
          </div>
          {isPremium && (
            <Link
              href="/analysis"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[14px] font-bold tracking-tight rounded-[14px] no-underline transition-all duration-300 shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
            >
              Analisar Rebalanceamento
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(79,70,229,0.15)" }} transition={transition} className={`${glassCard} p-6 relative overflow-hidden bg-white`}>
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500" />
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Valor da Carteira</div>
            <div className="font-mono text-[32px] font-bold text-indigo-950 tracking-tight leading-none mb-3">
              {loading ? '—' : formatCurrency(totalValue)}
            </div>
            <div className="text-[13px] font-medium text-gray-500 tracking-tight">{assetCount} ativos mapeados</div>
          </motion.div>

          {isPremium ? (
            <>
              <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(239,68,68,0.15)" }} transition={transition} className={`${glassCard} p-6 relative overflow-hidden bg-white`}>
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-400" />
                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sinais de Venda</div>
                <div className={`font-mono text-[32px] font-bold tracking-tight leading-none mb-3 ${sellCount > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                  {loading ? '—' : String(sellCount)}
                </div>
                <div className="text-[13px] font-medium text-gray-500 tracking-tight">Oportunidade para Take Profit</div>
              </motion.div>

              <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(16,185,129,0.15)" }} transition={transition} className={`${glassCard} p-6 relative overflow-hidden bg-white`}>
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-400" />
                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sinais de Compra</div>
                <div className={`font-mono text-[32px] font-bold tracking-tight leading-none mb-3 ${buyCount > 0 ? 'text-emerald-500' : 'text-gray-300'}`}>
                  {loading ? '—' : String(buyCount)}
                </div>
                <div className="text-[13px] font-medium text-gray-500 tracking-tight">Oportunidade para Buy the Dip</div>
              </motion.div>
            </>
          ) : (
            <>
              {[{ label: 'Sinais de Venda', sub: 'Descubra lucros ativos', accent: 'bg-red-400' }, { label: 'Sinais de Compra', sub: 'Saiba pontos de entrada', accent: 'bg-emerald-400' }].map(({ label, sub, accent }) => (
                <motion.div key={label} variants={itemVars} className={`${glassCard} p-6 relative overflow-hidden bg-white/40`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${accent}`} />
                  <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</div>
                  <div className="font-mono text-[32px] font-bold text-gray-200 tracking-tight leading-none mb-3 blur-md select-none">3</div>
                  <div className="text-[13px] font-medium text-gray-500 tracking-tight">{sub}</div>
                  
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-white/40 backdrop-blur-[2px]">
                    <Lock size={14} className="text-gray-400" strokeWidth={2.5}/>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-gray-500">Premium</span>
                  </div>
                </motion.div>
              ))}
            </>
          )}

          <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(79,70,229,0.1)" }} transition={transition} className={`${glassCard} p-6 bg-white overflow-hidden`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">P&L Global</div>
            <div className="font-mono text-[28px] font-bold tracking-tight leading-none mb-3">
              <PnlValue value={totalPnl} loading={loading} />
            </div>
            <div className="text-[13px] font-medium text-gray-500 tracking-tight">Realizado + Não Realizado</div>
          </motion.div>

          <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(79,70,229,0.1)" }} transition={transition} className={`${glassCard} p-6 bg-white overflow-hidden`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ganhos Realizados</div>
            <div className="font-mono text-[28px] font-bold tracking-tight leading-none mb-3">
              <PnlValue value={totalRealized} loading={loading} />
            </div>
            <div className="text-[13px] font-medium text-gray-500 tracking-tight">Vendas concluídas (BD)</div>
          </motion.div>

          <motion.div variants={itemVars} whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(79,70,229,0.1)" }} transition={transition} className={`${glassCard} p-6 bg-white overflow-hidden`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">P&L Flutuante</div>
            <div className="font-mono text-[28px] font-bold tracking-tight leading-none mb-3">
              <PnlValue value={totalUnrealized} loading={loading} />
            </div>
            <div className="text-[13px] font-medium text-gray-500 tracking-tight">Marcação atual vs. PM</div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard} flex items-center gap-3 p-4 bg-red-50/80 border-red-100 mb-6 shadow-sm`}>
              <Activity size={18} className="text-red-500 flex-shrink-0" strokeWidth={2}/>
              <span className="text-[14px] text-red-700 font-medium tracking-tight">Falha de integridade: {error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={containerVars} initial="hidden" animate="show">
          {isPremium ? (
            <PremiumAssetsTable signals={signals} loading={loading} />
          ) : (
            <>
              <FreeAssetsTable signals={signals} loading={loading} />
              <UpgradeBanner />
            </>
          )}
        </motion.div>

      </div>
    </AppLayout>
  );
}

function PremiumAssetsTable({ signals, loading }: { signals: SignalSummary[]; loading: boolean }) {
  return (
    <motion.div variants={itemVars} className={`${glassCard} bg-white overflow-hidden mb-6`}>
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className={`text-[18px] font-sans font-bold ${textMain} tracking-tight`}>Holdings & Extrato de Sinais</h3>
          <p className={`text-[13px] font-medium ${textMuted} tracking-tight mt-1.5`}>Gestão ativa e monitoramento contínuo das variações</p>
        </div>
        <Link href="/analysis" className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-[12px] text-[13px] tracking-wide shadow-sm border border-indigo-100 no-underline hover:bg-indigo-100 transition-colors">
          Expandir Análise
        </Link>
      </div>

      <div className="overflow-x-auto scroller-clean">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.2fr_1.2fr] px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            <div>Ativo Local</div>
            <div>Preço Base</div>
            <div>Exposição Nominal</div>
            <div>Lucro (Aberto)</div>
            <div>Retorno Global</div>
            <div className="text-right">Sinal Direcional</div>
          </div>

          {loading && (
            <div className="py-12 flex justify-center">
              <Activity size={24} className="text-indigo-400 animate-pulse" strokeWidth={2}/>
            </div>
          )}

          {!loading && signals.length === 0 && (
            <div className="py-12 text-center text-[14px] text-gray-400 font-medium tracking-tight">
              A base de ativos está pendente.{' '}
              <Link href="/allocation" className="text-indigo-500 hover:text-indigo-600 no-underline transition-colors font-bold">Lançar target de risco</Link>
            </div>
          )}

          <div className="divide-y divide-gray-100/80">
            {signals.map((s) => {
              const positionValue   = s.quantity * s.priceUsd;
              const unrealizedColor = s.unrealizedPnl > 0 ? 'text-emerald-500' : s.unrealizedPnl < 0 ? 'text-red-500' : 'text-gray-400';
              const totalPnlColor   = s.totalPnl > 0 ? 'text-emerald-500' : s.totalPnl < 0 ? 'text-red-500' : 'text-gray-400';
              const cfg = SIGNAL_CONFIG[s.signal];
              const IconComp = cfg.Icon;

              return (
                <div key={s.ticker} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.2fr_1.2fr] px-8 py-5 items-center hover:bg-slate-50/70 transition-colors duration-200 group">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 overflow-hidden transition-colors">
                      {s.logo ? (
                        <img src={s.logo} alt={s.ticker} className="w-6 h-6 object-cover" />
                      ) : (
                        <AssetIcon ticker={s.ticker} size={24} />
                      )}
                    </div>
                    <span className={`text-[15px] font-bold ${textMain} tracking-tight`}>{s.ticker}</span>
                  </div>

                  <div className={`font-mono text-[14px] font-bold ${textMain}`}>{formatCurrency(s.priceUsd)}</div>
                  
                  <div>
                    <div className={`font-mono text-[14px] font-bold ${textMain}`}>{formatCurrency(positionValue)}</div>
                    {s.quantity > 0 && <div className="font-mono text-[12px] text-gray-400 mt-1.5 tracking-tighter">{s.quantity.toFixed(4)} unis</div>}
                  </div>
                  
                  <div>
                    <div className={`font-mono text-[14px] font-bold ${unrealizedColor}`}>{s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}</div>
                    {s.avgCost > 0 && <div className="font-mono text-[12px] text-gray-400 mt-1.5 tracking-tighter">PM: {formatCurrency(s.avgCost)}</div>}
                  </div>

                  <div className={`font-mono text-[14px] font-bold ${totalPnlColor}`}>{s.totalPnl >= 0 ? '+' : ''}{formatCurrency(s.totalPnl)}</div>
                  
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
    </motion.div>
  );
}

function FreeAssetsTable({ signals, loading }: { signals: SignalSummary[]; loading: boolean }) {
  return (
    <motion.div variants={itemVars} className={`${glassCard} bg-white overflow-hidden mb-6`}>
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className={`text-[18px] font-sans font-bold ${textMain} tracking-tight`}>Holdings & Posições</h3>
          <p className={`text-[13px] font-medium ${textMuted} tracking-tight mt-1.5`}>Acompanhamento simplificado dos balanços agregados</p>
        </div>
        <Link href="/operations" className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-[12px] text-[13px] tracking-wide shadow-sm border border-indigo-100 no-underline hover:bg-indigo-100 transition-colors">
          Nova Operação
        </Link>
      </div>

      <div className="overflow-x-auto scroller-clean">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.2fr] px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            <div>Ativo Local</div>
            <div>Preço Base</div>
            <div>Exposição Total</div>
            <div>Lucro (Aberto)</div>
            <div className="text-right">Retorno Global</div>
          </div>

          {loading && (
            <div className="py-12 flex justify-center">
              <Activity size={24} className="text-indigo-400 animate-pulse" strokeWidth={2}/>
            </div>
          )}

          {!loading && signals.length === 0 && (
            <div className="py-12 text-center text-[14px] text-gray-400 font-medium tracking-tight">
              Nenhuma posição contabilizada.{' '}
              <Link href="/operations" className="text-indigo-500 hover:text-indigo-600 no-underline transition-colors font-bold">Registrar em caixa</Link>
            </div>
          )}

          <div className="divide-y divide-gray-100/80">
            {signals.map((s) => {
              const positionValue   = s.quantity * s.priceUsd;
              const unrealizedColor = s.unrealizedPnl > 0 ? 'text-emerald-500' : s.unrealizedPnl < 0 ? 'text-red-500' : 'text-gray-400';
              const totalPnlColor   = s.totalPnl > 0 ? 'text-emerald-500' : s.totalPnl < 0 ? 'text-red-500' : 'text-gray-400';
              return (
                <div key={s.ticker} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1.2fr] px-8 py-5 items-center hover:bg-slate-50/70 transition-colors duration-200 group">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 overflow-hidden transition-colors">
                      {s.logo ? (
                        <img src={s.logo} alt={s.ticker} className="w-6 h-6 object-cover" />
                      ) : (
                        <AssetIcon ticker={s.ticker} size={24} />
                      )}
                    </div>
                    <span className={`text-[15px] font-bold ${textMain} tracking-tight`}>{s.ticker}</span>
                  </div>

                  <div className={`font-mono text-[14px] font-bold ${textMain}`}>{formatCurrency(s.priceUsd)}</div>
                  
                  <div>
                    <div className={`font-mono text-[14px] font-bold ${textMain}`}>{formatCurrency(positionValue)}</div>
                    {s.quantity > 0 && <div className="font-mono text-[12px] text-gray-400 mt-1.5 tracking-tighter">{s.quantity.toFixed(4)} unis</div>}
                  </div>
                  
                  <div>
                    <div className={`font-mono text-[14px] font-bold ${unrealizedColor}`}>{s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}</div>
                    {s.avgCost > 0 && <div className="font-mono text-[12px] text-gray-400 mt-1.5 tracking-tighter">PM: {formatCurrency(s.avgCost)}</div>}
                  </div>

                  <div className={`font-mono text-[14px] font-bold ${totalPnlColor} text-right`}>{s.totalPnl >= 0 ? '+' : ''}{formatCurrency(s.totalPnl)}</div>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}