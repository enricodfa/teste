'use client';

import Link from 'next/link';
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
} from '@phosphor-icons/react';
import { Activity } from 'lucide-react';
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
        relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors duration-100
        ${active
          ? 'bg-indigo-50 text-indigo-600 font-semibold'
          : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm bg-indigo-600" />
      )}
      <Icon
        size={17}
        weight={active ? 'fill' : 'regular'}
        className="shrink-0"
      />
      <span className="flex-1">{label}</span>
      {locked && (
        <Lock size={11} weight="fill" className="shrink-0 text-gray-400" />
      )}
    </Link>
  );
}

/* ── Sidebar ──────────────────────────────────────────────── */
export default function Sidebar() {
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
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-w)] bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-[var(--header-h)] border-b border-gray-200 flex items-center px-4 gap-2.5">
        <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
          <Activity size={17} strokeWidth={2.5} className="text-white" />
        </div>
        <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
          Nortfy
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 overflow-y-auto">
        <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Principal
        </p>
        <div className="flex flex-col gap-0.5">
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
      <div className="border-t border-gray-100 px-2.5 py-2">
        <button
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13.5px] font-medium text-gray-500 bg-transparent border-none cursor-pointer transition-colors duration-100 hover:bg-gray-50 hover:text-gray-900"
        >
          <Question size={17} />
          Ajuda &amp; Suporte
        </button>
      </div>

      {/* Plan indicator */}
      <div className="px-2.5 pb-1.5">
        {isPremium ? (
          /* Premium active badge */
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200/60">
            <Crown size={14} weight="fill" className="shrink-0 text-amber-500" />
            <div>
              <div className="text-xs font-bold leading-tight text-amber-600">
                Plano Premium
              </div>
              <div className="text-[10px] text-gray-400 mt-px">
                Todos os recursos desbloqueados
              </div>
            </div>
          </div>
        ) : (
          /* Free – dark gradient card with upgrade CTA */
          <Link
            href="/planos"
            className="group flex flex-col gap-1.5 p-3 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-indigo-500/20 no-underline transition-opacity duration-100 hover:opacity-90"
          >
            <div className="flex items-center gap-1.5">
              <Crown size={13} weight="fill" className="shrink-0 text-amber-400" />
              <span className="text-xs font-bold text-white">
                Fazer upgrade
              </span>
            </div>
            <span className="text-[11px] leading-snug text-white/55">
              Desbloqueie análise e alocação avançada
            </span>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-indigo-400">
              <Lightning size={11} weight="fill" />
              Ver planos
            </div>
          </Link>
        )}
      </div>

      {/* User section */}
      <div className="border-t border-gray-200 px-3 py-2.5">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={firstName}
              className="w-8 h-8 rounded-full object-cover shrink-0 border-[1.5px] border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0 border-[1.5px] border-gray-200">
              {initials}
            </div>
          )}

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 truncate">
              {firstName}
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {user?.email ?? ''}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={signOut}
            title="Sair da conta"
            className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-gray-400 cursor-pointer shrink-0 transition-colors duration-100 hover:bg-gray-100 hover:text-gray-900"
          >
            <SignOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
