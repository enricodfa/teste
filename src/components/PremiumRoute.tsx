'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrapper for pages that require an active Premium subscription.
 * Redirects free users to /dashboard rather than showing a 404 or error.
 */
export default function PremiumRoute({ children }: { children: React.ReactNode }) {
  const { isPremium, loading, planLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !planLoading && !isPremium) {
      router.replace('/dashboard');
    }
  }, [isPremium, loading, planLoading, router]);

  if (loading || planLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--t4)' }}>Verificando acesso…</div>
      </div>
    );
  }

  if (!isPremium) return null;

  return <>{children}</>;
}
