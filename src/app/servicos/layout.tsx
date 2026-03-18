import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Serviços e Funcionalidades | Nortfy',
  description: 'Descubra como a Nortfy transforma a complexidade do rebalanceamento cripto em decisões sistemáticas, simples e baseadas em dados.',
  openGraph: {
    title: 'Serviços e Funcionalidades | Nortfy',
    description: 'Pulse live tracker, alertas automáticos focados em matemática sem riscos de API ou integrações com exchanges. Conheça as funcionalidades.',
  }
};

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
