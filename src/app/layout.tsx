import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Nortfy — Rebalanceamento Inteligente de Portfólios Cripto',
  description: 'Automatize o rebalanceamento do seu portfólio cripto com alocações inteligentes. Compre na baixa, venda na alta — sistematicamente.',
  keywords: ['crypto', 'rebalanceamento', 'portfólio', 'alocação', 'bitcoin', 'investimento'],
  openGraph: {
    title: 'Nortfy — Rebalanceamento Inteligente de Portfólios Cripto',
    description: 'Automatize o rebalanceamento do seu portfólio cripto. Defina sua alocação ideal e deixe a Nortfy cuidar do resto.',
    siteName: 'Nortfy',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${ibmMono.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
