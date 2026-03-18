import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços | Nortfy',
  description: 'Conheça nossos planos e assine o Nortfy Premium para desbloquear carteiras ilimitadas, monitoramento de drift em tempo real e rebalanceamento automático de criptomoedas.',
  openGraph: {
    title: 'Planos e Preços | Nortfy',
    description: 'Comece com o plano gratuito e faça upgrade quando quiser. Rebalanceamento de portfólios acessível e inteligente.',
  }
};

export default function PlanosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
