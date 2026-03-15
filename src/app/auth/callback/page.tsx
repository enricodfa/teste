'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { checkPlanAndRedirect } from '../../../services/authService';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    if (!code) {
      router.replace('/login?error=no_code');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login?error=auth_failed');
        return;
      }

      try {
        const { redirect } = await checkPlanAndRedirect();
        router.replace(redirect);
      } catch {
        // Backend unreachable or user has no subscription row yet → go to /planos
        router.replace('/planos');
      }
    });
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--blue)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <div style={{ fontSize: 13.5, color: 'var(--t3)', fontWeight: 500 }}>
        Autenticando…
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
