'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase, Plus, Check, Crown, PencilSimple,
  Trash, CaretUpDown, X, FloppyDisk, Percent,
} from '@phosphor-icons/react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAuth } from '@/contexts/AuthContext';

/* ── Types ──────────────────────────────────────────────────── */
type PanelMode = 'list' | 'create' | 'edit';

/* ── Inline form used for both create and edit ──────────────── */
function PortfolioForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: { name: string; band: string };
  onSubmit: (name: string, band: number) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [name,    setName]    = useState(initial.name);
  const [band,    setBand]    = useState(initial.band);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const valid = name.trim().length > 0 && Number(band) > 0 && Number(band) <= 100;
  const bandNum = Math.max(0, Math.min(100, Number(band) || 0));
  const floor   = Math.max(0,   40 - bandNum);
  const ceiling = Math.min(100, 40 + bandNum);

  async function handleSubmit() {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(name.trim(), Number(band) / 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
      setSaving(false);
    }
  }

  const input: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    fontSize: 13,
    color: 'var(--t1)',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && (
        <div style={{
          padding: '7px 10px',
          background: 'var(--red-subtle)',
          border: '1px solid var(--red-border)',
          borderRadius: 'var(--r)',
          fontSize: 11,
          color: 'var(--red-text)',
        }}>
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--t4)', marginBottom: 5 }}>
          Nome
        </div>
        <input
          autoFocus
          type="text"
          placeholder="Ex: Carteira Principal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') onCancel(); }}
          style={input}
          onFocus={(e)  => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.10)'; }}
          onBlur={(e)   => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Band */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--t4)', marginBottom: 5 }}>
          Banda de tolerância
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number" min={1} max={100} step={1}
            value={band}
            onChange={(e) => setBand(e.target.value)}
            style={{ ...input, paddingRight: 28 }}
            onFocus={(e)  => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.10)'; }}
            onBlur={(e)   => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <Percent size={11} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--t4)', pointerEvents: 'none',
          }} />
        </div>
        {bandNum > 0 && (
          <p style={{ margin: '5px 0 0', fontSize: 10.5, color: 'var(--t4)', lineHeight: 1.5 }}>
            Alvo 40% → livre entre{' '}
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--t2)', fontWeight: 600 }}>{floor}%</span>
            {' '}e{' '}
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--t2)', fontWeight: 600 }}>{ceiling}%</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '7px 0',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600,
            color: 'var(--t3)', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!valid || saving}
          style={{
            flex: 2, padding: '7px 0',
            background: valid && !saving ? 'var(--blue)' : 'var(--border)',
            border: 'none', borderRadius: 'var(--r)',
            fontSize: 12, fontWeight: 700,
            color: valid && !saving ? '#fff' : 'var(--t4)',
            cursor: valid && !saving ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={(e) => { if (valid && !saving) e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <FloppyDisk size={12} weight="bold" />
          {saving ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </div>
  );
}

/* ── Main dropdown panel ────────────────────────────────────── */
export default function PortfolioPanel() {
  const {
    portfolios, activePortfolio, activePortfolioId,
    setActivePortfolioId, canCreateMore, bootstrapping,
    create, update, remove,
  } = usePortfolio();
  const { isPremium } = useAuth();

  const [open,      setOpen]      = useState(false);
  const [mode,      setMode]      = useState<PanelMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setMode('list');
        setEditingId(null);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function closePanel() {
    setOpen(false);
    setMode('list');
    setEditingId(null);
  }

  async function handleCreate(name: string, band: number) {
    await create({ name, tolerance_band: band });
    closePanel();
  }

  async function handleEdit(name: string, band: number) {
    if (!editingId) return;
    await update(editingId, { name, tolerance_band: band });
    setMode('list');
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta carteira? Esta ação não pode ser desfeita.')) return;
    await remove(id);
  }

  /* Skeleton while bootstrapping */
  if (bootstrapping) {
    return (
      <div style={{
        height: 34, width: 148,
        background: 'var(--border-2)',
        borderRadius: 'var(--r)',
        animation: 'shimmer 1.4s ease infinite',
        backgroundSize: '200% 100%',
        backgroundImage: 'linear-gradient(90deg, var(--border-2) 25%, var(--border) 50%, var(--border-2) 75%)',
      }} />
    );
  }

  const editingPortfolio = portfolios.find((p) => p.id === editingId);

  return (
    <div ref={ref} style={{ position: 'relative', marginRight: 120 }}>

      {/* ── Trigger ──────────────────────────────────────────── */}
      <button
        onClick={() => { setOpen((v) => !v); if (open) { setMode('list'); setEditingId(null); } }}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '0 11px', height: 34,
          background: open ? 'var(--bg)' : 'transparent',
          border: `1.5px solid ${open ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 'var(--r)',
          cursor: 'pointer', color: 'var(--t1)',
          fontFamily: 'inherit',
          maxWidth: 200,
          boxShadow: open ? '0 0 0 3px rgba(59,91,219,0.10)' : 'none',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.borderColor = 'var(--t3)'; e.currentTarget.style.background = 'var(--bg)'; } }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; } }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: 5,
          background: 'var(--blue)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Briefcase size={10} weight="fill" style={{ color: '#fff' }} />
        </div>
        <span style={{
          fontSize: 13, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          flex: 1, textAlign: 'left', letterSpacing: '-0.01em',
        }}>
          {activePortfolio?.name ?? 'Carteira'}
        </span>
        <CaretUpDown size={11} style={{
          color: 'var(--t4)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.18s',
        }} />
      </button>

      {/* ── Dropdown ─────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              width: 260,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: '0 12px 40px rgba(14,17,23,0.12), 0 2px 8px rgba(14,17,23,0.06)',
              overflow: 'hidden', zIndex: 200,
            }}
          >

            {/* ── LIST mode ──────────────────────────────────── */}
            {mode === 'list' && (
              <>
                {/* Header label */}
                <div style={{
                  padding: '10px 14px 6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t4)' }}>
                    Carteiras
                  </span>
                  {isPremium && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--blue)',
                      background: 'var(--blue-subtle)', padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      Premium
                    </span>
                  )}
                </div>

                <div style={{ height: 1, background: 'var(--border-2)', margin: '0 14px 4px' }} />

                {/* Portfolio list */}
                {portfolios.map((p) => {
                  const isActive = p.id === activePortfolioId;
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        padding: '2px 8px',
                      }}
                    >
                      {/* Main row button */}
                      <button
                        onClick={() => { setActivePortfolioId(p.id); closePanel(); }}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 6px',
                          background: isActive ? 'var(--blue-subtle)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', textAlign: 'left',
                          borderRadius: 'var(--r)', transition: 'background 0.08s',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg)'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Active dot */}
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          background: isActive ? 'var(--blue)' : 'var(--border)',
                          transition: 'background 0.15s',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--blue)' : 'var(--t1)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            letterSpacing: '-0.01em',
                          }}>
                            {p.name}
                          </div>
                          <div style={{
                            fontSize: 10, color: 'var(--t4)',
                            fontFamily: 'var(--font-mono)', marginTop: 1,
                          }}>
                            ±{Math.round(p.tolerance_band * 100)}% banda
                          </div>
                        </div>
                        {isActive && (
                          <Check size={12} weight="bold" style={{ color: 'var(--blue)', flexShrink: 0 }} />
                        )}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => { setEditingId(p.id); setMode('edit'); }}
                        title="Editar carteira"
                        style={{
                          width: 26, height: 26, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'transparent', border: 'none',
                          borderRadius: 6, cursor: 'pointer',
                          color: 'var(--t4)', transition: 'all 0.1s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--t2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t4)'; }}
                      >
                        <PencilSimple size={12} weight="bold" />
                      </button>

                      {/* Delete button — only if more than 1 portfolio */}
                      {portfolios.length > 1 && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Excluir carteira"
                          style={{
                            width: 26, height: 26, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: 'none',
                            borderRadius: 6, cursor: 'pointer',
                            color: 'var(--t4)', transition: 'all 0.1s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-subtle)'; e.currentTarget.style.color = 'var(--red)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t4)'; }}
                        >
                          <Trash size={12} weight="bold" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Footer */}
                <div style={{ height: 1, background: 'var(--border-2)', margin: '4px 14px 0' }} />
                <div style={{ padding: '4px 8px 8px' }}>
                  {canCreateMore ? (
                    <button
                      onClick={() => setMode('create')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 6px',
                        background: 'transparent', border: 'none',
                        borderRadius: 'var(--r)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'background 0.08s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: '1.5px dashed var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Plus size={10} weight="bold" style={{ color: 'var(--t3)' }} />
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
                        padding: '8px 6px',
                        borderRadius: 'var(--r)',
                        textDecoration: 'none', transition: 'background 0.08s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: 'rgba(245,158,11,0.12)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Crown size={10} weight="duotone" style={{ color: '#f59e0b' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>Assinar Premium</div>
                        <div style={{ fontSize: 10, color: 'var(--t4)' }}>Múltiplas carteiras</div>
                      </div>
                    </a>
                  )}
                </div>
              </>
            )}

            {/* ── CREATE mode ────────────────────────────────── */}
            {mode === 'create' && (
              <>
                <div style={{
                  padding: '10px 14px 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-2)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>Nova Carteira</span>
                  <button
                    onClick={() => setMode('list')}
                    style={{
                      width: 22, height: 22, background: 'transparent', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--t4)', borderRadius: 5,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--t2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t4)'; }}
                  >
                    <X size={12} weight="bold" />
                  </button>
                </div>
                <PortfolioForm
                  initial={{ name: '', band: '15' }}
                  onSubmit={handleCreate}
                  onCancel={() => setMode('list')}
                  submitLabel="Criar"
                />
              </>
            )}

            {/* ── EDIT mode ──────────────────────────────────── */}
            {mode === 'edit' && editingPortfolio && (
              <>
                <div style={{
                  padding: '10px 14px 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-2)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>Editar Carteira</span>
                  <button
                    onClick={() => { setMode('list'); setEditingId(null); }}
                    style={{
                      width: 22, height: 22, background: 'transparent', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--t4)', borderRadius: 5,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--t2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t4)'; }}
                  >
                    <X size={12} weight="bold" />
                  </button>
                </div>
                <PortfolioForm
                  initial={{
                    name: editingPortfolio.name,
                    band: String(Math.round(editingPortfolio.tolerance_band * 100)),
                  }}
                  onSubmit={handleEdit}
                  onCancel={() => { setMode('list'); setEditingId(null); }}
                  submitLabel="Salvar"
                />
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}