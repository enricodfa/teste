'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Copy, CheckCircle, Timer, ArrowLeft, AlertCircle, ShieldCheck, CreditCard, Hourglass, Lock, Zap
} from 'lucide-react';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import {
  createPixCheckout,
  createCardCheckout,
  getPlanStatus,
  type PixCheckoutResponse,
  type CardFormData,
} from '../../services/checkoutService';
import { useAuth } from '../../contexts/AuthContext';

/* ── Config ─────────────────────────────────────────────────── */
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? '';
const PIX_EXPIRY_S = 30 * 60;
const POLL_MS = 5_000;

if (typeof window !== 'undefined' && MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
}

/* ── Types ──────────────────────────────────────────────────── */
type Tab = 'pix' | 'card';
type PixStage = 'loading' | 'ready' | 'timeout' | 'error';
type CardStage = 'idle' | 'submitting' | 'pending' | 'rejected' | 'error';
type GlobalStage = 'paying' | 'success';

const MP_REJECTIONS: Record<string, string> = {
  cc_rejected_bad_filled_card_number: 'Número do cartão incorreto. Verifique e tente novamente.',
  cc_rejected_bad_filled_date: 'Data de vencimento inválida.',
  cc_rejected_bad_filled_security_code: 'CVC/CVV incorreto.',
  cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão.',
  cc_rejected_blacklist: 'Cartão bloqueado. Entre em contato com o banco emissor.',
  cc_rejected_call_for_authorize: 'Pagamento não autorizado. Ligue para o banco para liberar.',
  cc_rejected_card_disabled: 'Cartão desativado. Contate o banco emissor.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado. Aguarde alguns minutos.',
  cc_rejected_high_risk: 'Cancelado por anti-fraude. Tente usar o PIX ou verifique seu aplicativo do banco.',
  cc_rejected_invalid_installments: 'Número de parcelas inválido para este cartão.',
  cc_rejected_max_attempts: 'Limite máximo de tentativas.',
  cc_rejected_other_reason: 'Pagamento recusado. Tente com outro método matricial.',
};

function cardErrMsg(detail?: string | null): string {
  if (!detail) return 'Transação negada pela processadora de crédito.';
  return MP_REJECTIONS[detail] ?? `Recusado pelo banco (${detail.replace(/_/g, ' ')}).`;
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const ease = [0.23, 1, 0.32, 1] as const;

/* ── Card Brick ─────────────────────────────────────────────── */
const CARD_CUSTOMIZATION = {
  visual: {
    hideFormTitle: true,
    style: {
      customVariables: {
        textPrimaryColor: '#111827',
        textSecondaryColor: '#6B7280',
        inputBackgroundColor: '#F9FAFB',
        formBackgroundColor: 'transparent',
        baseColor: '#4F46E5',  // Indigo-600
        baseColorFirstVariant: '#4338CA',  // Indigo-700
        baseColorSecondVariant: '#EEF2FF',  // Indigo-50
        errorColor: '#EF4444',  // Red-500
        borderRadiusSmall: '8px',
        borderRadiusMedium: '12px',
      },
    },
  },
  paymentMethods: {
    creditCard: 'all',
    debitCard: 'all',
    maxInstallments: 12,
  },
} as const;

const CardBrick = memo(function CardBrick({ onReady, onError, onSubmit }: {
  onReady: () => void;
  onError: (err: unknown) => void;
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
  const { refreshPlanStatus } = useAuth();

  const [global, setGlobal] = useState<GlobalStage>('paying');
  const [tab, setTab] = useState<Tab>('pix');

  /* PIX */
  const [pixStage, setPixStage] = useState<PixStage>('loading');
  const [pixData, setPixData] = useState<PixCheckoutResponse | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(PIX_EXPIRY_S);
  const [copied, setCopied] = useState(false);

  /* Card */
  const [cardBoot, setCardBoot] = useState(false);
  const [cardRdy, setCardRdy] = useState(false);
  const [cardStage, setCardStage] = useState<CardStage>('idle');
  const [cardError, setCardError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    setGlobal('success');
    try {
      await refreshPlanStatus();
    } catch { }
    setTimeout(() => router.replace('/dashboard'), 2800);
  }, [refreshPlanStatus, router]);

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
      } catch { }
    }, POLL_MS);

    if (expiryMs) {
      timeoutRef.current = setTimeout(() => {
        stopAll();
        onExpired?.();
      }, expiryMs);
    }
  }, [stopAll]);

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
      setPixError(err instanceof Error ? err.message : 'Falha ao assinar transação matriz.');
      setPixStage('error');
    }
  }, [startPixPolling, stopAll]);

  useEffect(() => { generateQR(); return stopAll; }, [generateQR, stopAll]);

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

  const handleCardSubmitLogic = useCallback(async (formData: CardFormData) => {
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
          setCardError('A autorizadora de crédito entrou em fallback. Contate o Suporte.');
      }
    } catch (err) {
      setCardStage('error');
      setCardError(err instanceof Error ? err.message : 'Exceção fatal no roteamento financeiro.');
    }
  }, [stopAll, startStatusPoll, handlePaymentSuccess]);

  const submitRef = useRef(handleCardSubmitLogic);
  useEffect(() => { submitRef.current = handleCardSubmitLogic; }, [handleCardSubmitLogic]);
  const stableSubmit = useCallback((data: CardFormData) => submitRef.current(data), []);

  const handleCardReady = useCallback(() => setCardRdy(true), []);
  const handleCardError = useCallback((err: unknown) => { console.error('[MP CardPayment]', err); }, []);

  const success = global === 'success';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-6 pb-20 px-4 md:px-8 font-sans relative overflow-x-hidden">

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-br from-indigo-50 via-white to-[#F8F9FA] pointer-events-none z-0" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-400/10 blur-3xl rounded-full pointer-events-none z-0" />

      {/* Header Container */}
      <div className="max-w-6xl w-full mx-auto relative z-10 flex items-center justify-between mb-8 md:mb-12">
        <Link href="/" className="flex items-center group">
          <div className="relative transition-transform group-hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Nortfy" 
              width={120} 
              height={38} 
              className="object-contain h-7 w-auto"
              priority
            />
          </div>
        </Link>
        <Link href="/planos" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
          <ArrowLeft size={14} /> Retornar
        </Link>
      </div>

      {/* Main Grid Checkout Layout */}
      {!success ? (
        <div className="max-w-6xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Order Summary (Stacks TOP on mobile) */}
          <div className="order-1 lg:order-none lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/70 backdrop-blur-2xl border border-gray-100 shadow-[0_8px_32px_-8px_rgba(79,70,229,0.06)] rounded-[24px] p-6 sm:p-8">
              <h2 className="text-[16px] font-bold tracking-tight text-gray-900 mb-6 flex items-center gap-2">
                Resumo da Assinatura
              </h2>

              <div className="flex justify-between items-start pb-5 border-b border-gray-100">
                <div>
                  <div className="text-[15px] font-bold text-gray-900 leading-tight">Plano Premium</div>
                  <div className="text-[13px] font-medium text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                    Acesso absoluto ao terminal de rebalanceamentos e analytics.
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[16px] font-bold text-gray-900 tracking-tight">R$ 29,90</div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">/ano</div>
                </div>
              </div>

              <div className="py-5 border-b border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-mono font-bold text-gray-700">R$ 29,90</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500 font-medium">Taxas (0%)</span>
                  <span className="font-mono font-bold text-gray-400">R$ 0,00</span>
                </div>
              </div>

              <div className="pt-5 flex justify-between items-center">
                <span className="text-[14px] font-bold text-gray-900 uppercase tracking-widest">Total</span>
                <span className="font-mono text-[24px] font-black text-indigo-600 tracking-tighter">
                  R$ 29,90
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white/50 backdrop-blur-md border border-gray-100 rounded-[20px] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-900">Checkout 100% Seguro</div>
                  <div className="text-[12px] font-medium text-gray-500 leading-snug">Seus dados blindados com SSL Criptografia 256-bit.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Lock size={16} className="text-indigo-600" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-900">Regulação PCI-DSS</div>
                  <div className="text-[12px] font-medium text-gray-500 leading-snug">Roteamento auditado por MercadoPago Ltda.</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Panel */}
          <div className="order-2 lg:order-none lg:col-span-8">
            <div className="bg-white border border-gray-100 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden min-h-[500px] flex flex-col relative z-20">

              {/* Tab Switcher Headers */}
              {cardStage !== 'pending' && (
                <div className="flex p-2 bg-gray-50/80 border-b border-gray-100">
                  {([
                    { key: 'pix', label: 'Transação PIX', Icon: QrCode },
                    { key: 'card', label: 'Cartão de Crédito', Icon: CreditCard },
                  ] as const).map(({ key, label, Icon }) => {
                    const isActive = tab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => switchTab(key)}
                        className={`flex-1 relative flex items-center justify-center gap-2 py-4 rounded-[16px] text-[14px] font-bold cursor-pointer transition-colors duration-200 z-10 ${isActive ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-900'
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="checkout-tab"
                            className="absolute inset-0 bg-white shadow-sm border border-gray-200 rounded-[16px] -z-10"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon size={16} strokeWidth={2.5} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                        <span className="tracking-tight">{label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Engine Container */}
              <div className="flex-1 p-6 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col items-center">
                
                  {/* ══════════════ PIX ENGINE ══════════════ */}
                  <div style={{ display: tab === 'pix' && cardStage !== 'pending' ? 'block' : 'none', width: '100%' }}>
                    <motion.div
                      key="pix-tab"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
                      className="w-full max-w-[400px] mx-auto flex flex-col items-center"
                    >
                      {/* Loading block */}
                      {pixStage === 'loading' && (
                        <div className="flex flex-col items-center gap-5 w-full py-8 text-center text-gray-500">
                          <div className="w-[200px] h-[200px] rounded-[20px] bg-indigo-50/50 border border-indigo-100 flex items-center justify-center">
                            <QrCode size={48} className="text-indigo-300 animate-pulse" />
                          </div>
                          <span className="text-[14px] font-bold tracking-tight text-gray-400">Sintetizando Chaves Criptográficas...</span>
                        </div>
                      )}

                      {/* Ready (QR Placed) */}
                      {pixStage === 'ready' && pixData && (
                        <div className="flex flex-col items-center w-full gap-5">
                          {/* Top Timer */}
                          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-[12px] font-bold tracking-widest uppercase transition-colors duration-300 ${remaining < 60 ? 'bg-red-50 border-red-200 text-red-600' :
                            remaining < 180 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 border-gray-200 text-gray-500'
                            }`}>
                            <Timer size={14} className={remaining < 60 ? 'animate-pulse' : ''} />
                            Vence em {fmt(remaining)}
                          </div>

                          <div className="p-3 bg-white border border-gray-200 shadow-md rounded-[20px] shrink-0 hover:shadow-lg transition-transform hover:scale-105 duration-300">
                            <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-[220px] h-[220px] rounded-[10px] block" />
                          </div>

                          <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed">
                            Abra o app do seu banco preferido e escaneie a matriz, ou utilize o hash dinâmico abaixo:
                          </p>

                          {/* Copia e Cola */}
                          <div className="w-full mt-2">
                            <div className="flex bg-gray-50 border border-gray-200 rounded-[12px] p-1 shadow-inner h-[50px]">
                              <div className="flex-1 px-3 flex items-center overflow-hidden">
                                <span className="font-mono text-[11px] font-medium text-gray-400 truncate tracking-tighter cursor-text select-all">
                                  {pixData.qr_code}
                                </span>
                              </div>
                              <button onClick={copyCode} className={`h-full px-5 flex items-center gap-1.5 rounded-[8px] text-[13px] font-bold border-none cursor-pointer transition-all shrink-0 ${copied ? 'bg-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]' : 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:text-indigo-600'
                                }`}>
                                {copied ? <><CheckCircle size={15} /> Copiado</> : <><Copy size={15} /> Copiar Restante</>}
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 px-5 py-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[12px] font-bold text-emerald-700 tracking-tight">Ouvindo liquidação em tempo-real...</span>
                          </div>
                        </div>
                      )}

                      {/* Timeout / Error states */}
                      {(pixStage === 'timeout' || pixStage === 'error') && (
                        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center px-4">
                          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                            <AlertCircle size={24} className="text-red-500" />
                          </div>
                          <span className="text-[16px] font-bold text-gray-900 tracking-tight">{pixStage === 'timeout' ? 'Token Expirado' : 'Queda no Roteamento'}</span>
                          <span className="text-[14px] text-gray-500 max-w-[250px] leading-relaxed">
                            {pixStage === 'timeout' ? 'Os tokens Pix de conciliação tem validade de 30m. Pressione o botão para sintetizar novamente.' : pixError}
                          </span>
                          <button onClick={generateQR} className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-full text-[13px] font-bold hover:bg-gray-800 transition-colors">
                            Renovar Ciclo de Cobrança
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* ══════════════ CARD ENGINE ══════════════ */}
                  <div style={{ display: tab === 'card' && cardStage !== 'pending' ? 'block' : 'none', width: '100%' }}>
                    <motion.div
                      key="card-tab"
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                      className="w-full max-w-[400px] mx-auto flex flex-col"
                    >
                      {/* Submitting Glass overlay */}
                      {cardStage === 'submitting' && (
                        <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center rounded-[16px] border border-gray-100">
                          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
                          <span className="text-[14px] font-bold text-gray-900 tracking-tight">Verificando Bin com Emissor...</span>
                        </div>
                      )}

                      {/* Error State above Brick */}
                      {(cardStage === 'rejected' || cardStage === 'error') && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-[12px] flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-red-700 font-bold text-[14px]">
                            <AlertCircle size={15} /> {cardStage === 'rejected' ? 'Adquirência Rejeitada' : 'Falha na Validação'}
                          </div>
                          <p className="text-[13px] text-red-600/90 leading-snug">{cardError}</p>
                          <button onClick={() => { setCardStage('idle'); setCardError(null); }} className="text-left mt-1 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Forçar nova tentativa →
                          </button>
                        </div>
                      )}

                      {/* Brick Loader logic */}
                      {!cardRdy && cardBoot && (
                        <div className="flex flex-col gap-4 opacity-50 p-2">
                          {[45, 45, 45, 45, 45].map((h, i) => (
                            <div key={i} className={`h-[${h}px] bg-gray-100 rounded-[8px] animate-pulse`} />
                          ))}
                        </div>
                      )}

                      {/* MercadoPago Iframe Target */}
                      <div className={`transition-opacity duration-500 ${cardRdy ? 'opacity-100' : 'opacity-0'} [&_.mp-card-payment-form]:p-0`}>
                        {cardBoot && (
                          <CardBrick
                            onReady={handleCardReady}
                            onError={handleCardError}
                            onSubmit={stableSubmit}
                          />
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* ══════════════ PENDING STATE ══════════════ */}
                  <AnimatePresence>
                    {cardStage === 'pending' && (
                      <motion.div
                        key="pending-fallback"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-40 bg-white flex flex-col items-center pt-16 px-6 text-center"
                      >
                        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
                          <Hourglass size={32} className="text-amber-500 animate-bounce" strokeWidth={2} />
                        </div>
                        <h2 className="text-[20px] font-bold text-gray-900 tracking-tight mb-2">Resistência Anti-Fraude</h2>
                        <p className="text-[14px] text-gray-500 leading-relaxed max-w-[320px] mb-8">
                          Seu fluxo entrou na malha de revisão manual da adquirente. Fique tranquilo, estamos sondando o provedor até que a transação caia no extrato.
                        </p>

                        <div className="px-5 py-2.5 rounded-full bg-amber-50 border border-amber-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          <span className="text-[12px] font-bold text-amber-700 tracking-tight">Ouvindo resposta do Banco Central...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* ── GLOBAL SUCCESS COMPONENT ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="max-w-xl w-full mx-auto relative z-20 mt-10 md:mt-20 flex flex-col items-center bg-white/80 backdrop-blur-3xl border border-white rounded-[32px] p-10 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)] text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400 blur-xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-8 border-4 border-white">
              <CheckCircle size={40} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-gray-900 mb-2">Privilégios Elevados!</h1>
          <p className="text-[15px] font-medium text-gray-500 mb-8 max-w-[300px] leading-relaxed">
            Liquidação confirmada na base matricial. Preparando redirecionamento para o seu novo Dashboard Premium.
          </p>
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <span className="text-[13px] font-bold tracking-tight">Configurando terminal...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}