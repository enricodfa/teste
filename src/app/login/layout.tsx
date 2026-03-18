import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar | Nortfy',
  description: 'Faça login na Nortfy para acessar o Pulse, visualizar seu portfólio cripto e gerenciar suas bandas de rebalanceamento sistemático.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
