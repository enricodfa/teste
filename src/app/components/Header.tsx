'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { CaretUpDown, Plus, Briefcase, Check, Crown } from '@phosphor-icons/react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAuth } from '@/contexts/AuthContext';
import CreatePortfolioModal from './CreatePortfolioModal';

interface HeaderProps {
  title:       string;
  breadcrumb?: string;
  actions?:    React.ReactNode;
}

/* ── Portfolio Selector Dropdown ────────────────────────────── */
function PortfolioSelector() {
  const { portfolios, activePortfolio, setActivePortfolioId, canCreateMore, bootstrapping } = usePortfolio();
  const { isPremium } = useAuth();

  const [open,        setOpen]        = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  if (bootstrapping) {
    return (
      <div style={{
        height: 34, width: 160,
        background: 'var(--border-2)',
        borderRadius: 'var(--r)',
        animation: 'pulse 1.5s ease infinite',
      }} />
    );
  }

  return (
    <>
      <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* Selector trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 10px',
            height: 34,
            background: open ? 'var(--bg)' : 'transparent',
            border: `1px solid ${open ? 'var(--blue)' : 'var(--border)'}`,
            borderRadius: 'var(--r)',
            cursor: 'pointer',
            color: 'var(--t1)',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
            maxWidth: 220,
            boxShadow: open ? '0 0 0 3px rgba(59,91,219,0.10)' : 'none',
          }}
          onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = 'var(--t4)'; }}
          onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Briefcase size={13} weight="duotone" style={{ color: 'var(--blue)', flexShrink: 0 }} />
          <span style={{
            fontSize: 13, fontWeight: 600,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, textAlign: 'left',
          }}>
            {activePortfolio?.name ?? 'Carteira'}
          </span>
          <CaretUpDown
            size={12}
            style={{ color: 'var(--t4)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          />
        </button>

        {/* + button */}
        <button
          onClick={() => {
            setOpen(false);
            if (canCreateMore) {
              setShowModal(true);
            } else {
              // Redirect to plans if free user already has 1 portfolio
              window.location.href = '/planos';
            }
          }}
          title={canCreateMore ? 'Nova carteira' : 'Upgrade para criar mais carteiras'}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            cursor: 'pointer',
            color: canCreateMore ? 'var(--t3)' : 'var(--t4)',
            transition: 'all 0.12s',
            flexShrink: 0,
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background     = canCreateMore ? 'var(--blue-subtle)' : 'var(--bg)';
            e.currentTarget.style.borderColor    = canCreateMore ? 'var(--blue)'        : 'var(--t4)';
            e.currentTarget.style.color          = canCreateMore ? 'var(--blue)'        : 'var(--t3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background  = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color       = canCreateMore ? 'var(--t3)' : 'var(--t4)';
          }}
        >
          {canCreateMore ? (
            <Plus size={13} weight="bold" />
          ) : (
            <Crown size={13} weight="duotone" style={{ color: 'var(--amber, #f59e0b)' }} />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 220,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            boxShadow: '0 8px 32px rgba(14,17,23,0.10), 0 2px 8px rgba(14,17,23,0.06)',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'dropdownIn 0.14s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>
            {/* Section label */}
            <div style={{
              padding: '8px 12px 5px',
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--t4)',
            }}>
              Suas carteiras
            </div>

            <div style={{ height: 1, background: 'var(--border-2)', margin: '0 12px' }} />

            {/* Portfolio list */}
            <div style={{ padding: '4px 0' }}>
              {portfolios.map((p) => {
                const isActive = p.id === activePortfolio?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setActivePortfolioId(p.id); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px',
                      background: isActive ? 'var(--blue-subtle)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'background 0.08s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: isActive ? 'var(--blue)' : 'var(--bg)',
                      border: `1px solid ${isActive ? 'var(--blue)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Briefcase size={12} weight="duotone" style={{ color: isActive ? '#fff' : 'var(--t4)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: isActive ? 700 : 600,
                        color: isActive ? 'var(--blue)' : 'var(--t1)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                        banda {Math.round(p.tolerance_band * 100)}%
                      </div>
                    </div>
                    {isActive && (
                      <Check size={13} weight="bold" style={{ color: 'var(--blue)', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer: create or upgrade */}
            <div style={{ borderTop: '1px solid var(--border-2)', padding: '4px 0' }}>
              {canCreateMore ? (
                <button
                  onClick={() => { setOpen(false); setShowModal(true); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background 0.08s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    border: '1px dashed var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Plus size={11} weight="bold" style={{ color: 'var(--t4)' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t3)' }}>
                    Nova carteira
                  </span>
                </button>
              ) : (
                <a
                  href="/planos"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    textDecoration: 'none',
                    transition: 'background 0.08s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Crown size={12} weight="duotone" style={{ color: '#f59e0b' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                    Assinar Premium
                  </span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <CreatePortfolioModal open={showModal} onClose={() => setShowModal(false)} />

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

/* ── Header ─────────────────────────────────────────────────── */
export default function Header({ title, breadcrumb, actions }: HeaderProps) {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && (
          <div style={{ fontSize: '12px', color: 'var(--text-4)', marginBottom: '1px', fontWeight: '500' }}>
            {breadcrumb}
          </div>
        )}
        <h1 style={{
          fontSize: '15px', fontWeight: '700',
          color: 'var(--text-1)', margin: 0, letterSpacing: '-0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </h1>
      </div>

      {/* Portfolio selector */}
      <PortfolioSelector />

      {/* Search */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          cursor: 'text', minWidth: '180px',
          transition: 'border-color 0.15s',
        }}
        onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Search size={13} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
        <input
          placeholder="Buscar ativo..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: '13px', color: 'var(--text-2)',
            width: '100%', fontFamily: 'inherit',
          }}
        />
        <span style={{
          fontSize: '11px', color: 'var(--text-4)',
          background: 'var(--border-subtle)', border: '1px solid var(--border)',
          borderRadius: '4px', padding: '1px 5px',
          flexShrink: 0, fontFamily: 'var(--font-mono)',
        }}>
          ⌘K
        </span>
      </div>

      {/* Actions slot */}
      {actions}

      {/* Notifications */}
      <button
        style={{
          position: 'relative', width: 36, height: 36,
          borderRadius: 'var(--radius)',
          background: 'transparent', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-3)',
          transition: 'background 0.12s, border-color 0.12s', flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-subtle)'; e.currentTarget.style.borderColor = 'var(--text-4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Bell size={15} strokeWidth={1.8} />
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--danger)', border: '1.5px solid var(--surface)',
        }} />
      </button>

      {/* Avatar */}
      <div
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700', color: 'var(--accent)',
          flexShrink: 0, cursor: 'pointer',
          border: '2px solid var(--border)', transition: 'border-color 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        JP
      </div>
    </header>
  );
}