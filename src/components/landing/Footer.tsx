'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { InstagramLogo, XLogo } from '@phosphor-icons/react';

const FOOTER_SECTIONS = [
  {
    title: 'Produto',
    links: [
      { label: 'Serviços', href: '/servicos' },
      { label: 'Planos', href: '/planos' },
      { label: 'Como funciona', href: '/como-funciona' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Política de Privacidade', href: '/privacidade' },
    ],
  },
];

const SOCIALS = [
  { 
    label: 'X (Twitter)', 
    href: '#', 
    icon: <XLogo weight="fill" className="w-6 h-6" /> 
  },
  { 
    label: 'Instagram', 
    href: '#', 
    icon: <InstagramLogo weight="fill" className="w-6 h-6" /> 
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0A0F] text-white overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          <div className="col-span-2">
            <Link href="/" className="flex items-center group mb-6">
              <div className="relative transition-transform group-hover:scale-105">
                <Image 
                  src="/logo.png" 
                  alt="Nortfy" 
                  width={140} 
                  height={45} 
                  className="object-contain h-7 w-auto brightness-0 invert opacity-90"
                />
              </div>
            </Link>
            <p className="text-white/40 text-[13px] leading-relaxed max-w-xs mb-6">
              Rebalanceamento inteligente de portfólios cripto. Automatize suas alocações e maximize retornos ajustados ao risco.
            </p>
            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

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