'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ChartPie,
  ListBullets,
  Sliders,
  BellRinging,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Warning,
  TrendUp,
  CurrencyBtc,
  ArrowsClockwise,
  SealCheck,
  Lightbulb,
  CaretRight,
  Percent,
  Coins,
} from '@phosphor-icons/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/* ─── Helpers ────────────────────────────────────────────────── */
function useReveal(margin = '-60px') {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin } as any);
  return { ref, isInView };
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Pie Chart Visual ───────────────────────────────────────── */
function PieVisual() {
  const slices = [
    { label: 'Bitcoin', pct: 40, color: '#f59e0b', bg: 'bg-amber-400' },
    { label: 'Ethereum', pct: 30, color: '#818cf8', bg: 'bg-indigo-400' },
    { label: 'Solana', pct: 20, color: '#34d399', bg: 'bg-emerald-400' },
    { label: 'Stablecoins', pct: 10, color: '#38bdf8', bg: 'bg-sky-400' },
  ];

  // SVG pie from percentages
  const r = 80;
  const cx = 100;
  const cy = 100;
  let cumulative = 0;

  function describeArc(startPct: number, endPct: number) {
    const start = (startPct / 100) * 2 * Math.PI - Math.PI / 2;
    const end = (endPct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = endPct - startPct > 50 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_40px_rgba(99,102,241,0.07)] p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-1">
        Estratégia
      </p>
      <p className="text-base font-bold text-[#121212] mb-6">Alocação Ideal</p>

      <div className="flex items-center gap-6">
        {/* SVG Pie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <svg width="120" height="120" viewBox="0 0 200 200">
            {slices.map((s, i) => {
              const start = cumulative;
              cumulative += s.pct;
              return (
                <motion.path
                  key={s.label}
                  d={describeArc(start, cumulative)}
                  fill={s.color}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
                  className="hover:opacity-90 transition-opacity"
                />
              );
            })}
            {/* Center hole */}
            <circle cx={cx} cy={cy} r={42} fill="white" />
            <text x={cx} y={cy - 4} textAnchor="middle" className="text-[11px]" fill="#9ca3af" fontSize="11">
              Alvo
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#121212" fontSize="14" fontWeight="700">
              100%
            </text>
          </svg>
        </motion.div>

        {/* Legend */}
        <div className="space-y-2.5 flex-1">
          {slices.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${s.bg} flex-shrink-0`} />
                <span className="text-[13px] text-[#374151] font-medium">{s.label}</span>
              </div>
              <span className="text-[13px] font-bold text-[#121212] font-mono">{s.pct}%</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100"
      >
        <SealCheck weight="fill" className="w-4 h-4 text-indigo-500" />
        <span className="text-[12px] font-medium text-indigo-700">Estratégia salva com sucesso</span>
      </motion.div>
    </div>
  );
}

/* ─── Assets Visual ──────────────────────────────────────────── */
function AssetsVisual() {
  const assets = [
    { coin: 'BTC', name: 'Bitcoin', qty: '0.42', value: 'R$ 148.200', target: 40, real: 52, over: true },
    { coin: 'ETH', name: 'Ethereum', qty: '4.10', value: 'R$ 56.890', target: 30, real: 22, over: false },
    { coin: 'SOL', name: 'Solana', qty: '38.5', value: 'R$ 42.350', target: 20, real: 18, over: false },
    { coin: 'USDC', name: 'Stablecoins', qty: '18.200', value: 'R$ 18.200', target: 10, real: 8, over: false },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_40px_rgba(99,102,241,0.07)] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-0.5">Carteira</p>
        <p className="text-base font-bold text-[#121212]">Ativos Cadastrados</p>
      </div>
      <div className="divide-y divide-gray-50">
        {assets.map((a, i) => (
          <motion.div
            key={a.coin}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 px-6 py-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-black text-[#121212]">{a.coin.slice(0, 2)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-[#121212]">{a.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400">alvo {a.target}%</span>
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  <span className={`text-[12px] font-bold font-mono ${a.over ? 'text-red-500' : 'text-emerald-600'}`}>
                    {a.real}%
                  </span>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${a.real}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                  className={`absolute inset-y-0 left-0 rounded-full ${a.over ? 'bg-gradient-to-r from-red-400 to-orange-400' : 'bg-gradient-to-r from-indigo-400 to-violet-400'}`}
                />
                {/* Target marker */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-gray-400/40 rounded-full"
                  style={{ left: `${a.target}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="px-6 py-3.5 bg-amber-50/60 border-t border-amber-100">
        <div className="flex items-center gap-2">
          <Warning weight="fill" className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-[12px] font-medium text-amber-700">BTC acima do alvo — desequilíbrio detectado</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Bands Visual ───────────────────────────────────────────── */
function BandsVisual() {
  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_40px_rgba(99,102,241,0.07)] p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-0.5">Configuração</p>
      <p className="text-base font-bold text-[#121212] mb-6">Bandas de Tolerância — BTC</p>

      {/* Band visualization */}
      <div className="relative">
        {/* Labels */}
        <div className="flex justify-between text-[11px] font-mono font-semibold mb-1.5">
          <span className="text-red-500">Piso 25%</span>
          <span className="text-indigo-600">Alvo 40%</span>
          <span className="text-red-500">Teto 55%</span>
        </div>

        {/* Track */}
        <div className="relative h-6 rounded-full bg-gray-100 overflow-visible">
          {/* Safe zone (band) */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: '25%', width: '30%', transformOrigin: 'left' }}
            className="absolute inset-y-0 bg-indigo-100 rounded-full"
          />
          {/* Danger left */}
          <div className="absolute inset-y-0 left-0 w-[25%] bg-red-50 rounded-l-full" />
          {/* Danger right */}
          <div className="absolute inset-y-0 right-0 w-[45%] bg-red-50 rounded-r-full" />

          {/* Center line */}
          <div className="absolute inset-y-0 w-0.5 bg-indigo-400" style={{ left: '40%' }} />

          {/* Current position dot */}
          <motion.div
            initial={{ left: '40%', opacity: 0 }}
            whileInView={{ left: '52%', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-lg shadow-red-500/30"
            style={{ position: 'absolute' }}
          >
            <motion.div
              animate={{ scale: [1, 1.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-red-400 opacity-40"
            />
          </motion.div>
        </div>

        {/* Current label */}
        <div className="flex justify-end mt-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-100"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[12px] font-semibold text-red-600 font-mono">BTC atual: 52%</span>
          </motion.div>
        </div>
      </div>

      {/* Bands config row */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Piso', value: '25%', sub: '-15pp', color: 'bg-red-50 border-red-100 text-red-600' },
          { label: 'Alvo', value: '40%', sub: 'Meta', color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: 'Teto', value: '55%', sub: '+15pp', color: 'bg-red-50 border-red-100 text-red-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            className={`px-3 py-2.5 rounded-xl border text-center ${item.color}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-0.5">{item.label}</p>
            <p className="text-[15px] font-black font-mono">{item.value}</p>
            <p className="text-[10px] font-medium opacity-60">{item.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Alert Visual ───────────────────────────────────────────── */
function AlertVisual() {
  const alerts = [
    {
      coin: 'BTC',
      type: 'VENDER',
      desc: 'passou do teto (55%)',
      current: '62%',
      action: 'Vender R$ 8.400',
      color: 'border-red-200 bg-red-50/50',
      badge: 'bg-red-500',
      icon: <ArrowUp weight="bold" className="w-4 h-4 text-red-500" />,
    },
    {
      coin: 'ETH',
      type: 'COMPRAR',
      desc: 'furou o piso (22%)',
      current: '18%',
      action: 'Comprar R$ 5.200',
      color: 'border-emerald-200 bg-emerald-50/50',
      badge: 'bg-emerald-500',
      icon: <ArrowDown weight="bold" className="w-4 h-4 text-emerald-500" />,
    },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_40px_rgba(99,102,241,0.07)] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-0.5">
          <div className="relative">
            <span className="absolute w-3 h-3 rounded-full bg-red-400 animate-ping opacity-50" />
            <span className="relative flex w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <p className="text-base font-bold text-[#121212]">Alertas Ativos</p>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold">2 novos</span>
        </div>
        <p className="text-[12px] text-gray-400 ml-[22px]">Ação necessária no seu portfólio</p>
      </div>

      <div className="p-4 space-y-3">
        {alerts.map((a, i) => (
          <motion.div
            key={a.coin}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-2xl border p-4 ${a.color}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                {a.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-bold text-[#121212]">{a.coin}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${a.badge}`}>
                    {a.type}
                  </span>
                  <span className="text-[11px] text-gray-400 ml-auto font-mono font-semibold">{a.current}</span>
                </div>
                <p className="text-[12px] text-gray-500 mb-2">{a.desc}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 shadow-sm">
                  <ArrowsClockwise weight="bold" className="w-3 h-3 text-indigo-500" />
                  <span className="text-[12px] font-semibold text-[#121212]">{a.action}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-6 pb-5">
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[13px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow flex items-center justify-center gap-2"
        >
          <CheckCircle weight="fill" className="w-4 h-4" />
          Executar rebalanceamento
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Step number badge ──────────────────────────────────────── */
function StepBadge({ n, color }: { n: number; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 16 }}
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 flex-shrink-0`}
    >
      <span className="text-white font-black text-lg leading-none">{n}</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ComoFuncionaPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const steps = [
    {
      n: 1,
      icon: <ChartPie weight="duotone" className="w-6 h-6" />,
      color: 'from-indigo-600 to-violet-600',
      title: 'Defina sua Estratégia Ideal',
      subtitle: 'Esqueça apostas. Foque em alocação.',
      body: 'Você define qual a porcentagem ideal de cada criptomoeda na sua carteira com base no seu perfil de risco. O Nortfy usa essa estratégia como bússola para todas as decisões.',
      example: '40% Bitcoin · 30% Ethereum · 20% Solana · 10% Stablecoins',
      visual: <PieVisual />,
      flip: false,
    },
    {
      n: 2,
      icon: <ListBullets weight="duotone" className="w-6 h-6" />,
      color: 'from-violet-600 to-purple-600',
      title: 'Cadastre seus Ativos',
      subtitle: 'Sua carteira real vs. sua estratégia ideal.',
      body: 'Insira as criptomoedas que você possui e suas quantidades. O Nortfy cruza a sua carteira real com a sua estratégia ideal, mostrando exatamente onde estão os desequilíbrios — sem APIs, sem permissões de saque.',
      example: 'BTC sobrecomprado? ETH abaixo do alvo? Você vai saber na hora.',
      visual: <AssetsVisual />,
      flip: true,
    },
    {
      n: 3,
      icon: <Sliders weight="duotone" className="w-6 h-6" />,
      color: 'from-purple-600 to-pink-500',
      title: 'Configure as Bandas de Tolerância',
      subtitle: 'Não gire patrimônio à toa.',
      body: 'O mercado cripto é volátil por natureza. Você define uma banda de tolerância (ex: ±15%) e o sistema só alerta quando um ativo realmente sair dessa margem de segurança — evitando operações desnecessárias.',
      example: 'BTC alvo 40% → banda livre entre 25% e 55%.',
      visual: <BandsVisual />,
      flip: false,
    },
    {
      n: 4,
      icon: <BellRinging weight="duotone" className="w-6 h-6" />,
      color: 'from-rose-500 to-orange-500',
      title: 'Receba Alertas de Rebalanceamento',
      subtitle: 'A mágica acontece aqui.',
      body: 'O Nortfy monitora as oscilações e te avisa o momento exato de agir. Se um ativo estourar o teto, você vende o excedente e realiza lucro. Se furar o piso, você compra mais barato e acumula.',
      example: null,
      visual: <AlertVisual />,
      flip: true,
    },
  ];

  return (
    <main className="bg-[#F8F9FA] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.3]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-100/50 via-violet-50/25 to-transparent rounded-full blur-[130px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-0">
          <motion.div
            style={{ y: heroY }}
            className="max-w-3xl mx-auto text-center"
          >
     

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold text-[#121212] tracking-tight leading-[1.06] mb-6"
            >
              Como o Nortfy{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                funciona
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Usamos o método matemático de{' '}
              <strong className="text-[#374151]">Rebalanceamento por Bandas de Tolerância</strong> para
              remover a emoção das suas decisões — e forçar você a realizar lucros na alta e acumular
              ativos na baixa.
            </motion.p>

            {/* Step pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              {[
                { n: 1, label: 'Estratégia', icon: <ChartPie weight="duotone" className="w-3.5 h-3.5" /> },
                { n: 2, label: 'Ativos', icon: <ListBullets weight="duotone" className="w-3.5 h-3.5" /> },
                { n: 3, label: 'Bandas', icon: <Sliders weight="duotone" className="w-3.5 h-3.5" /> },
                { n: 4, label: 'Alertas', icon: <BellRinging weight="duotone" className="w-3.5 h-3.5" /> },
              ].map((s, i) => (
                <motion.a
                  key={s.n}
                  href={`#passo-${s.n}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.07, duration: 0.4 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                    {s.n}
                  </span>
                  <span className="text-[12px] font-semibold text-[#374151] group-hover:text-indigo-600 transition-colors">
                    {s.label}
                  </span>
                  {s.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>

        
      </section>

      {/* ── STEPS ─────────────────────────────────────────────── */}
      {steps.map((step) => (
        <section
          key={step.n}
          id={`passo-${step.n}`}
          className="min-h-screen flex items-center py-16 lg:py-0"
          style={{ background: step.n % 2 === 0 ? 'rgba(255,255,255,0.6)' : undefined }}
        >
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div
              className={`grid lg:grid-cols-2 gap-14 lg:gap-20 items-center ${
                step.flip ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''
              }`}
            >
              {/* Copy */}
              <FadeUp delay={0}>
                <div>
                  {/* Step badge */}
                  <div className="flex items-center gap-3 mb-5">
                    <StepBadge n={step.n} color={step.color} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">
                        Passo {String(step.n).padStart(2, '0')}
                      </p>
                      <p className="text-[12px] font-semibold text-indigo-600">{step.subtitle}</p>
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight leading-tight mb-4">
                    {step.title}
                  </h2>

                  <p className="text-[16px] text-[#6B7280] leading-relaxed mb-6 max-w-lg">
                    {step.body}
                  </p>

                  {/* Example box */}
                  {step.example && (
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 max-w-lg"
                    >
                      <Lightbulb weight="duotone" className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] text-indigo-700 font-medium leading-relaxed">
                        {step.example}
                      </p>
                    </motion.div>
                  )}

                  {/* Alert step: sell/buy explanation */}
                  {step.n === 4 && (
                    <div className="space-y-3 max-w-lg">
                      {[
                        {
                          dir: 'TETO estourado',
                          action: 'VENDER o excedente',
                          desc: 'Garanta o lucro e proteja seu capital',
                          color: 'bg-red-50 border-red-100',
                          icon: <ArrowUp weight="bold" className="w-4 h-4 text-red-500" />,
                          textColor: 'text-red-600',
                        },
                        {
                          dir: 'PISO furado',
                          action: 'COMPRAR mais',
                          desc: 'Acumule bons projetos na baixa',
                          color: 'bg-emerald-50 border-emerald-100',
                          icon: <ArrowDown weight="bold" className="w-4 h-4 text-emerald-600" />,
                          textColor: 'text-emerald-600',
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={item.dir}
                          initial={{ opacity: 0, x: -16 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.5 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${item.color}`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <p className={`text-[12px] font-black uppercase tracking-wider ${item.textColor}`}>
                              {item.dir} → {item.action}
                            </p>
                            <p className="text-[12px] text-gray-500">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </FadeUp>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {step.visual}
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* ── WHY IT WORKS ──────────────────────────────────────── */}
      <section className="min-h-screen flex items-center py-16 lg:py-0">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <FadeUp>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-600 mb-3">
                  Por que funciona?
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mb-4 leading-tight">
                  Matemática no lugar da{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    emoção
                  </span>
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-relaxed mb-8 max-w-lg">
                  Ao invés de tentar adivinhar o topo ou o fundo do mercado, o Nortfy usa a matemática
                  para te{' '}
                  <strong className="text-[#374151]">obrigar a realizar lucros nos momentos de euforia</strong>{' '}
                  e a ter caixa para comprar nos momentos de pânico.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: <TrendUp weight="duotone" className="w-5 h-5 text-emerald-500" />, text: 'Compra automática na baixa, sem viés emocional' },
                    { icon: <Coins weight="duotone" className="w-5 h-5 text-amber-500" />, text: 'Realização de lucro sistemática na alta' },
                    { icon: <Percent weight="duotone" className="w-5 h-5 text-indigo-500" />, text: 'Mais de 90% do retorno vem da alocação, não do timing' },
                    { icon: <ArrowsClockwise weight="duotone" className="w-5 h-5 text-violet-500" />, text: 'Portfólio sempre dentro do seu perfil de risco' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    >
                      {item.icon}
                      <span className="text-[14px] text-[#374151] font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Right: CTA dark card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-3xl bg-gradient-to-br from-[#121212] to-[#1a1a2e] p-10 text-center overflow-hidden">
                <div className="absolute top-0 left-1/3 w-56 h-56 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/30"
                  >
                    <ArrowsClockwise weight="duotone" className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight mb-3">
                    Pronto para rebalancear?
                  </h3>
                  <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
                    Configure sua estratégia em minutos. O Nortfy cuida do resto — 24 horas por dia.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                    >
                      Começar grátis
                      <ArrowRight weight="bold" className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/planos"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-[14px] font-semibold transition-all"
                    >
                      Ver planos
                      <CaretRight weight="bold" className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}