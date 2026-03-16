'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  listPortfolios,
  findOrCreatePortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '@/services/portfolioService';
import type { Portfolio, CreatePortfolioPayload, UpdatePortfolioPayload } from '@/services/portfolioService';

/* ── Types ──────────────────────────────────────────────────── */
interface PortfolioContextValue {
  // State
  portfolios:        Portfolio[];
  activePortfolio:   Portfolio | null;
  activePortfolioId: string | null;
  loading:           boolean;
  /** True only on the very first load (no portfolios array yet) */
  bootstrapping:     boolean;
  error:             string | null;

  // Navigation
  setActivePortfolioId: (id: string) => void;

  // CRUD — each returns the affected portfolio so UI can update optimistically
  create: (payload?: CreatePortfolioPayload) => Promise<Portfolio>;
  update: (id: string, payload: UpdatePortfolioPayload) => Promise<Portfolio>;
  remove: (id: string) => Promise<void>;

  /** Re-fetches portfolio list from the server */
  refresh: () => Promise<void>;

  // Convenience
  canCreateMore: boolean;  // false for free users who already have 1 portfolio
}

/* ── Context ────────────────────────────────────────────────── */
const PortfolioContext = createContext<PortfolioContextValue | null>(null);

/* ── Persistence key ────────────────────────────────────────── */
const ACTIVE_KEY = 'nortfy:activePortfolioId';

function readPersistedId(): string | null {
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}
function persistId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else    localStorage.removeItem(ACTIVE_KEY);
  } catch { /* safari private */ }
}

/* ── Provider ───────────────────────────────────────────────── */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, isPremium } = useAuth();

  const [portfolios,      setPortfolios]      = useState<Portfolio[]>([]);
  const [activeId,        setActiveId]        = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [bootstrapping,   setBootstrapping]   = useState(true);
  const [error,           setError]           = useState<string | null>(null);

  const fetchingRef = useRef(false);

  /* ── Bootstrap: load or create portfolio on login ─────────── */
  const bootstrap = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // 1. Try to list existing portfolios
      const { portfolios: list } = await listPortfolios();

      if (list.length > 0) {
        setPortfolios(list);

        // Restore last active selection — validate it still exists
        const persisted = readPersistedId();
        const valid     = persisted && list.some((p) => p.id === persisted);
        const chosen    = valid ? persisted! : list[0].id;

        setActiveId(chosen);
        persistId(chosen);
      } else {
        // First-ever login: create default portfolio
        const fresh = await findOrCreatePortfolio();
        setPortfolios([fresh]);
        setActiveId(fresh.id);
        persistId(fresh.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar carteiras');
    } finally {
      setLoading(false);
      setBootstrapping(false);
      fetchingRef.current = false;
    }
  }, []);

  /* ── Refresh (called after allocation save, etc.) ──────────── */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { portfolios: list } = await listPortfolios();
      setPortfolios(list);

      // If active portfolio was deleted externally, fall back to first
      if (list.length > 0 && !list.some((p) => p.id === activeId)) {
        setActiveId(list[0].id);
        persistId(list[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar carteiras');
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  /* ── Run bootstrap when user is known ──────────────────────── */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Logout: clear everything
      setPortfolios([]);
      setActiveId(null);
      setBootstrapping(false);
      setError(null);
      persistId(null);
      return;
    }

    bootstrap();
  }, [user, authLoading, bootstrap]);

  /* ── Active portfolio switcher ──────────────────────────────── */
  const setActivePortfolioId = useCallback((id: string) => {
    if (!portfolios.some((p) => p.id === id)) return; // guard: must exist
    setActiveId(id);
    persistId(id);
  }, [portfolios]);

  /* ── Create ─────────────────────────────────────────────────── */
  const create = useCallback(async (payload: CreatePortfolioPayload = {}): Promise<Portfolio> => {
    const created = await createPortfolio(payload);
    setPortfolios((prev) => [created, ...prev]);
    // Switch to newly created portfolio automatically
    setActiveId(created.id);
    persistId(created.id);
    return created;
  }, []);

  /* ── Update ─────────────────────────────────────────────────── */
  const update = useCallback(async (id: string, payload: UpdatePortfolioPayload): Promise<Portfolio> => {
    const updated = await updatePortfolio(id, payload);
    setPortfolios((prev) => prev.map((p) => p.id === id ? updated : p));
    return updated;
  }, []);

  /* ── Remove ─────────────────────────────────────────────────── */
  const remove = useCallback(async (id: string): Promise<void> => {
    await deletePortfolio(id);

    setPortfolios((prev) => {
      const next = prev.filter((p) => p.id !== id);

      // If the deleted one was active, fall back to first remaining
      if (activeId === id && next.length > 0) {
        setActiveId(next[0].id);
        persistId(next[0].id);
      }

      return next;
    });
  }, [activeId]);

  /* ── Derived values ─────────────────────────────────────────── */
  const activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;

  // Free users can only have 1 portfolio
  const canCreateMore = isPremium || portfolios.length === 0;

  /* ── Value ──────────────────────────────────────────────────── */
  const value: PortfolioContextValue = {
    portfolios,
    activePortfolio,
    activePortfolioId: activeId,
    loading,
    bootstrapping,
    error,
    setActivePortfolioId,
    create,
    update,
    remove,
    refresh,
    canCreateMore,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside <PortfolioProvider>');
  return ctx;
}