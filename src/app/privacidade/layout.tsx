import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Nortfy',
  description: 'Saiba como a Nortfy coleta, usa e protege seus dados. Nós valorizamos sua privacidade e garantimos máxima segurança na gestão do seu portfólio cripto.',
  openGraph: {
    title: 'Política de Privacidade | Nortfy',
    description: 'Transparência e segurança no tratamento das suas informações.',
  }
};

export default function PrivacidadeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
