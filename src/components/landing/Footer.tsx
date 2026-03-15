'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight } from 'lucide-react';

const FOOTER_SECTIONS = [
  {
    title: 'Produto',
    links: [
      { label: 'Serviços', href: '/servicos' },
      { label: 'Planos', href: '/planos' },
      { label: 'Como funciona', href: '#como-funciona' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nós', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contato', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '#' },
      { label: 'Privacidade', href: '#' },
    ],
  },
];

const SOCIALS = [
  { label: 'Twitter', href: '#', icon: 'X' },
  { label: 'Discord', href: '#', icon: 'D' },
  { label: 'GitHub', href: '#', icon: 'G' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0A0F] text-white overflow-hidden">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Newsletter CTA */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-white/[0.06] p-8 sm:p-12 mb-16 overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-white/50 text-[15px] max-w-md">
                Receba insights sobre rebalanceamento, estratégias de alocação e atualizações da plataforma.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full lg:w-auto gap-3"
            >
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 lg:w-72 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 text-[14px] outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-[14px] font-semibold text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px active:translate-y-0 transition-all whitespace-nowrap"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold tracking-tight">Nortfy</span>
            </Link>
            <p className="text-white/40 text-[13px] leading-relaxed max-w-xs mb-6">
              Rebalanceamento inteligente de portfólios cripto. Automatize suas alocações e maximize retornos ajustados ao risco.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/40 text-[13px] font-bold hover:bg-white/[0.1] hover:text-white/70 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group text-[14px] text-white/50 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-px group-hover:opacity-100 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/25">
            &copy; {new Date().getFullYear()} Nortfy. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-white/20">
            Não constitui recomendação de investimento. Criptoativos são voláteis.
          </p>
        </div>
      </div>
    </footer>
  );
}
