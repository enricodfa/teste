'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  Copy,
  CheckCircle,
  Timer,
  ArrowLeft,
  ChartLine,
  Warning,
  ArrowClockwise,
  ArrowSquareOut,
  ShieldCheck,
  CreditCard,
  Hourglass,
} from '@phosphor-icons/react';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import {
  createPixCheckout,
  createCardCheckout,
  getPlanStatus,
  type PixCheckoutResponse,
  type CardFormData,
} from '../../services/checkoutService';
import { useAuth } from '../../contexts/AuthContext'; // ADICIONAR IMPORT

/* ── Config ─────────────────────────────────────────────────── */
const MP_PUBLIC_KEY  = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? '';
const PIX_EXPIRY_S   = 30 * 60;
const POLL_MS        = 5_000;

if (typeof window !== 'undefined' && MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
}

/* ── Types ──────────────────────────────────────────────────── */
type Tab       = 'pix' | 'card';
type PixStage  = 'loading' | 'ready' | 'timeout' | 'error';
type CardStage = 'idle' | 'submitting' | 'pending' | 'rejected' | 'error';

/* ── Shared success stage ───────────────────────────────────── */
type GlobalStage = 'paying' | 'success';

/* ── MP rejection reason translations ──────────────────────── */
const MP_REJECTIONS: Record<string, string> = {
  cc_rejected_bad_filled_card_number: 'Número do cartão incorreto. Verifique e tente novamente.',
  cc_rejected_bad_filled_date:        'Data de vencimento inválida.',
  cc_rejected_bad_filled_security_code: 'CVV incorreto.',
  cc_rejected_insufficient_amount:    'Saldo insuficiente no cartão.',
  cc_rejected_blacklist:              'Cartão bloqueado. Entre em contato com o banco emissor.',
  cc_rejected_call_for_authorize:     'Pagamento não autorizado. Ligue para o banco para liberar.',
  cc_rejected_card_disabled:          'Cartão desativado. Contate o banco emissor.',
  cc_rejected_duplicated_payment:     'Pagamento duplicado detectado. Aguarde alguns minutos.',
  cc_rejected_high_risk:              'Pagamento recusado por análise de risco.',
  cc_rejected_invalid_installments:   'Número de parcelas inválido para este cartão.',
  cc_rejected_max_attempts:           'Limite de tentativas atingido. Tente novamente em 24h.',
  cc_rejected_other_reason:           'Pagamento recusado. Tente com outro cartão.',
};

function cardErrMsg(detail?: string | null): string {
  if (!detail) return 'Pagamento recusado. Tente com outro cartão ou entre em contato com o banco.';
  return MP_REJECTIONS[detail] ?? `Recusado pelo banco (${detail.replace(/_/g, ' ')}).`;
}

/* ── Utils ──────────────────────────────────────────────────── */
function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/* ── Sub-components ─────────────────────────────────────────── */
function Spinner({ size = 14 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--blue)',
      borderRadius: '50%',
      animation: 'ck-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function Steps({ success }: { success: boolean }) {
  const labels  = ['Plano', 'Pagamento', 'Confirmação'];
  const current = success ? 3 : 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {labels.map((label, i) => {
        const n       = i + 1;
        const passed  = n < current;
        const active  = n === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: passed || active ? 'var(--blue)' : 'var(--surface)',
                border: passed || active ? 'none' : '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: passed || active ? 'white' : 'var(--t4)',
                transition: 'all 0.25s',
              }}>
                {passed ? <CheckCircle size={14} weight="fill" /> : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, color: active ? 'var(--t1)' : 'var(--t4)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ width: 48, height: 1.5, marginBottom: 18, marginLeft: 4, marginRight: 4, background: passed ? 'var(--blue)' : 'var(--border-2)', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Card Brick (memoized to prevent re-init on every render) ── */
const CARD_CUSTOMIZATION = {
  visual: {
    hideFormTitle: true,
    style: {
      customVariables: {
        textPrimaryColor:       '#0E1117',
        textSecondaryColor:     '#6B7280',
        inputBackgroundColor:   '#F4F6FA',
        formBackgroundColor:    '#FFFFFF',
        baseColor:              '#3B5BDB',
        baseColorFirstVariant:  '#2F4AC8',
        baseColorSecondVariant: '#EEF2FF',
        errorColor:             '#DC2626',
        borderRadiusSmall:      '6px',
        borderRadiusMedium:     '8px',
      },
    },
  },
  paymentMethods: {
    creditCard:      'all',
    debitCard:       'all',
    maxInstallments: 12,
  },
} as const;

const CardBrick = memo(function CardBrick({ onReady, onError, onSubmit }: {
  onReady:  () => void;
  onError:  (err: unknown) => void;
  onSubmit: (formData: CardFormData) => Promise<void>;
}) {
  return (
    <CardPayment
      initialization={{ amount: 29.90 }}
      customization={CARD_CUSTOMIZATION}
      onReady={onReady}
      onError={onError}
      onSubmit={onSubmit}
    />
  );
});

/* ── Page ───────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const { refreshPlanStatus } = useAuth(); // ADICIONAR HOOK

  /* Global */
  const [global,    setGlobal]    = useState<GlobalStage>('paying');

  /* Tab */
  const [tab,       setTab]       = useState<Tab>('pix');

  /* PIX */
  const [pixStage,  setPixStage]  = useState<PixStage>('loading');
  const [pixData,   setPixData]   = useState<PixCheckoutResponse | null>(null);
  const [pixError,  setPixError]  = useState<string | null>(null);
  const [remaining, setRemaining] = useState(PIX_EXPIRY_S);
  const [copied,    setCopied]    = useState(false);

  /* Card */
  const [cardBoot,  setCardBoot]  = useState(false);
  const [cardRdy,   setCardRdy]   = useState(false);
  const [cardStage, setCardStage] = useState<CardStage>('idle');
  const [cardError, setCardError] = useState<string | null>(null);

  /* Polling refs (shared for pix & card pending) */
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const stopAll = useCallback(() => {
    if (pollRef.current)    clearInterval(pollRef.current);
    if (timerRef.current)   clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  /** Função para lidar com sucesso do pagamento */
  const handlePaymentSuccess = useCallback(async () => {
    setGlobal('success');
    await refreshPlanStatus(); // Atualiza o contexto antes de redirecionar
    setTimeout(() => router.replace('/dashboard'), 2800);
  }, [refreshPlanStatus, router]);

  /** Generic status poller — calls onActive when plan becomes active */
  const startStatusPoll = useCallback((
    onActive: () => void,
    expiryMs?: number,
    onExpired?: () => void,
  ) => {
    pollRef.current = setInterval(async () => {
      try {
        const s = await getPlanStatus();
        if (s.status === 'active' && s.is_premium) {
          stopAll();
          onActive();
        }
      } catch { /* ignore transient errors */ }
    }, POLL_MS);

    if (expiryMs) {
      timeoutRef.current = setTimeout(() => {
        stopAll();
        onExpired?.();
      }, expiryMs);
    }
  }, [stopAll]);

  /** PIX: start countdown + status poll */
  const startPixPolling = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { stopAll(); setPixStage('timeout'); return 0; }
        return r - 1;
      });
    }, 1000);

    startStatusPoll(
      handlePaymentSuccess,
      PIX_EXPIRY_S * 1000,
      () => setPixStage('timeout'),
    );
  }, [startStatusPoll, stopAll, handlePaymentSuccess]);

  const generateQR = useCallback(async () => {
    setPixStage('loading');
    setPixError(null);
    setRemaining(PIX_EXPIRY_S);
    stopAll();
    try {
      const res = await createPixCheckout();
      setPixData(res);
      setPixStage('ready');
      startPixPolling();
    } catch (err) {
      setPixError(err instanceof Error ? err.message : 'Erro desconhecido.');
      setPixStage('error');
    }
  }, [startPixPolling, stopAll]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generateQR(); return stopAll; }, []);

  function switchTab(t: Tab) {
    setTab(t);
    if (t === 'card' && !cardBoot) setCardBoot(true);
  }

  function copyCode() {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  /** Card payment — handles all response states correctly */
  const handleCardSubmit = useCallback(async (formData: CardFormData) => {
    setCardStage('submitting');
    setCardError(null);
    stopAll();
    try {
      const res = await createCardCheckout(formData);

      switch (res.status) {
        case 'approved':
          await handlePaymentSuccess();
          break;

        case 'pending':
        case 'in_process':
          setCardStage('pending');
          startStatusPoll(handlePaymentSuccess);
          break;

        case 'rejected':
          setCardStage('rejected');
          setCardError(cardErrMsg(res.status_detail));
          break;

        default:
          setCardStage('error');
          setCardError('Status de pagamento desconhecido. Entre em contato com o suporte.');
      }
    } catch (err) {
      setCardStage('error');
      setCardError(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
    }
  }, [stopAll, startStatusPoll, handlePaymentSuccess]);

  const handleCardReady  = useCallback(() => setCardRdy(true), []);
  const handleCardError  = useCallback((err: unknown) => { console.error('[MP CardPayment]', err); }, []);

  const timerColor =
    pixStage === 'timeout' ? 'var(--red-text)' :
    remaining < 120        ? 'var(--amber)'    :
    'var(--t4)';

  const success = global === 'success';

  /* ── Render ── */
  return (
    <>
      <style>{`
        @keyframes ck-pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes ck-spin   { to{transform:rotate(360deg)} }
        @keyframes ck-fadein { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ck-pop    { 0%{transform:scale(.75);opacity:0} 65%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px 80px' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChartLine size={17} weight="bold" color="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Portfolio Manager</span>
        </Link>

        <Steps success={success} />

        {/* ── Card container ── */}
        <div className="card" style={{ width: '100%', maxWidth: 460, padding: 0, overflow: 'hidden' }}>

          {/* Header */}
          {!success && (
            <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Pagamento</div>
                <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 1 }}>
                  Plano Premium · <strong style={{ color: 'var(--t2)' }}>R$ 29,90/mês</strong>
                </div>
              </div>
              {/* Timer only for Pix */}
              {tab === 'pix' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: timerColor, fontFamily: 'var(--font-mono), monospace', transition: 'color 0.3s' }}>
                  <Timer size={14}
                    weight={remaining < 120 && pixStage === 'ready' ? 'fill' : 'regular'}
                    style={{ animation: remaining < 60 && pixStage === 'ready' ? 'ck-pulse 0.9s ease-in-out infinite' : 'none' }}
                  />
                  {pixStage === 'loading' || pixStage === 'error' ? '--:--' : pixStage === 'timeout' ? 'Expirado' : fmt(remaining)}
                </div>
              )}
            </div>
          )}

          {/* Tab bar */}
          {!success && cardStage !== 'pending' && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-2)' }}>
              {([
                { key: 'pix',  label: 'Pix',   Icon: QrCode     },
                { key: 'card', label: 'Cartão', Icon: CreditCard },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '13px 0',
                    background: 'transparent', border: 'none',
                    borderBottom: tab === key ? '2px solid var(--blue)' : '2px solid transparent',
                    color: tab === key ? 'var(--blue)' : 'var(--t3)',
                    fontSize: 13, fontWeight: tab === key ? 600 : 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    marginBottom: -1,
                  }}
                >
                  <Icon size={14} weight={tab === key ? 'fill' : 'regular'} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* ── SUCCESS (shared between pix and card) ── */}
            {success && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 0', animation: 'ck-fadein 0.3s ease' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--green-subtle)', border: '2px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ck-pop 0.45s ease' }}>
                  <CheckCircle size={36} weight="fill" style={{ color: 'var(--green)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>Pagamento confirmado!</div>
                  <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>
                    Sua conta Premium foi ativada com sucesso.<br />Redirecionando para o dashboard…
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
                  <Spinner />
                  <span style={{ fontSize: 12, color: 'var(--t4)' }}>Redirecionando…</span>
                </div>
              </div>
            )}

            {/* ══════════════ PIX TAB ══════════════ */}
            {!success && tab === 'pix' && (
              <>
                {/* Loading skeleton */}
                {pixStage === 'loading' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '16px 0', width: '100%', animation: 'ck-fadein 0.25s ease' }}>
                    <div style={{ width: 204, height: 204, background: 'var(--bg-subtle)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={52} style={{ color: 'var(--border)', animation: 'ck-pulse 1.4s ease-in-out infinite' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--t3)', fontSize: 13 }}>
                      <Spinner /> Gerando QR Code…
                    </div>
                    {[82, 100, 72].map((w, i) => (
                      <div key={i} style={{ width: `${w}%`, height: 10, background: 'var(--border-2)', borderRadius: 99, animation: 'ck-pulse 1.6s ease-in-out infinite', animationDelay: `${i * 0.14}s` }} />
                    ))}
                  </div>
                )}

                {/* QR ready */}
                {pixStage === 'ready' && pixData && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: 'ck-fadein 0.3s ease' }}>
                    <div style={{ padding: 12, background: 'white', borderRadius: 'var(--r)', border: '1px solid var(--border)', boxShadow: 'var(--s1)' }}>
                      <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" width={200} height={200} style={{ display: 'block', borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                      Abra o app do seu banco, escolha <strong style={{ color: 'var(--t2)', fontWeight: 600 }}>Pix</strong> e escaneie o QR Code ou copie o código abaixo.
                    </p>

                    {/* Copy/paste */}
                    <div style={{ width: '100%' }}>
                      <div className="label" style={{ marginBottom: 6 }}>Pix Copia e Cola</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'all', cursor: 'text' }}>
                          {pixData.qr_code}
                        </div>
                        <button
                          onClick={copyCode}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', background: copied ? 'var(--green-subtle)' : 'var(--surface)', border: `1px solid ${copied ? 'var(--green-border)' : 'var(--border)'}`, borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, color: copied ? 'var(--green-text)' : 'var(--t2)', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {copied ? <><CheckCircle size={13} weight="fill" />Copiado!</> : <><Copy size={13} />Copiar</>}
                        </button>
                      </div>
                    </div>

                    <a href={pixData.ticket_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 500, color: 'var(--t4)', textDecoration: 'none', transition: 'color 0.12s' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t2)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t4)'; }}>
                      <ArrowSquareOut size={13} /> Abrir no Mercado Pago
                    </a>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'var(--blue-subtle)', border: '1px solid rgba(59,91,219,0.15)', borderRadius: 99, fontSize: 12, fontWeight: 500, color: 'var(--blue-text)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, animation: 'ck-pulse 1.6s ease-in-out infinite' }} />
                      Aguardando confirmação do pagamento…
                    </div>
                  </div>
                )}

                {/* Timeout */}
                {pixStage === 'timeout' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0', animation: 'ck-fadein 0.3s ease' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--amber-subtle)', border: '1.5px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Timer size={28} weight="fill" style={{ color: 'var(--amber)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>QR Code expirado</div>
                      <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>O código Pix expira em 30 minutos por segurança.<br />Gere um novo para continuar.</div>
                    </div>
                    <button onClick={generateQR} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'var(--blue)', border: 'none', borderRadius: 'var(--r)', fontSize: 13.5, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.12s' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
                      <ArrowClockwise size={14} weight="bold" /> Gerar novo QR Code
                    </button>
                  </div>
                )}

                {/* Error */}
                {pixStage === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0', animation: 'ck-fadein 0.3s ease' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--red-subtle)', border: '1.5px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Warning size={28} weight="fill" style={{ color: 'var(--red)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Falha ao gerar QR Code</div>
                      {pixError && <div style={{ fontSize: 11.5, color: 'var(--t4)', fontFamily: 'var(--font-mono), monospace', background: 'var(--bg-subtle)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-sm)', padding: '8px 12px', marginTop: 6, wordBreak: 'break-all' }}>{pixError}</div>}
                    </div>
                    <button onClick={generateQR} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'var(--blue)', border: 'none', borderRadius: 'var(--r)', fontSize: 13.5, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.12s' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
                      <ArrowClockwise size={14} weight="bold" /> Tentar novamente
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ══════════════ CARD TAB ══════════════ */}
            {cardBoot && !success && (
              <div style={{ display: tab === 'card' ? 'block' : 'none', width: '100%' }}>

                {/* ── Pending state (payment under anti-fraud review) ── */}
                {cardStage === 'pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', animation: 'ck-fadein 0.3s ease' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--amber-subtle)', border: '1.5px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Hourglass size={30} weight="fill" style={{ color: 'var(--amber)', animation: 'ck-pulse 2s ease-in-out infinite' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>Pagamento em análise</div>
                      <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.65, maxWidth: 300 }}>
                        Seu pagamento está sendo revisado pelo banco.<br />
                        Isso pode levar alguns minutos. Você pode fechar esta página — vamos notificar quando confirmar.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(217,119,6,0.08)', border: '1px solid var(--amber-border)', borderRadius: 99, fontSize: 12, fontWeight: 500, color: 'var(--amber-text)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0, animation: 'ck-pulse 1.6s ease-in-out infinite' }} />
                      Verificando confirmação do pagamento…
                    </div>
                    <button onClick={() => router.replace('/dashboard')} style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.12s' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)'; }}>
                      Ir para o dashboard enquanto aguardo
                    </button>
                  </div>
                )}

                {/* ── Form area (idle / submitting / rejected / error) ── */}
                <div style={{ display: cardStage !== 'pending' ? 'block' : 'none' }}>

                  {/* Rejection / error banner — shown above the form */}
                  {(cardStage === 'rejected' || cardStage === 'error') && (
                    <div style={{ marginBottom: 20, animation: 'ck-fadein 0.2s ease' }}>
                      <div style={{ padding: '12px 14px', background: 'var(--red-subtle)', border: '1px solid var(--red-border)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <Warning size={15} weight="fill" style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red-text)', marginBottom: 2 }}>
                            {cardStage === 'rejected' ? 'Pagamento recusado' : 'Erro no pagamento'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--red-text)', opacity: 0.85, lineHeight: 1.45 }}>
                            {cardError ?? 'Verifique os dados do cartão e tente novamente.'}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { setCardStage('idle'); setCardError(null); }} style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Tentar com outro cartão →
                      </button>
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>

                    {/* Submitting overlay */}
                    {cardStage === 'submitting' && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 'var(--r)' }}>
                        <Spinner size={20} />
                        <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 500 }}>Processando pagamento…</span>
                      </div>
                    )}

                    {/* Skeleton shown while brick initializes */}
                    {!cardRdy && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[20, 44, 44, 44, 44, 44].map((h, i) => (
                          <div key={i} style={{ width: i === 2 ? '60%' : '100%', height: h, background: 'var(--bg-subtle)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', animation: 'ck-pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}

                    {/* The brick itself */}
                    <div style={{ display: cardRdy ? 'block' : 'none' }}>
                      <CardBrick
                        onReady={handleCardReady}
                        onError={handleCardError}
                        onSubmit={handleCardSubmit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div style={{ padding: '12px 28px', borderTop: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--t4)' }}>
              <ShieldCheck size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
              <span>Pagamento seguro processado por</span>
              <span style={{ fontWeight: 700, color: 'var(--t3)' }}>Mercado Pago</span>
            </div>
          )}
        </div>

        {/* Back */}
        {!success && cardStage !== 'pending' && (
          <Link href="/planos" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 28, fontSize: 13, color: 'var(--t4)', textDecoration: 'none', transition: 'color 0.12s' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t2)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t4)'; }}>
            <ArrowLeft size={13} /> Voltar para planos
          </Link>
        )}
      </div>
    </>
  );
}