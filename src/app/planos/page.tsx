'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Activity,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Crown,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { activatePlan } from '@/services/plansService';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/* ─── Data ──────────────────────────────────────────────────── */
const FREE_FEATURES = [
  '1 carteira',
  'Até 4 ativos',
  'Análise de rebalanceamento',
  'Histórico de 30 dias',
  'Alertas manuais',
];

const PREMIUM_FEATURES = [
  'Carteiras ilimitadas',
  'Ativos ilimitados',
  'Análise em tempo real',
  'Histórico completo',
  'Alertas automáticos',
  'Acesso à API',
  'Suporte prioritário',
];

const COMPARISON = [
  { feature: 'Carteiras', free: '1', premium: 'Ilimitadas' },
  { feature: 'Ativos por carteira', free: 'Até 4', premium: 'Ilimitados' },
  { feature: 'Frequência de análise', free: 'Manual', premium: 'Tempo real' },
  { feature: 'Histórico', free: '30 dias', premium: 'Completo' },
  { feature: 'Alertas', free: 'Manual', premium: 'Automáticos' },
  { feature: 'API', free: '—', premium: 'Acesso total' },
  { feature: 'Suporte', free: 'Comunidade', premium: 'Prioritário' },
];

const FAQS = [
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, sem compromisso. Você pode cancelar o Premium quando quiser e continuará com acesso até o fim do período pago.',
  },
  {
    q: 'O plano gratuito tem limitações de funcionalidade?',
    a: 'O plano gratuito permite 1 carteira com até 4 ativos e análise manual. É ideal para começar a entender o rebalanceamento.',
  },
  {
    q: 'Como funciona a cobrança?',
    a: 'A cobrança é mensal via cartão de crédito ou Pix. Você recebe um recibo por e-mail a cada pagamento.',
  },
  {
    q: 'Vocês têm acesso aos meus fundos?',
    a: 'Não. A integração com exchanges é apenas de leitura (read-only). Nunca temos acesso a saques ou movimentações.',
  },
];

/* ─── Animation helper ──────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── FAQ Accordion ─────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-[15px] font-semibold text-[#121212] group-hover:text-indigo-600 transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[14px] text-gray-500 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function PlanosPage() {
  const router = useRouter();
  const { refreshPlanStatus, planStatus, isPremium, planLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const hasActivePlan = planStatus === 'active';
  const hasFreePlan = hasActivePlan && !isPremium;
  const hasPremiumPlan = hasActivePlan && isPremium;

  async function handleFreePlan() {
    if (hasFreePlan) { router.push('/dashboard'); return; }
    try {
      setLoading(true);
      await activatePlan();
      await refreshPlanStatus();
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao ativar plano gratuito:', err);
      setLoading(false);
    }
  }

  async function handleActivate() {
    router.push('/checkout');
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-32 lg:pt-40 pb-8 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-100/50 via-violet-50/20 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[12px] font-semibold text-indigo-700">Planos simples, sem surpresas</span>
            </div>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#121212] tracking-tight leading-tight mb-4">
              Comece grátis.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Escale quando precisar.
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-[16px] sm:text-[17px] text-gray-500 max-w-lg mx-auto leading-relaxed">
              Estratégia institucional de rebalanceamento acessível a todos. Sem compromisso, cancele quando quiser.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING CARDS ─────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* FREE PLAN */}
            <FadeUp>
              <div className={`relative h-full bg-white rounded-3xl border ${hasFreePlan ? 'border-emerald-200 ring-2 ring-emerald-100' : 'border-gray-200/80'} shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 flex flex-col`}>
                {hasFreePlan && (
                  <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold tracking-wide">
                    PLANO ATUAL
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#121212]">Gratuito</h3>
                    <p className="text-[12px] text-gray-400">Para começar a explorar</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[44px] font-extrabold text-[#121212] tracking-tighter">R$0</span>
                  <span className="text-[14px] text-gray-400 font-medium">/mês</span>
                </div>

                <div className="flex flex-col gap-3.5 mb-8 flex-1">
                  {FREE_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-gray-500" strokeWidth={3} />
                      </div>
                      <span className="text-[14px] text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFreePlan}
                  disabled={loading || planLoading}
                  className={`w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasFreePlan
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-[#121212] border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {loading ? 'Ativando...' : hasFreePlan ? 'Ir para Dashboard' : 'Continuar grátis'}
                </button>
              </div>
            </FadeUp>

            {/* PREMIUM PLAN */}
            <FadeUp delay={0.1}>
              <div className={`relative h-full rounded-3xl overflow-hidden flex flex-col ${hasPremiumPlan ? 'ring-2 ring-emerald-300' : ''}`}>
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#121212] to-[#1a1a2e]" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative p-8 flex flex-col flex-1">
                  {hasPremiumPlan && (
                    <div className="absolute -top-0 right-8 px-3 py-1 rounded-b-lg bg-emerald-500 text-white text-[11px] font-bold tracking-wide">
                      PLANO ATUAL
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[16px] font-bold text-white">Premium</h3>
                        {!hasPremiumPlan && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-[10px] font-bold text-indigo-300 tracking-wide">
                            RECOMENDADO
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-white/40">Acesso completo</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[44px] font-extrabold text-white tracking-tighter">R$47</span>
                    <span className="text-[14px] text-white/40 font-medium">/mês</span>
                  </div>

                  <div className="flex flex-col gap-3.5 mb-8 flex-1">
                    {PREMIUM_FEATURES.map((f) => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-indigo-400" strokeWidth={3} />
                        </div>
                        <span className="text-[14px] text-white/80">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={hasPremiumPlan ? () => router.push('/dashboard') : handleActivate}
                    className={`w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all cursor-pointer ${
                      hasPremiumPlan
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px active:translate-y-0'
                    }`}
                  >
                    {hasPremiumPlan ? 'Ir para Dashboard' : 'Assinar Premium'}
                  </button>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight text-center mb-12">
              Compare os planos
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-3 px-6 py-4 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Recurso</span>
                <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-center">Gratuito</span>
                <span className="text-[12px] font-semibold text-indigo-500 uppercase tracking-wider text-center">Premium</span>
              </div>
              {/* Rows */}
              {COMPARISON.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 px-6 py-4 ${i < COMPARISON.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <span className="text-[14px] font-medium text-[#121212]">{row.feature}</span>
                  <span className="text-[14px] text-gray-400 text-center">{row.free}</span>
                  <span className="text-[14px] font-medium text-[#121212] text-center">{row.premium}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white/60">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 mb-4">
                <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[12px] font-semibold text-gray-600">FAQ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
                Perguntas frequentes
              </h2>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-6 sm:px-8">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="relative rounded-3xl bg-gradient-to-br from-[#121212] to-[#1a1a2e] p-10 sm:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                  Pronto para automatizar sua estratégia?
                </h2>
                <p className="text-[15px] text-white/40 max-w-md mx-auto mb-8">
                  Comece com o plano gratuito e faça upgrade quando quiser. Sem compromisso.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px transition-all"
                  >
                    Começar agora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </main>
  );
}
