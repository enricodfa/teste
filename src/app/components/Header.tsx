'use client';

import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
}

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
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Title */}
      <div style={{ flex: 1 }}>
        {breadcrumb && (
          <div style={{ fontSize: '12px', color: 'var(--text-4)', marginBottom: '1px', fontWeight: '500' }}>
            {breadcrumb}
          </div>
        )}
        <h1
          style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-1)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          cursor: 'text',
          minWidth: '200px',
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
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: 'var(--text-2)',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-4)',
            background: 'var(--border-subtle)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '1px 5px',
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Actions slot */}
      {actions}

      {/* Notifications */}
      <button
        style={{
          position: 'relative',
          width: 36,
          height: 36,
          borderRadius: 'var(--radius)',
          background: 'transparent',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-3)',
          transition: 'background 0.12s, border-color 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-subtle)'; e.currentTarget.style.borderColor = 'var(--text-4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Bell size={15} strokeWidth={1.8} />
        {/* Badge */}
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--danger)',
            border: '1.5px solid var(--surface)',
          }}
        />
      </button>

      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700',
          color: 'var(--accent)',
          flexShrink: 0,
          cursor: 'pointer',
          border: '2px solid var(--border)',
          transition: 'border-color 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        JP
      </div>
    </header>
  );
}
