import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Nortfy',
  description: 'Leia nossos Termos de Uso. Saiba como a Nortfy protege seus dados utilizando tracking manual de carteiras (zero integrações externas) e as regras da nossa plataforma.',
  openGraph: {
    title: 'Termos de Uso | Nortfy',
    description: 'Nós não temos custódia dos seus ativos. Entenda nossos Termos de Uso.',
  }
};

export default function TermosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
