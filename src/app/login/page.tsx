'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative bg-gradient-to-br from-[#121212] to-[#1a1a2e] flex-col justify-between p-10 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Activity className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[20px] font-extrabold tracking-tight text-white">Nortfy</span>
          </Link>
        </div>

        {/* Central copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Seu portfólio no piloto automático.
          </h2>
          <p className="text-[15px] text-white/50 leading-relaxed max-w-sm">
            Rebalanceamento inteligente que compra na baixa e vende na alta — sem emoção, sem FOMO, apenas estratégia.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/30">
              <Lock className="w-4 h-4" />
              <span className="text-[12px] font-medium">Conexão segura</span>
            </div>
            <div className="flex items-center gap-2 text-white/30">
              <Shield className="w-4 h-4" />
              <span className="text-[12px] font-medium">Dados criptografados</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} Nortfy. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 bg-[#F8F9FA] relative">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight text-[#121212]">Nortfy</span>
          </Link>
        </div>

        {/* Back to home */}
        <div className="absolute top-6 right-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-[#121212] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[380px]"
        >
          <div className="text-center mb-10">
            <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#121212] tracking-tight mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-[15px] text-gray-500">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-[#121212] hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <GoogleIcon />
              {loading ? 'Carregando...' : 'Continuar com Google'}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-[12px] text-gray-400 leading-relaxed">
                Ao entrar, você concorda com os{' '}
                <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a>
                {' '}e a{' '}
                <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>.
              </p>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-8 text-center">
            <p className="text-[13px] text-gray-400">
              Ainda não conhece a Nortfy?{' '}
              <Link href="/" className="text-indigo-600 font-medium hover:underline">
                Saiba mais
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Mobile disclaimer */}
        <p className="lg:hidden absolute bottom-6 text-[11px] text-gray-300">
          Não constitui recomendação de investimento.
        </p>
      </div>
    </div>
  );
}
