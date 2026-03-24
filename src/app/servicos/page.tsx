'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  RefreshCw,
  BarChart3,
  Target,
  Shield,
  Bell,
  LineChart,
  Wallet,
  Zap,
  Clock,
  Lock,
  Globe,
  Sparkles,
  TrendingUp,
  PieChart,
  Activity,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

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

/* ─── Data ──────────────────────────────────────────────────── */
const CORE_SERVICES = [
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Rebalanceamento Inteligente',
    description: 'Algoritmo que monitora desvios de alocação e sugere operações de compra/venda para manter seu portfólio alinhado com a estratégia definida.',
    highlights: ['Bandas de tolerância relativas', 'Sugestões precisas de trade', 'Execução com 1 clique'],
    gradient: 'from-indigo-600 to-violet-600',
    shadow: 'shadow-indigo-500/15',
  },
  {
    icon: <PieChart className="w-6 h-6" />,
    title: 'Alocação Personalizada',
    description: 'Defina percentuais-alvo para cada ativo do seu portfólio. Configure bandas de tolerância e deixe o sistema trabalhar por você.',
    highlights: ['Alocação por percentual', 'Bandas customizáveis', 'Multi-ativos cripto'],
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/15',
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'The Pulse — Monitoramento Live',
    description: 'Dashboard em tempo real que exibe o drift de cada ativo, status do portfólio e oportunidades de rebalanceamento conforme o mercado se movimenta.',
    highlights: ['Drift em tempo real', 'Indicadores visuais', 'Atualização contínua'],
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/15',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Análise de Performance',
    description: 'Relatórios detalhados sobre a evolução do portfólio, retorno ajustado ao risco e impacto de cada rebalanceamento realizado.',
    highlights: ['Retorno acumulado', 'Comparativo vs HODL', 'Métricas de risco'],
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/15',
  },
];

const FEATURES_GRID = [
  { icon: <Bell className="w-5 h-5" />, title: 'Alertas Inteligentes', desc: 'Notificações quando o drift ultrapassa as bandas configuradas.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Segurança Read-Only', desc: 'API de leitura apenas. Zero acesso a movimentação de fundos.' },
  { icon: <Clock className="w-5 h-5" />, title: 'Mercado 24/7', desc: 'Monitoramento contínuo — cripto não dorme, nós também não.' },
  { icon: <Wallet className="w-5 h-5" />, title: 'Multi-Exchange', desc: 'Integração com Binance, Coinbase, Kraken, Bybit e mais.' },
  { icon: <Lock className="w-5 h-5" />, title: 'Dados Criptografados', desc: 'Todas as chaves de API são armazenadas com criptografia AES-256.' },
  { icon: <Globe className="w-5 h-5" />, title: 'API Aberta', desc: 'Acesse seus dados e integre com suas próprias ferramentas via REST API.' },
  { icon: <LineChart className="w-5 h-5" />, title: 'Histórico Completo', desc: 'Registro de todas as operações e evolução do portfólio ao longo do tempo.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Setup em Minutos', desc: 'Conecte sua exchange, defina alocações e comece a rebalancear imediatamente.' },
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Conecte',
    description: 'Vincule sua exchange via API read-only. Suportamos as principais plataformas do mercado.',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    number: '02',
    title: 'Configure',
    description: 'Defina sua alocação ideal: quais ativos, percentuais-alvo e bandas de tolerância.',
    icon: <Target className="w-5 h-5" />,
  },
  {
    number: '03',
    title: 'Monitore',
    description: 'Acompanhe o drift em tempo real pelo Pulse. Receba alertas quando as bandas forem ultrapassadas.',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    number: '04',
    title: 'Rebalanceie',
    description: 'Execute as sugestões de trade com cálculo exato de quanto comprar ou vender de cada ativo.',
    icon: <RefreshCw className="w-5 h-5" />,
  },
];

/* ═══════════════════════════════════════════════════════════════ */
export default function ServicosPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-28 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-100/50 via-violet-50/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.3]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6">

          <FadeUp delay={0.05}>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#121212] tracking-tight leading-[1.08] mb-5">
              Tudo que você precisa para{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                rebalancear com precisão
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-[16px] sm:text-[17px] text-gray-500 max-w-xl mx-auto leading-relaxed">
              Uma plataforma completa que transforma a complexidade do rebalanceamento cripto em decisões simples e data-driven.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── CORE SERVICES ─────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="space-y-6">
            {CORE_SERVICES.map((service, i) => (
              <FadeUp key={service.title} delay={i * 0.08}>
                <div className="group bg-white rounded-3xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left: Content */}
                    <div className="flex-1 p-8 lg:p-10">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white mb-5 shadow-lg ${service.shadow} group-hover:scale-105 transition-transform`}>
                        {service.icon}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight mb-3">
                        {service.title}
                      </h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed mb-6 max-w-lg">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.highlights.map((h) => (
                          <span
                            key={h}
                            className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[12px] font-medium text-gray-600"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Visual accent */}
                    <div className={`hidden lg:flex w-48 bg-gradient-to-br ${service.gradient} items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/5" />
                      <div className="relative text-white/20 scale-[2.5]">
                        {service.icon}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white/60">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-600 mb-3">Processo</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mb-4">
                Do zero ao rebalanceamento em 4 etapas
              </h2>
              <p className="text-[16px] text-gray-500">
                Um fluxo simples que qualquer investidor consegue configurar.
              </p>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <FadeUp key={step.number} delay={i * 0.1}>
                <div className="relative group">
                  {/* Connector */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-gradient-to-r from-gray-200 to-transparent z-10" />
                  )}
                  <div className="h-full p-6 rounded-2xl bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.08)] transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[32px] font-extrabold bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent leading-none">
                        {step.number}
                      </span>
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-[16px] font-bold text-[#121212] mb-2">{step.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-600 mb-3">Funcionalidades</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight">
                Cada detalhe pensado para{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  investidores sérios
                </span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES_GRID.map((feat, i) => (
              <FadeUp key={feat.title} delay={i * 0.05}>
                <div className="group h-full p-6 rounded-2xl bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="text-[14px] font-bold text-[#121212] mb-1.5">{feat.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── REBALANCING vs HODL ───────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white/60">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mb-4">
                Rebalanceamento vs HODL
              </h2>
              <p className="text-[16px] text-gray-500">
                Veja porque uma estratégia ativa supera o &ldquo;comprar e esquecer&rdquo;.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* HODL */}
              <div className="p-8 rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-[#121212] mb-3">HODL tradicional</h3>
                <ul className="space-y-3">
                  {[
                    'Sem controle de risco',
                    'Sobreexposição em altas',
                    'Oportunidades perdidas em quedas',
                    'Depende de timing e emoção',
                    'Concentração perigosa',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <span className="text-[14px] text-gray-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rebalanceamento */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#121212] to-[#1a1a2e] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-5">
                    <RefreshCw className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Rebalanceamento Nortfy</h3>
                  <ul className="space-y-3">
                    {[
                      'Compra baixo, vende alto — sistematicamente',
                      'Risco controlado por bandas de tolerância',
                      'Capitaliza quedas automaticamente',
                      'Zero emoção, 100% disciplina',
                      'Diversificação mantida continuamente',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="text-[14px] text-white/70">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeUp>
            <div className="relative rounded-3xl bg-gradient-to-br from-[#121212] to-[#1a1a2e] p-10 sm:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
                  Comece a rebalancear hoje
                </h2>
                <p className="text-[15px] text-white/40 max-w-md mx-auto mb-8">
                  Plano gratuito disponível. Setup em menos de 5 minutos.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px transition-all"
                  >
                    Criar conta grátis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/planos"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
                  >
                    Ver planos
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
