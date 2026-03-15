'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Lightning } from '@phosphor-icons/react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { CryptoIcon } from '@/components/icons/CryptoIcons';
import { AVAILABLE_ASSETS, formatCurrency } from '@/app/portfolio/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { getSummary } from '@/services/dashboardService';
import type { DashboardSummary, SignalSummary } from '@/services/dashboardService';

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

function getAssetName(ticker: string) {
  return AVAILABLE_ASSETS.find((a) => a.ticker === ticker)?.name ?? ticker;
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

/* ── Upgrade wall shown to free users in place of signal data ── */
function UpgradeBanner() {
  const GHOST_ROWS = [
    { ticker: 'BTC', signal: 'SELL', action: '$1,240' },
    { ticker: 'ETH', signal: 'HOLD', action: '—' },
    { ticker: 'SOL', signal: 'BUY',  action: '$430' },
  ];

  return (
    <div className="relative mb-5 rounded-2xl overflow-hidden">
      {/* Blurred ghost table */}
      <div className="pointer-events-none select-none opacity-50 blur-[5px]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Ativos Monitorados</span>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-5 py-2 bg-gray-50/60 border-b border-gray-100/80">
            {['Ativo', 'Preço', 'Posição', 'P&L', 'Total', 'Status'].map((h) => (
              <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</div>
            ))}
          </div>
          {GHOST_ROWS.map((r) => (
            <div key={r.ticker} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-5 py-3 items-center border-b border-gray-50 last:border-b-0">
              <div className="flex items-center gap-2.5">
                <CryptoIcon ticker={r.ticker} size={26} />
                <div className="text-[13px] font-bold text-gray-900">{r.ticker}</div>
              </div>
              <div className="text-[13px] font-semibold font-mono">$—</div>
              <div className="text-[13px] font-semibold font-mono">$—</div>
              <div className="text-[13px] font-semibold font-mono">—</div>
              <div className="text-[13px] font-semibold font-mono">{r.action}</div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  r.signal === 'SELL'
                    ? 'bg-red-50 text-red-600'
                    : r.signal === 'BUY'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {r.signal}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200/60 bg-gradient-to-br from-gray-900/90 via-indigo-950/85 to-gray-900/90 backdrop-blur-sm">
        {/* Indigo glow */}
        <div className="absolute inset-0 rounded-2xl opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.4)_0%,_transparent_70%)]" />

        {/* Glassmorphism inner card */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-8 py-6 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-md">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-400/30">
            <Lock size={20} weight="fill" className="text-indigo-300" />
          </div>
          <div className="text-center">
            <div className="text-[15px] font-bold text-white mb-1">
              Indicações de Rebalanceamento
            </div>
            <div className="text-[13px] text-indigo-200/80 leading-relaxed max-w-[340px]">
              Sinais de Compra e Venda baseados em bandas de tolerância relativas.
              Disponível no plano Premium.
            </div>
          </div>
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[13px] font-semibold rounded-lg shadow-[0_4px_14px_rgba(99,102,241,0.4)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] no-underline"
          >
            <Lightning size={13} weight="fill" />
            Assinar Premium
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, loading: authLoading, isPremium, planStatus, planLoading } = useAuth();
  const hasPlan = planStatus === 'active';
  const router = useRouter();
  const [data,    setData]    = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fullName: string = (user?.user_metadata?.full_name as string | undefined)
    ?? (user?.user_metadata?.name as string | undefined)
    ?? user?.email ?? 'usuário';
  const firstName = fullName.split(' ')[0];
  const greeting  = useGreeting(firstName);

  // Guard 1: não autenticado → /login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Guard 2: autenticado mas sem plano algum → /planos
  useEffect(() => {
    if (!authLoading && !planLoading && user && !hasPlan) {
      router.replace('/planos');
    }
  }, [authLoading, planLoading, user, hasPlan, router]);

  // Fetch dashboard data only after auth + plan are resolved and user has a plan
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

  // Evita flash de conteúdo enquanto auth/plan resolve ou redirecionamento ocorre
  if (authLoading || planLoading || !user || !hasPlan) {
    return (
      <AppLayout title="Visão Geral" subtitle="Principal">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Carregando...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Visão Geral" subtitle="Principal">

      {/* Welcome row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
            {greeting}
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            Sua carteira está sendo monitorada em tempo real
          </p>
        </div>
        {isPremium && (
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold rounded-xl no-underline transition-all duration-200 shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)]"
          >
            Ver análise
            <ArrowRight size={14} weight="bold" />
          </Link>
        )}
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Valor da Carteira */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-indigo-500" />
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Valor da Carteira</div>
          <div className="font-mono text-2xl font-bold text-indigo-600 tracking-tight leading-none">
            {loading ? '—' : formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-gray-400 mt-2">{data?.assetCount ?? 0} ativos</div>
        </div>

        {/* Sinais: premium vê dados reais, free vê bloqueado */}
        {isPremium ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-red-400" />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Sinais de Venda</div>
              <div className={`font-mono text-2xl font-bold tracking-tight leading-none ${sellCount > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                {loading ? '—' : String(sellCount)}
              </div>
              <div className="text-xs text-gray-400 mt-2">Take Profit</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-emerald-400" />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Sinais de Compra</div>
              <div className={`font-mono text-2xl font-bold tracking-tight leading-none ${buyCount > 0 ? 'text-emerald-500' : 'text-gray-300'}`}>
                {loading ? '—' : String(buyCount)}
              </div>
              <div className="text-xs text-gray-400 mt-2">Buy the Dip</div>
            </div>
          </>
        ) : (
          <>
            {[{ label: 'Sinais de Venda', sub: 'Take Profit', accent: 'bg-red-400' }, { label: 'Sinais de Compra', sub: 'Buy the Dip', accent: 'bg-emerald-400' }].map(({ label, sub, accent }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent}`} />
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</div>
                <div className="font-mono text-2xl font-bold text-gray-200 tracking-tight leading-none blur-md select-none">3</div>
                <div className="text-xs text-gray-400 mt-2">{sub}</div>
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-white/40 backdrop-blur-[1px] rounded-2xl">
                  <Lock size={12} weight="fill" className="text-gray-400" />
                  <span className="text-[11px] font-semibold text-gray-400">Premium</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Stats row 2 — P&L */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">P&L Total</div>
          <div className="font-mono text-2xl font-bold tracking-tight leading-none">
            <PnlValue value={totalPnl} loading={loading} />
          </div>
          <div className="text-xs text-gray-400 mt-2">Realizado + Não realizado</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Realizado</div>
          <div className="font-mono text-2xl font-bold tracking-tight leading-none">
            <PnlValue value={totalRealized} loading={loading} />
          </div>
          <div className="text-xs text-gray-400 mt-2">Trades fechados</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Não Realizado</div>
          <div className="font-mono text-2xl font-bold tracking-tight leading-none">
            <PnlValue value={totalUnrealized} loading={loading} />
          </div>
          <div className="text-xs text-gray-400 mt-2">Posições abertas</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Tabela: premium vê sinais, free vê P&L básico + upgrade banner */}
      {isPremium ? (
        <PremiumAssetsTable signals={signals} loading={loading} />
      ) : (
        <>
          <FreeAssetsTable signals={signals} loading={loading} />
          <UpgradeBanner />
        </>
      )}
    </AppLayout>
  );
}

/* ── Premium table ───────────────────────────────────────────── */
function PremiumAssetsTable({ signals, loading }: { signals: SignalSummary[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
      <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-900">Ativos Monitorados</span>
        <Link href="/analysis" className="text-xs text-indigo-500 hover:text-indigo-600 no-underline font-medium transition-colors">Ver análise completa</Link>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-5 py-2.5 bg-gray-50/60 border-b border-gray-100/80">
        {['Ativo', 'Preço', 'Posição', 'P&L Não Real.', 'P&L Total', 'Status'].map((h) => (
          <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[13px] text-gray-400">Carregando…</span>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && signals.length === 0 && (
        <div className="py-8 text-center text-[13px] text-gray-400">
          Nenhum ativo cadastrado.{' '}
          <Link href="/allocation" className="text-indigo-500 hover:text-indigo-600 no-underline transition-colors">Configurar alocação</Link>
        </div>
      )}

      {/* Rows */}
      {signals.map((s: SignalSummary, i: number) => {
        const positionValue   = s.quantity * s.priceUsd;
        const unrealizedColor = s.unrealizedPnl > 0 ? 'text-emerald-500' : s.unrealizedPnl < 0 ? 'text-red-500' : 'text-gray-400';
        const totalPnlColor   = s.totalPnl > 0 ? 'text-emerald-500' : s.totalPnl < 0 ? 'text-red-500' : 'text-gray-400';

        const signalBadge =
          s.signal === 'SELL'
            ? 'bg-red-50 text-red-600 ring-1 ring-red-200/60'
            : s.signal === 'BUY'
              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60'
              : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/60';

        return (
          <div
            key={s.ticker}
            className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-5 py-3 items-center hover:bg-gray-50/50 transition-colors ${
              i < signals.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CryptoIcon ticker={s.ticker} size={28} />
              <div>
                <div className="text-[13px] font-bold text-gray-900">{s.ticker}</div>
                <div className="text-[11px] text-gray-400">{getAssetName(s.ticker)}</div>
              </div>
            </div>
            <div className="font-mono text-[13px] font-semibold text-gray-900">{formatCurrency(s.priceUsd)}</div>
            <div>
              <div className="font-mono text-[13px] font-semibold text-gray-900">{formatCurrency(positionValue)}</div>
              {s.quantity > 0 && <div className="text-[11px] text-gray-400 mt-0.5">{s.quantity.toFixed(4)} un</div>}
            </div>
            <div>
              <div className={`font-mono text-[13px] font-semibold ${unrealizedColor}`}>{s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}</div>
              {s.avgCost > 0 && <div className="text-[11px] text-gray-400 mt-0.5">PM {formatCurrency(s.avgCost)}</div>}
            </div>
            <div className={`font-mono text-[13px] font-semibold ${totalPnlColor}`}>{s.totalPnl >= 0 ? '+' : ''}{formatCurrency(s.totalPnl)}</div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${signalBadge}`}>
                {s.signal === 'SELL' ? 'Vender' : s.signal === 'BUY' ? 'Comprar' : 'Manter'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Free table ──────────────────────────────────────────────── */
function FreeAssetsTable({ signals, loading }: { signals: SignalSummary[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
      <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-900">Ativos Monitorados</span>
        <Link href="/operations" className="text-xs text-indigo-500 hover:text-indigo-600 no-underline font-medium transition-colors">Registrar operação</Link>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-2.5 bg-gray-50/60 border-b border-gray-100/80">
        {['Ativo', 'Preço', 'Posição', 'P&L Não Real.', 'P&L Total'].map((h) => (
          <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[13px] text-gray-400">Carregando…</span>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && signals.length === 0 && (
        <div className="py-8 text-center text-[13px] text-gray-400">
          Nenhum ativo.{' '}
          <Link href="/operations" className="text-indigo-500 hover:text-indigo-600 no-underline transition-colors">Registrar primeira operação</Link>
        </div>
      )}

      {/* Rows */}
      {signals.map((s: SignalSummary, i: number) => {
        const positionValue   = s.quantity * s.priceUsd;
        const unrealizedColor = s.unrealizedPnl > 0 ? 'text-emerald-500' : s.unrealizedPnl < 0 ? 'text-red-500' : 'text-gray-400';
        const totalPnlColor   = s.totalPnl > 0 ? 'text-emerald-500' : s.totalPnl < 0 ? 'text-red-500' : 'text-gray-400';
        return (
          <div
            key={s.ticker}
            className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-3 items-center hover:bg-gray-50/50 transition-colors ${
              i < signals.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CryptoIcon ticker={s.ticker} size={28} />
              <div>
                <div className="text-[13px] font-bold text-gray-900">{s.ticker}</div>
                <div className="text-[11px] text-gray-400">{getAssetName(s.ticker)}</div>
              </div>
            </div>
            <div className="font-mono text-[13px] font-semibold text-gray-900">{formatCurrency(s.priceUsd)}</div>
            <div>
              <div className="font-mono text-[13px] font-semibold text-gray-900">{formatCurrency(positionValue)}</div>
              {s.quantity > 0 && <div className="text-[11px] text-gray-400 mt-0.5">{s.quantity.toFixed(4)} un</div>}
            </div>
            <div>
              <div className={`font-mono text-[13px] font-semibold ${unrealizedColor}`}>{s.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(s.unrealizedPnl)}</div>
              {s.avgCost > 0 && <div className="text-[11px] text-gray-400 mt-0.5">PM {formatCurrency(s.avgCost)}</div>}
            </div>
            <div className={`font-mono text-[13px] font-semibold ${totalPnlColor}`}>{s.totalPnl >= 0 ? '+' : ''}{formatCurrency(s.totalPnl)}</div>
          </div>
        );
      })}
    </div>
  );
}
