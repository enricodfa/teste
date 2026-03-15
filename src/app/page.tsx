'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Wallet,
  Target,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/* ─── Animation Helpers ─────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Portfolio Bar Chart (Hero visual) ────────────── */
function PortfolioVisual() {
  const bars = [
    { label: 'BTC', target: 40, current: 52, color: 'from-amber-400 to-orange-500' },
    { label: 'ETH', target: 30, current: 22, color: 'from-indigo-400 to-violet-500' },
    { label: 'SOL', target: 20, current: 18, color: 'from-emerald-400 to-teal-500' },
    { label: 'USDC', target: 10, current: 8, color: 'from-sky-400 to-blue-500' },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_40px_rgba(99,102,241,0.08)] p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Rebalanceamento
            </p>
            <p className="text-lg font-bold text-[#121212] tracking-tight">Portfolio Ativo</p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </motion.div>
        </div>

        {/* Bars */}
        <div className="space-y-4">
          {bars.map((bar, i) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-semibold text-[#121212]">{bar.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-gray-400 font-mono">{bar.current}%</span>
                  <ArrowRight className="w-3 h-3 text-indigo-500" />
                  <span className="text-[12px] text-indigo-600 font-semibold font-mono">{bar.target}%</span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                {/* Current (faded) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.current}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 bg-gray-200 rounded-full"
                />
                {/* Target */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.target}%` }}
                  transition={{ duration: 1.2, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${bar.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-[12px] font-medium text-emerald-700">Rebalanceamento sugerido: 3 operações</span>
        </motion.div>
      </motion.div>

      {/* Decorative blurs */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-violet-400/15 rounded-full blur-[60px] pointer-events-none" />
    </div>
  );
}

/* ─── The Pulse: Real-time Rebalancing Visual ───────────────── */
function ThePulse() {
  const pulseAssets = [
    { name: 'BTC', drift: '+3.2%', action: 'Vender', actionColor: 'text-red-500 bg-red-50', pct: 85 },
    { name: 'ETH', drift: '-2.8%', action: 'Comprar', actionColor: 'text-emerald-600 bg-emerald-50', pct: 62 },
    { name: 'SOL', drift: '+1.1%', action: 'Manter', actionColor: 'text-amber-600 bg-amber-50', pct: 45 },
    { name: 'ADA', drift: '-1.5%', action: 'Comprar', actionColor: 'text-emerald-600 bg-emerald-50', pct: 30 },
  ];

  return (
    <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_40px_rgba(99,102,241,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-40" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-[#121212] tracking-tight">The Pulse</h3>
        </div>
        <p className="text-[13px] text-gray-400 ml-[22px]">Monitoramento em tempo real do drift de alocação</p>
      </div>

      {/* Asset rows */}
      <div className="divide-y divide-gray-50">
        {pulseAssets.map((asset, i) => (
          <motion.div
            key={asset.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex items-center justify-between px-6 sm:px-8 py-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100">
                <span className="text-[13px] font-bold text-[#121212]">{asset.name.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-semibold text-[#121212]">{asset.name}</span>
                  <span className={`text-[12px] font-mono font-medium ${asset.drift.startsWith('+') ? 'text-red-500' : 'text-emerald-600'}`}>
                    {asset.drift} drift
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${asset.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  />
                </div>
              </div>
            </div>
            <span className={`ml-4 px-3 py-1 rounded-lg text-[12px] font-semibold ${asset.actionColor}`}>
              {asset.action}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[12px] text-gray-400">Atualizado há 12s</span>
        <span className="text-[12px] font-medium text-indigo-600 flex items-center gap-1 cursor-pointer hover:underline">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-28 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-100/60 via-violet-50/30 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left: Copy */}
            <motion.div style={{ y: heroY }}>
              <FadeUp>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[12px] font-semibold text-indigo-700">Rebalanceamento Inteligente</span>
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#121212] tracking-tight leading-[1.08] mb-6">
                  Rebalanceie seu futuro.{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Automaticamente.
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="text-lg text-[#6B7280] leading-relaxed max-w-lg mb-8">
                  Enquanto o HODL torce pela sorte, o rebalanceamento <strong className="text-[#374151]">compra na baixa e vende na alta — sistematicamente</strong>. Defina sua alocação ideal e deixe a Nortfy cuidar do resto.
                </p>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Começar grátis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#como-funciona"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-[#374151] bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Como funciona
                  </Link>
                </div>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-200/60">
                  {[
                    { value: '2.4K+', label: 'Investidores' },
                    { value: 'R$ 18M+', label: 'Sob gestão' },
                    { value: '99.9%', label: 'Uptime' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-xl font-bold text-[#121212] tracking-tight">{stat.value}</p>
                      <p className="text-[12px] text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </motion.div>

            {/* Right: Visual */}
            <FadeUp delay={0.2} className="hidden lg:block">
              <PortfolioVisual />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────────── */}
      <section className="py-16 border-y border-gray-200/50 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <p className="text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-8">
              Trusted by investors who think in allocations, not emotions
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {['Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX'].map((exchange, i) => (
                <div
                  key={exchange}
                  className="flex items-center gap-2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-[15px] font-semibold tracking-tight">{exchange}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── WHY REBALANCING (Storytelling) ──────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-600 mb-3">Por que rebalancear?</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mb-4">
                HODL é esperança.<br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Rebalanceamento é estratégia.
                </span>
              </h2>
              <p className="text-[16px] text-[#6B7280] leading-relaxed">
                Quando um ativo sobe demais, você está sobreexposto. Quando cai demais, perdeu a chance de comprar barato.
                O rebalanceamento disciplinado resolve os dois problemas — automaticamente.
              </p>
            </div>
          </FadeUp>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: 'Compre na baixa, automaticamente',
                description: 'Quando um ativo cai abaixo da sua alocação alvo, o rebalanceamento compra mais — sem viés emocional.',
                accent: 'from-emerald-500 to-teal-500',
                span: '',
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: 'Realize lucros, sistematicamente',
                description: 'Quando um ativo sobe acima do alvo, vendemos o excedente. Sem ganância, sem FOMO.',
                accent: 'from-amber-500 to-orange-500',
                span: '',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Controle de risco real',
                description: 'Bandas de tolerância garantem que seu portfólio nunca fique perigosamente concentrado em um único ativo.',
                accent: 'from-indigo-500 to-violet-500',
                span: '',
              },
              {
                icon: <Target className="w-5 h-5" />,
                title: 'Alocação é o que importa',
                description: 'Estudos mostram que mais de 90% do retorno de longo prazo vem da alocação de ativos, não do timing.',
                accent: 'from-sky-500 to-blue-500',
                span: 'lg:col-span-2',
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: 'Velocidade importa',
                description: 'Mercados cripto operam 24/7. A Nortfy monitora e sugere rebalanceamentos em tempo real.',
                accent: 'from-violet-500 to-purple-500',
                span: '',
              },
            ].map((card, i) => (
              <FadeUp key={card.title} delay={i * 0.08} className={card.span}>
                <div className="group h-full p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-200/50 group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="text-[16px] font-bold text-[#121212] tracking-tight mb-2">{card.title}</h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">{card.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 lg:py-32 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-600 mb-3">Como funciona</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mb-4">
                Três passos para um portfólio equilibrado
              </h2>
              <p className="text-[16px] text-[#6B7280]">
                Setup em minutos. Rebalanceamento contínuo por anos.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                icon: <Wallet className="w-6 h-6" />,
                title: 'Conecte sua exchange',
                description: 'Integração via API com as principais exchanges. Leitura segura, sem acesso a saques.',
                color: 'from-indigo-600 to-violet-600',
              },
              {
                step: '02',
                icon: <Target className="w-6 h-6" />,
                title: 'Defina sua alocação',
                description: 'Escolha seus ativos e percentuais alvo. Defina bandas de tolerância para cada um.',
                color: 'from-violet-600 to-purple-600',
              },
              {
                step: '03',
                icon: <RefreshCw className="w-6 h-6" />,
                title: 'Rebalanceie automaticamente',
                description: 'A Nortfy monitora desvios e sugere operações quando suas bandas são ultrapassadas.',
                color: 'from-purple-600 to-pink-500',
              },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.15}>
                <div className="relative group h-full">
                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 -right-4 lg:-right-5 w-8 lg:w-10 h-px bg-gradient-to-r from-gray-200 to-transparent z-10" />
                  )}
                  <div className="h-full p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.08)] transition-all">
                    {/* Step number */}
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-300 mb-4 block">
                      Passo {item.step}
                    </span>
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/15 group-hover:scale-105 group-hover:shadow-indigo-500/25 transition-all`}>
                      {item.icon}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#121212] tracking-tight mb-2">{item.title}</h3>
                    <p className="text-[14px] text-[#6B7280] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PULSE ───────────────────────────────────────────── */}
      <section id="servicos" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-600 mb-3">The Pulse</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mb-4">
                  Veja seu portfólio{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    respirar
                  </span>
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-relaxed mb-8 max-w-lg">
                  O Pulse é o coração da Nortfy. Monitore em tempo real o drift de cada ativo,
                  visualize quando uma operação de rebalanceamento é necessária e execute com um clique.
                </p>
                <div className="space-y-4">
                  {[
                    'Monitoramento 24/7 de desvio de alocação',
                    'Alertas inteligentes quando bandas são ultrapassadas',
                    'Sugestões de trades com cálculo exato',
                    'Histórico completo de rebalanceamentos',
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[14px] text-[#374151]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <ThePulse />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ──────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="relative rounded-3xl bg-gradient-to-br from-[#121212] to-[#1a1a2e] p-10 sm:p-16 text-center overflow-hidden">
              {/* Decorative orbs */}
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[12px] font-semibold text-indigo-300">Planos flexíveis</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Comece grátis.<br />
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    Escale quando precisar.
                  </span>
                </h2>
                <p className="text-[16px] text-white/50 max-w-lg mx-auto mb-10 leading-relaxed">
                  Plano gratuito para começar a explorar. Premium para quem leva alocação a sério —
                  carteiras ilimitadas, alertas automáticos e muito mais.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/planos"
                    className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    Ver planos
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-2xl transition-all"
                  >
                    Começar grátis
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
