'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Shield,
  Lock,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function TermosPage() {
  const updatedAt = "18 de Março de 2026";

  const sections = [
    {
      id: "aceitacao",
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      title: "1. Aceitação dos Termos",
      content: (
        <p>
          Ao acessar e utilizar a plataforma Nortfy ("Plataforma", "nós", "nosso"), você ("Usuário") concorda expressamente em vincular-se e estar sujeito a estes Termos de Uso. Caso não concorde com qualquer disposição aqui apresentada, solicitamos que não utilize nossos serviços. Estes termos regulam exclusivamente o uso do software analítico de rebalanceamento de portfólios fornecido por nós.
        </p>
      )
    },
    {
      id: "natureza",
      icon: <Scale className="w-5 h-5 text-indigo-500" />,
      title: "2. Natureza dos Serviços (Não é Conselho Financeiro)",
      content: (
        <>
          <p className="mb-4">
            A Nortfy atua <strong>estritamente como uma ferramenta matemática e tecnológica</strong>. Os dados, sugestões de rebalanceamento (compras e vendas) e métricas exibidas no painel ("The Pulse") resultam unicamente da defasagem (drift) entre a proporção atual da sua carteira e as "Bandas de Tolerância" previamente configuradas <strong>por você</strong>.
          </p>
          <ul className="space-y-4 text-gray-600 list-none pl-0">
            <li className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>A Nortfy <strong>NÃO</strong> é uma empresa de aconselhamento financeiro ou casa de research.</span>
            </li>
            <li className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Nenhuma informação fornecida constitui uma recomendação para comprar, vender ou manter qualquer criptoativo específico.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: "seguranca",
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      title: "3. Segurança e Custódia Zero",
      content: (
        <>
          <p className="mb-4">
            A segurança do seu patrimônio é inegociável. A Nortfy foi projetada com uma arquitetura de custódia zero (<em>non-custodial</em>) operando 100% via inserção manual de dados.
          </p>
          <p>
            Não utilizamos APIs de exchanges, integrações com carteiras externas ou contratos inteligentes sob nossa gestão. A plataforma atua rigorosamente como um diário de bordo e motor de cálculo matemático. Nós <strong>jamais</strong> solicitaremos envio de fundos para carteiras operacionais de nossa propriedade ou assinaturas de transações Web3.
          </p>
        </>
      )
    },
    {
      id: "planos",
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      title: "4. Planos, Assinaturas e Mercado Pago",
      content: (
        <>
          <p className="mb-4">
            Oferecemos uma modalidade gratuita e uma modalidade Premium. O processamento dos pagamentos é intermediado integralmente pelo <strong>Mercado Pago</strong>, e os dados sensíveis do seu cartão de crédito não transitam, não são salvos nem processados pelos servidores da Nortfy.
          </p>
          <p className="mb-4">
            Ao assinar o plano Premium anual ou mensal, a ativação imediata está condicionada à aprovação do Gateway ("approved"). Reembolsos podem ser solicitados em até 7 (sete) dias após a primeira contratação, em conformidade com o Código de Defesa do Consumidor brasileiro.
          </p>
        </>
      )
    },
    {
      id: "responsabilidade",
      icon: <AlertTriangle className="w-5 h-5 text-indigo-500" />,
      title: "5. Limitação de Responsabilidade",
      content: (
        <p>
          O mercado de criptomoedas é altamente volátil. O Usuário manifesta sua plena compreensão e ciência dos riscos intrínsecos de latência em redes descentralizadas ou desequilíbrio abrupto de preços em mercados peer-to-peer. Sendo a Nortfy um painel de inserção e controle numérico, eximimo-nos explicitamente de perdas financeiras resultantes de lançamentos incorretos de cotação pelo usuário, slippages na hora da negociação final (feita externamente), ou perdas por falências de exchanges onde você decida guardar o seu capital.
        </p>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] overflow-x-hidden selection:bg-indigo-500/30">
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 lg:pt-40 pb-16 lg:pb-24 overflow-hidden border-b border-gray-200/60 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-gray-100/50 via-white to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 mb-6"
          >
            <Shield className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">Políticas Oficiais</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#121212] tracking-tight leading-tight mb-4"
          >
            Termos e Condições de Uso
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[16px] text-gray-500 max-w-xl mx-auto font-medium"
          >
            Última atualização: {updatedAt}. Por favor, leia com atenção as nossas políticas de responsabilidade e segurança de software.
          </motion.p>
        </div>
      </section>

      {/* Content wrapper */}
      <section className="py-16 lg:py-24 max-w-5xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row gap-12 lg:gap-20">

        {/* Sidebar Index (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-[120px]">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-3">
              Índice
            </h3>
            <nav className="flex flex-col gap-1 relative border-l-2 border-gray-100">
              {sections.map((sec, idx) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-4 py-2.5 text-[14px] font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-r-lg transition-colors border-l-2 border-transparent hover:border-indigo-500 -ml-[2px]"
                >
                  {sec.title}
                </a>
              ))}
            </nav>

          </div>
        </aside>

        {/* Legal Text */}
        <div className="flex-1 max-w-3xl pb-20">
          <div className="prose prose-gray max-w-none space-y-16">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight m-0">
                    {section.title}
                  </h2>
                </div>
                <div className="text-[15.5px] leading-relaxed text-gray-600 font-medium">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Acknowledgement block */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-gray-900 mb-2">Transparência em primeiro lugar</h4>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Nós construímos a Nortfy porque precisávamos de uma ferramenta robusta, fria e analítica para proteger nosso capital de nós mesmos. Construímos segurança de ponta porque essa ferramenta também orquestra nosso próprio patrimônio.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
