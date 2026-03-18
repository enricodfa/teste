'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SquaresFour,
  ChartPie,
  ArrowsLeftRight,
  SignOut,
  Question,
  Pulse,
  Lock,
  Crown,
  Lightning,
  X
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

/* ── nav config ───────────────────────────────────────────── */
const NAV_PRIMARY = [
  { label: 'Visão Geral', href: '/dashboard',   Icon: SquaresFour, premium: false },
  { label: 'Análise',     href: '/analysis',    Icon: Pulse,       premium: true  },
  { label: 'Alocação',    href: '/allocation',  Icon: ChartPie,    premium: true  },
  { label: 'Operações',   href: '/operations',  Icon: ArrowsLeftRight, premium: false },
];

/* ── NavItem ──────────────────────────────────────────────── */
function NavItem({
  label, href, Icon, active, locked,
}: {
  label: string; href: string; Icon: React.ElementType; active: boolean; locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-[10px] text-[14px] md:text-[13.5px] transition-colors duration-200
        ${active
          ? 'bg-indigo-50 text-indigo-700 font-bold'
          : 'text-gray-500 font-semibold hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm bg-indigo-600" />
      )}
      <Icon
        size={18}
        weight={active ? 'fill' : 'regular'}
        className={`shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`}
      />
      <span className="flex-1">{label}</span>
      {locked && (
        <Lock size={12} weight="fill" className="shrink-0 text-gray-400" />
      )}
    </Link>
  );
}

/* ── Sidebar ──────────────────────────────────────────────── */
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut, isPremium } = useAuth();

  const fullName: string = (user?.user_metadata?.full_name as string | undefined)
    ?? (user?.user_metadata?.name as string | undefined)
    ?? user?.email
    ?? 'Usuário';
  const firstName = fullName.split(' ')[0];
  const initials  = fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <aside className={`
      fixed left-0 top-0 bottom-0 w-[260px] md:w-[240px] bg-white border-r border-gray-200 flex flex-col z-40
      transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      
      {/* Logo */}
      <div className="h-[72px] border-b border-gray-100 flex items-center justify-between px-6 md:px-5 shrink-0">
        <Link href="/" className="flex items-center group">
          <div className="relative transition-transform group-hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Nortfy" 
              width={120} 
              height={38} 
              className="object-contain h-6 w-auto"
              priority
            />
          </div>
        </Link>
        <button 
          onClick={onClose}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-2.5 overflow-y-auto scroller-clean">
        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Principal
        </p>
        <div className="flex flex-col gap-1">
          {NAV_PRIMARY.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
              locked={item.premium && !isPremium}
            />
          ))}
        </div>
      </nav>

      {/* Help */}
      <div className="border-t border-gray-100 px-3 md:px-2.5 py-3 md:py-2">
        <button
          className="flex items-center gap-2.5 w-full px-3 py-2.5 md:py-2 rounded-[10px] text-[14px] md:text-[13.5px] font-semibold text-gray-500 bg-transparent border-none cursor-pointer transition-colors duration-100 hover:bg-gray-50 hover:text-gray-900"
        >
          <Question size={18} className="text-gray-400" />
          Ajuda &amp; Suporte
        </button>
      </div>

      {/* Plan indicator */}
      <div className="px-3 md:px-2.5 pb-2 md:pb-1.5">
        {isPremium ? (
          /* Premium active badge */
          <div className="flex items-center gap-3 md:gap-2 px-4 py-3 md:px-3 md:py-2.5 rounded-[12px] md:rounded-lg bg-amber-50 border border-amber-200/60 shadow-sm">
            <Crown size={16} weight="fill" className="shrink-0 text-amber-500" />
            <div>
              <div className="text-[13px] md:text-xs font-bold leading-tight text-amber-600">
                Plano Premium
              </div>
              <div className="text-[11px] md:text-[10px] text-gray-400 mt-px font-medium">
                Recursos desbloqueados
              </div>
            </div>
          </div>
        ) : (
          /* Free – dark gradient card with upgrade CTA */
          <Link
            href="/planos"
            className="group flex flex-col gap-2 md:gap-1.5 p-4 md:p-3 rounded-[12px] md:rounded-lg bg-gradient-to-br from-indigo-950 to-gray-900 border border-indigo-500/20 no-underline transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <Crown size={14} weight="fill" className="shrink-0 text-amber-400" />
              <span className="text-[13px] md:text-xs font-bold text-white tracking-tight">
                Fazer upgrade
              </span>
            </div>
            <span className="text-[12px] md:text-[11px] leading-snug text-indigo-200/70 font-medium">
              Desbloqueie análise de rebalanceamento avançada
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[12px] md:text-[11px] font-bold text-indigo-400">
              <Lightning size={12} weight="fill" />
              Conhecer planos
            </div>
          </Link>
        )}
      </div>

      {/* User section */}
      <div className="border-t border-gray-100 px-3 md:px-3 py-3 md:py-2.5 bg-gray-50/50">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg group">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={firstName}
              className="w-9 h-9 md:w-8 md:h-8 rounded-full object-cover shrink-0 border-[1.5px] border-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 md:w-8 md:h-8 rounded-[10px] bg-white flex items-center justify-center text-[12px] font-bold text-indigo-600 shrink-0 border border-gray-200 shadow-sm">
              {initials}
            </div>
          )}

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <div className="text-[14px] md:text-[13px] font-bold text-gray-900 truncate tracking-tight">
              {firstName}
            </div>
            <div className="text-[12px] md:text-[11px] font-medium text-gray-400 truncate">
              {user?.email ?? ''}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={signOut}
            title="Sair da conta"
            className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-transparent bg-transparent text-gray-400 cursor-pointer shrink-0 transition-colors duration-200 hover:bg-white hover:text-red-500 hover:border-gray-200 hover:shadow-sm"
          >
            <SignOut size={16} weight="bold" />
          </button>
        </div>
      </div>
    </aside>
  );
}