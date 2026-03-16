'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlass, X, CaretUpDown } from '@phosphor-icons/react';
import { useDebounce } from '../hooks/useDebounce';
import { searchAssets } from '../services/assetsService';
import type { Asset } from '../services/assetsService';

// ✅ Atualizado: inclui coingecko_id e usa o domínio correto das imagens
const TOP_5: Asset[] = [
  { ticker: 'BTC',  name: 'Bitcoin',  coingecko_id: 'bitcoin',  logo: 'https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png' },
  { ticker: 'ETH',  name: 'Ethereum', coingecko_id: 'ethereum', logo: 'https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png' },
  { ticker: 'SOL',  name: 'Solana',   coingecko_id: 'solana',   logo: 'https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png' },
  { ticker: 'USDT', name: 'Tether',   coingecko_id: 'tether',   logo: 'https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png' },
];

// Injected once — gives the dropdown a crisp slide-in entrance
const DROPDOWN_KEYFRAMES = `
@keyframes asset-dropdown-in {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes asset-shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('asset-selector-kf')) return;
  const style = document.createElement('style');
  style.id = 'asset-selector-kf';
  style.textContent = DROPDOWN_KEYFRAMES;
  document.head.appendChild(style);
}

/* ── Skeleton row while fetching ──────────────────────────── */
function SkeletonRow({ delay }: { delay: number }) {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--border-2) 25%, var(--border) 50%, var(--border-2) 75%)',
    backgroundSize: '200% 100%',
    animation: `asset-shimmer 1.4s ease infinite`,
    animationDelay: `${delay}ms`,
    borderRadius: 4,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px' }}>
      <div style={{ ...shimmer, width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ ...shimmer, height: 10, width: '55%' }} />
        <div style={{ ...shimmer, height: 8,  width: '28%' }} />
      </div>
      <div style={{ ...shimmer, height: 20, width: 36, borderRadius: 6 }} />
    </div>
  );
}

interface AssetSelectorProps {
  onSelectAsset:    (asset: Asset) => void;
  placeholder?:     string;
  disabledTickers?: string[];
}

export default function AssetSelector({
  onSelectAsset,
  placeholder      = 'Buscar ativo…',
  disabledTickers  = [],
}: AssetSelectorProps) {
  const [query,    setQuery]    = useState('');
  const [options,  setOptions]  = useState<Asset[]>(TOP_5);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [focused,  setFocused]  = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const fetchIdRef = useRef(0);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => { injectKeyframes(); }, []);

  // Recalculate dropdown position — portal renders outside any stacking context
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top:   rect.bottom + 5,
      left:  rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (document.getElementById('asset-selector-portal')?.contains(t)) return;
      setOpen(false);
      setFocused(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setOptions(TOP_5);
      setLoading(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setLoading(true);

    searchAssets(debouncedQuery)
      .then((results) => {
        if (id !== fetchIdRef.current) return;
        setOptions(results.slice(0, 5));
      })
      .catch(() => {
        if (id !== fetchIdRef.current) return;
        setOptions([]);
      })
      .finally(() => {
        if (id !== fetchIdRef.current) return;
        setLoading(false);
      });
  }, [debouncedQuery]);

  function openSearch() {
    setSelected(null);
    setQuery('');
    setOptions(TOP_5);
    setOpen(true);
    setFocused(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  function handleSelect(asset: Asset) {
    setSelected(asset);
    setQuery('');
    setOpen(false);
    setFocused(false);
    onSelectAsset(asset);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
  }

  function handleInputFocus() {
    setFocused(true);
    setOpen(true);
  }

  const showTopList = debouncedQuery.length < 1;
  const visibleOptions = options.slice(0, 5);

  /* ── Trigger border / shadow based on state ──────────────── */
  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    height: 42,
    background: 'var(--surface)',
    border: `1.5px solid ${focused || open ? 'var(--blue)' : selected ? 'var(--border)' : 'var(--border)'}`,
    borderRadius: 'var(--r)',
    cursor: selected ? 'default' : 'text',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focused || open
      ? '0 0 0 3px rgba(59,91,219,0.10)'
      : selected
        ? '0 0 0 3px rgba(59,91,219,0.05)'
        : 'none',
  };

  /* ── Dropdown node (rendered via portal) ─────────────────── */
  const dropdown = open ? (
    <div
      id="asset-selector-portal"
      style={{
        ...dropdownStyle,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '0 8px 32px rgba(14,17,23,0.10), 0 2px 8px rgba(14,17,23,0.06)',
        overflow: 'hidden',
        animation: 'asset-dropdown-in 0.14s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 14px 6px',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t4)' }}>
          {showTopList ? 'Populares' : 'Resultados'}
        </span>
        {!loading && !showTopList && (
          <span style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
            {visibleOptions.length} de 5
          </span>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--border-2)', margin: '0 14px' }} />

      {/* Skeleton loading */}
      {loading && (
        <div style={{ padding: '4px 0' }}>
          <SkeletonRow delay={0}   />
          <SkeletonRow delay={80}  />
          <SkeletonRow delay={160} />
        </div>
      )}

      {/* Empty state */}
      {!loading && !showTopList && visibleOptions.length === 0 && (
        <div style={{ padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <MagnifyingGlass size={22} style={{ color: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--t4)', textAlign: 'center', lineHeight: 1.5 }}>
            Nenhum ativo encontrado<br />
            <span style={{ color: 'var(--t3)', fontWeight: 600 }}>"{query}"</span>
          </span>
        </div>
      )}

      {/* Option list */}
      {!loading && (
        <div style={{ padding: '4px 0' }}>
          {visibleOptions.map((asset, idx) => {
            const isDisabled = disabledTickers.includes(asset.ticker);
            const isLast = idx === visibleOptions.length - 1;
            return (
              <button
                key={asset.ticker}
                type="button"
                disabled={isDisabled}
                onMouseDown={isDisabled ? undefined : (e) => { e.preventDefault(); handleSelect(asset); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px',
                  border: 'none',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-2)',
                  background: 'transparent',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.38 : 1,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'background 0.08s',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) e.currentTarget.style.background = 'var(--bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Coin logo with ring */}
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-2)',
                  background: 'var(--bg)',
                  flexShrink: 0,
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src={asset.logo}
                    alt={asset.ticker}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>

                {/* Name + ticker */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {asset.name}
                  </div>
                </div>

                {/* Ticker pill */}
                <div style={{
                  padding: '2px 7px',
                  borderRadius: 5,
                  background: 'var(--bg)',
                  border: '1px solid var(--border-2)',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono), monospace',
                  color: 'var(--t3)',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}>
                  {asset.ticker}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      {showTopList && (
        <div style={{
          padding: '7px 14px',
          borderTop: '1px solid var(--border-2)',
          fontSize: 10,
          color: 'var(--t4)',
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}>
          Digite para buscar qualquer ativo
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={triggerRef} style={{ position: 'relative', width: '100%' }}>

      {/* ── Trigger ─────────────────────────────────────────── */}
      <div style={triggerStyle} onClick={() => { if (!selected) inputRef.current?.focus(); }}>

        {selected ? (
          /* ── Selected chip ──────────────────────────────── */
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              flex: 1, minWidth: 0,
              padding: '4px 8px',
              background: 'var(--bg)',
              border: '1px solid var(--border-2)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
              onClick={openSearch}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '1px solid var(--border-2)',
                background: 'var(--surface)',
                flexShrink: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={selected.logo}
                  alt={selected.ticker}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {selected.name}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono), monospace',
                color: 'var(--blue)', background: 'var(--blue-subtle)',
                padding: '1px 5px', borderRadius: 4, letterSpacing: '0.03em', flexShrink: 0,
              }}>
                {selected.ticker}
              </span>
            </div>

            {/* Clear button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openSearch(); }}
              style={{
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 5,
                cursor: 'pointer',
                color: 'var(--t4)',
                flexShrink: 0,
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--red-subtle)';
                e.currentTarget.style.borderColor = 'var(--red-border)';
                e.currentTarget.style.color = 'var(--red)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--t4)';
              }}
            >
              <X size={11} weight="bold" />
            </button>
          </>
        ) : (
          /* ── Search input ───────────────────────────────── */
          <>
            <MagnifyingGlass
              size={14}
              weight="regular"
              style={{ color: focused ? 'var(--blue)' : 'var(--t4)', flexShrink: 0, transition: 'color 0.15s' }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder={placeholder}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: 'var(--t1)',
                fontFamily: 'inherit',
              }}
            />
            {loading ? (
              <svg style={{ width: 14, height: 14, flexShrink: 0, color: 'var(--t4)', animation: 'spin 0.7s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <CaretUpDown size={13} style={{ color: 'var(--t4)', flexShrink: 0, opacity: open ? 1 : 0.5 }} />
            )}
          </>
        )}
      </div>

      {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}