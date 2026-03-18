import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assinar Premium | Nortfy',
  description: 'Finalize sua assinatura do Nortfy Premium com segurança MercadoPago. Acesse carteiras ilimitadas, alertas automáticos e rebalanceamento inteligente.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
