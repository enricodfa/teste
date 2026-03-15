'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Activity, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Serviços', href: '/servicos' },
  { label: 'Planos', href: '/planos' },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !loading && !!user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <Activity className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[22px] font-extrabold tracking-tight text-[#121212]">
                Nortfy
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[14px] font-medium text-[#374151] hover:text-[#121212] rounded-lg hover:bg-black/[0.03] transition-all"
                >
                  {link.label}
                </Link>
              ))}

              <div className="w-px h-6 bg-gray-200 mx-2" />

              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="ml-1 inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px active:translate-y-0 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Ir para Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="ml-1 inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px active:translate-y-0 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/[0.04] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-[#121212]" /> : <Menu className="w-5 h-5 text-[#121212]" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-end p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-[#121212]" />
                </button>
              </div>
              <div className="px-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-[#374151] hover:text-[#121212] rounded-xl hover:bg-gray-50 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-gray-100 my-3" />

                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-center hover:shadow-lg transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Ir para Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-center hover:shadow-lg transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
