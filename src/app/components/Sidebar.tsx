'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  History,
  Settings,
  Sliders,
  Plug,
  HelpCircle,
  ChevronDown,
  LogOut,
} from 'lucide-react';

const NAV_MAIN = [
  { label: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Carteira', icon: Briefcase, href: '/portfolio' },
  { label: 'Rebalancear', icon: ArrowLeftRight, href: '/rebalance' },
  { label: 'Histórico', icon: History, href: '/history' },
];

const NAV_CONFIG = [
  { label: 'Parâmetros', icon: Sliders, href: '/settings/params' },
  { label: 'Integrações', icon: Plug, href: '/settings/integrations' },
  { label: 'Configurações', icon: Settings, href: '/settings' },
];

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
}

function NavItem({ label, icon: Icon, href, active }: NavItemProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        fontWeight: active ? '600' : '500',
        fontSize: '13.5px',
        color: active ? 'var(--accent)' : 'var(--text-2)',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        transition: 'background 0.12s, color 0.12s',
        textDecoration: 'none',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--surface-subtle)';
          e.currentTarget.style.color = 'var(--text-1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-2)';
        }
      }}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '6px',
            bottom: '6px',
            width: '3px',
            borderRadius: '0 3px 3px 0',
            background: 'var(--accent)',
          }}
        />
      )}
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [userOpen, setUserOpen] = useState(false);

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid var(--border)',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9H11" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
            Portfolio
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-4)', fontWeight: '500' }}>
            Manager
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {/* Main */}
        <div style={{ marginBottom: '24px' }}>
          <div className="label" style={{ padding: '0 12px', marginBottom: '4px' }}>
            Principal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {NAV_MAIN.map((item) => (
              <NavItem key={item.href} {...item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
            ))}
          </div>
        </div>

        {/* Config */}
        <div>
          <div className="label" style={{ padding: '0 12px', marginBottom: '4px' }}>
            Configurações
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {NAV_CONFIG.map((item) => (
              <NavItem key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>
        </div>
      </nav>

      {/* Help */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius)',
            fontSize: '13.5px',
            fontWeight: '500',
            color: 'var(--text-3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-subtle)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <HelpCircle size={16} strokeWidth={1.8} />
          Ajuda & Suporte
        </button>
      </div>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setUserOpen(!userOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 10px',
            borderRadius: 'var(--radius)',
            background: userOpen ? 'var(--surface-subtle)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.12s',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-subtle)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = userOpen ? 'var(--surface-subtle)' : 'transparent'; }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            JP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              João Pork
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Pro Plan
            </div>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-4)', transform: userOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
        </button>

        {userOpen && (
          <div
            style={{
              marginTop: '4px',
              padding: '4px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--danger-text)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-subtle)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
