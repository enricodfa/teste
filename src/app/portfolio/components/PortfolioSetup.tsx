'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, ArrowRight, Check, CheckCircle, Warning, CaretDown } from '@phosphor-icons/react';
import { CryptoIcon } from '../../../components/icons/CryptoIcons';
import type { Portfolio } from '../mockData';
import { AVAILABLE_ASSETS, getAssetById } from '../mockData';

interface TargetItem { id: string; assetId: string; targetPct: number }

/* ── Dropdown ─────────────────────────────────────────────── */
function AssetDropdown({ value, onChange, usedIds }: {
  value: string; onChange: (id: string) => void; usedIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const asset = getAssetById(value);

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '8px 12px',
          background: 'var(--surface)',
          border: `1px solid ${open ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 'var(--r)',
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: open ? '0 0 0 3px rgba(59,91,219,0.1)' : 'none',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {asset ? (
            <>
              <CryptoIcon ticker={asset.ticker} size={20} />
              <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{asset.ticker}</span>
              <span style={{ fontSize: 12, color: 'var(--t4)' }}>{asset.name}</span>
            </>
          ) : (
            <span style={{ color: 'var(--t4)' }}>Selecionar ativo</span>
          )}
        </span>
        <CaretDown size={13} style={{
          color: 'var(--t4)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.18s',
        }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                boxShadow: 'var(--s2)',
                overflow: 'hidden',
                transformOrigin: 'top',
              }}
            >
              {AVAILABLE_ASSETS.map((a) => {
                const disabled = usedIds.includes(a.id) && a.id !== value;
                const active = a.id === value;
                return (
                  <button
                    key={a.id} type="button" disabled={disabled}
                    onClick={() => { onChange(a.id); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px',
                      border: 'none', borderBottom: '1px solid var(--border-2)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      background: active ? 'var(--blue-subtle)' : 'transparent',
                      opacity: disabled ? 0.4 : 1,
                      fontFamily: 'inherit',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = active ? 'var(--blue-subtle)' : 'transparent'; }}
                  >
                    <CryptoIcon ticker={a.ticker} size={24} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--blue)' : 'var(--t1)', width: 44 }}>{a.ticker}</span>
                    <span style={{ fontSize: 12, color: 'var(--t3)', flex: 1, textAlign: 'left' }}>{a.name}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--t4)' }}>
                      ${a.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    {active && <Check size={13} style={{ color: 'var(--blue)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function PortfolioSetup({ onComplete, onLoadMock }: {
  onComplete: (p: Portfolio) => void;
  onLoadMock: () => void;
}) {
  const [step, setStep] = useState<'targets' | 'quantities'>('targets');
  const [band, setBand] = useState(5);
  const [targets, setTargets] = useState<TargetItem[]>([
    { id: '1', assetId: 'btc',  targetPct: 50 },
    { id: '2', assetId: 'eth',  targetPct: 25 },
    { id: '3', assetId: 'sui',  targetPct: 15 },
    { id: '4', assetId: 'avax', targetPct: 10 },
  ]);
  const [quantities, setQuantities] = useState<{ assetId: string; quantity: string }[]>([]);

  const totalPct = targets.reduce((s, t) => s + (t.targetPct || 0), 0);
  const targetsOk = Math.abs(totalPct - 100) < 0.01 && targets.every((t) => t.assetId && t.targetPct > 0);
  const usedIds = targets.map((t) => t.assetId);

  const goNext = () => {
    setQuantities(targets.map((t) => ({ assetId: t.assetId, quantity: '' })));
    setStep('quantities');
  };

  const qtysOk = quantities.every((q) => q.quantity && parseFloat(q.quantity) > 0);

  const handleComplete = () => {
    onComplete({
      toleranceBand: band,
      items: targets.map((t) => ({
        assetId: t.assetId, targetPct: t.targetPct,
        quantity: parseFloat(quantities.find((q) => q.assetId === t.assetId)?.quantity || '0') || 0,
      })),
    });
  };

  /* ── STEP INDICATOR ── */
  const StepDot = ({ n, label, done, active }: { n: number; label: string; done: boolean; active: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? 'var(--green)' : active ? 'var(--blue)' : 'var(--border)',
        fontSize: 11, fontWeight: 700,
        color: done || active ? 'white' : 'var(--t4)',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        {done ? <Check size={12} weight="bold" /> : n}
      </div>
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: active ? 'var(--t1)' : done ? 'var(--t3)' : 'var(--t4)',
      }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Steps bar */}
      <div className="card" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', marginBottom: 24,
      }}>
        <StepDot n={1} label="Alocação Alvo" active={step === 'targets'} done={step === 'quantities'} />
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <StepDot n={2} label="Quantidades" active={step === 'quantities'} done={false} />
      </div>

      <AnimatePresence mode="wait">
        {/* ─ Step 1 ─ */}
        {step === 'targets' && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
          >
            {/* Tolerance band */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Banda de Tolerância</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                    Desvio máximo permitido antes de acionar sinal
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[3, 5, 10].map((v) => (
                    <button
                      key={v} type="button" onClick={() => setBand(v)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--r-sm)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: band === v ? 'var(--blue)' : 'var(--bg)',
                        border: `1px solid ${band === v ? 'var(--blue)' : 'var(--border)'}`,
                        color: band === v ? 'white' : 'var(--t3)',
                        transition: 'all 0.15s', fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Asset rows */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Ativos</span>
                <span className="label">{targets.length} / {AVAILABLE_ASSETS.length}</span>
              </div>

              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {targets.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <AssetDropdown
                      value={t.assetId}
                      onChange={(id) => setTargets(targets.map((x) => x.id === t.id ? { ...x, assetId: id } : x))}
                      usedIds={usedIds}
                    />
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: '1px solid var(--border)', borderRadius: 'var(--r)',
                      background: 'var(--surface)', overflow: 'hidden', flexShrink: 0,
                    }}>
                      <input
                        type="number" min={0} max={100}
                        value={t.targetPct || ''}
                        onChange={(e) => setTargets(targets.map((x) => x.id === t.id ? { ...x, targetPct: parseFloat(e.target.value) || 0 } : x))}
                        placeholder="0"
                        style={{
                          width: 52, padding: '8px 4px 8px 10px',
                          border: 'none', outline: 'none',
                          fontSize: 13, fontWeight: 600, textAlign: 'right',
                          color: 'var(--blue)', background: 'transparent',
                          fontFamily: 'var(--font-mono)',
                        }}
                        onFocus={(e) => { e.currentTarget.parentElement!.style.borderColor = 'var(--blue)'; }}
                        onBlur={(e) => { e.currentTarget.parentElement!.style.borderColor = 'var(--border)'; }}
                      />
                      <span style={{ paddingRight: 10, fontSize: 12, color: 'var(--t4)', fontWeight: 600 }}>%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTargets(targets.filter((x) => x.id !== t.id))}
                      style={{
                        width: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                        background: 'transparent', cursor: 'pointer', color: 'var(--t4)',
                        transition: 'all 0.12s', flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-subtle)'; e.currentTarget.style.borderColor = 'var(--red-border)'; e.currentTarget.style.color = 'var(--red)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t4)'; }}
                    >
                      <Trash size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {targets.length < AVAILABLE_ASSETS.length && (
                <div style={{ padding: '0 14px 12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const free = AVAILABLE_ASSETS.find((a) => !usedIds.includes(a.id));
                      if (free) setTargets([...targets, { id: Date.now().toString(), assetId: free.id, targetPct: 0 }]);
                    }}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 'var(--r)',
                      border: '1px dashed var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: 12, fontWeight: 600, color: 'var(--t4)',
                      background: 'transparent', cursor: 'pointer',
                      transition: 'all 0.12s', fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.background = 'var(--blue-subtle)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t4)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Plus size={13} />
                    Adicionar ativo
                  </button>
                </div>
              )}
            </div>

            {/* Total status */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', marginBottom: 14, borderRadius: 'var(--r)',
              background: targetsOk ? 'var(--green-subtle)' : Math.abs(totalPct - 100) < 10 ? 'var(--amber-subtle)' : 'var(--red-subtle)',
              border: `1px solid ${targetsOk ? 'var(--green-border)' : Math.abs(totalPct - 100) < 10 ? 'var(--amber-border)' : 'var(--red-border)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {targetsOk
                  ? <CheckCircle size={14} weight="fill" style={{ color: 'var(--green)' }} />
                  : <Warning size={14} style={{ color: Math.abs(totalPct - 100) < 10 ? 'var(--amber)' : 'var(--red)' }} />
                }
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t2)' }}>
                  {targetsOk
                    ? 'Alocação completa'
                    : `Faltam ${(100 - totalPct).toFixed(0)}% para completar`}
                </span>
              </div>
              <span className="mono" style={{
                fontSize: 16, fontWeight: 800,
                color: targetsOk ? 'var(--green-text)' : Math.abs(totalPct - 100) < 10 ? 'var(--amber-text)' : 'var(--red-text)',
              }}>
                {totalPct.toFixed(0)}%
              </span>
            </div>

            <button
              type="button" onClick={targetsOk ? goNext : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px', borderRadius: 'var(--r)',
                border: 'none', cursor: targetsOk ? 'pointer' : 'not-allowed',
                background: targetsOk ? 'var(--blue)' : 'var(--border)',
                color: targetsOk ? 'white' : 'var(--t4)',
                fontSize: 14, fontWeight: 600,
                transition: 'background 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (targetsOk) e.currentTarget.style.background = 'var(--blue-hover)'; }}
              onMouseLeave={(e) => { if (targetsOk) e.currentTarget.style.background = 'var(--blue)'; }}
            >
              Próximo: Quantidades
              <ArrowRight size={15} weight="bold" />
            </button>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                type="button" onClick={onLoadMock}
                style={{
                  fontSize: 12, color: 'var(--t4)', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  fontFamily: 'inherit', transition: 'color 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--blue)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t4)'; }}
              >
                Carregar carteira de demonstração
              </button>
            </div>
          </motion.div>
        )}

        {/* ─ Step 2 ─ */}
        {step === 'quantities' && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
          >
            <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Suas posições atuais</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Informe a quantidade de cada ativo que você possui</div>
              </div>

              {targets.map((t, i) => {
                const asset = getAssetById(t.assetId);
                if (!asset) return null;
                const qty = quantities.find((q) => q.assetId === t.assetId);
                const qtyNum = parseFloat(qty?.quantity || '0') || 0;

                return (
                  <motion.div
                    key={t.assetId}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 20px',
                      borderBottom: i < targets.length - 1 ? '1px solid var(--border-2)' : 'none',
                    }}
                  >
                    <CryptoIcon ticker={asset.ticker} size={34} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{asset.ticker}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 99,
                          background: 'var(--blue-subtle)', color: 'var(--blue-text)',
                        }}>
                          Alvo {t.targetPct}%
                        </span>
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>
                        ${asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })} por unidade
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <input
                        type="number" min={0}
                        value={qty?.quantity || ''}
                        onChange={(e) => setQuantities(quantities.map((q) => q.assetId === t.assetId ? { ...q, quantity: e.target.value } : q))}
                        placeholder="0.00"
                        style={{
                          width: 110, padding: '7px 12px', textAlign: 'right',
                          border: '1px solid var(--border)', borderRadius: 'var(--r)',
                          fontSize: 13, fontWeight: 600, color: 'var(--t1)',
                          background: 'var(--surface)', outline: 'none',
                          fontFamily: 'var(--font-mono)', transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                      {qtyNum > 0 && (
                        <span className="mono" style={{ fontSize: 10, color: 'var(--t4)' }}>
                          ≈ ${(qtyNum * asset.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button" onClick={() => setStep('targets')}
                style={{
                  padding: '11px 20px', borderRadius: 'var(--r)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: 14, fontWeight: 600, color: 'var(--t2)',
                  cursor: 'pointer', transition: 'background 0.12s', fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
              >
                Voltar
              </button>
              <button
                type="button" onClick={qtysOk ? handleComplete : undefined}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px', borderRadius: 'var(--r)',
                  border: 'none', cursor: qtysOk ? 'pointer' : 'not-allowed',
                  background: qtysOk ? 'var(--blue)' : 'var(--border)',
                  color: qtysOk ? 'white' : 'var(--t4)',
                  fontSize: 14, fontWeight: 600,
                  transition: 'background 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { if (qtysOk) e.currentTarget.style.background = 'var(--blue-hover)'; }}
                onMouseLeave={(e) => { if (qtysOk) e.currentTarget.style.background = 'var(--blue)'; }}
              >
                <Check size={15} weight="bold" />
                Confirmar Carteira
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
