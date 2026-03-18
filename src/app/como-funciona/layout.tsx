import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Como Funciona | Nortfy',
  description: 'Entenda como o Nortfy controla o rebalanceamento de seu portfólio cripto passo a passo: inserção manual, parâmetros customizáveis e execução ágil.',
  openGraph: {
    title: 'Como Funciona | Nortfy',
    description: 'Do zero ao portfólio automatizado em etapas simples. Aprenda os pilares do Nortfy.',
  }
};

export default function ComoFuncionaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
