'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  EyeOff,
  Database,
  LockKeyhole,
  Cookie,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PrivacidadePage() {
  const updatedAt = "18 de Março de 2026";

  const sections = [
    {
      id: "informacoes",
      icon: <Database className="w-5 h-5 text-indigo-500" />,
      title: "1. Informações que Coletamos",
      content: (
        <>
          <p className="mb-4">
            A Nortfy coleta apenas as informações estritamente necessárias para a prestação dos nossos serviços de rebalanceamento de portfólio. Isso inclui:
          </p>
          <ul className="space-y-4 text-gray-600 list-none pl-0">
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
              <span><strong>Dados de Conta:</strong> Nome, endereço de e-mail e credenciais de login (gerenciados com segurança através da Supabase).</span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
              <span><strong>Dados de Portfólio:</strong> Informações sobre ativos, quantidades e preços médios que você insere manualmente na plataforma para o cálculo de rebalanceamento.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
              <span><strong>Dados de Pagamento:</strong> Processados integralmente pelo Mercado Pago. Nós não armazenamos os números dos seus cartões de crédito.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: "uso",
      icon: <EyeOff className="w-5 h-5 text-indigo-500" />,
      title: "2. Como Usamos Seus Dados",
      content: (
        <p>
          Os dados de portfólio inseridos são utilizados unicamente para gerar métricas de desempenho e calcular a defasagem (drift) do seu portfólio em relação às bandas de rebalanceamento que você configurou. <strong>Nenhum dado financeiro do usuário é vendido, alugado ou compartilhado com terceiros para fins publicitários ou comerciais.</strong>
        </p>
      )
    },
    {
      id: "protecao",
      icon: <LockKeyhole className="w-5 h-5 text-indigo-500" />,
      title: "3. Proteção e Segurança (Criptografia)",
      content: (
        <p>
          Todas as suas informações financeiras são guardadas em nossos bancos de dados (Supabase/PostgreSQL) e são blindadas pelas mais modernas técnicas de segurança corporativa, com suporte severo a políticas de Row Level Security (RLS). Adicionalmente, todo tráfego entre a nossa plataforma e seu navegador ocorre através de conexões TLS/SSL (HTTPS) seguras e encriptadas de ponta a ponta.
        </p>
      )
    },
    {
      id: "cookies",
      icon: <Cookie className="w-5 h-5 text-indigo-500" />,
      title: "4. Cookies e Tecnologias de Rastreio",
      content: (
        <p>
          Utilizamos cookies exclusivamente operacionais para gerenciar sessões de login e manter as preferências visuais ou funcionais da interface (ex: manter você autenticado na sessão atual). Não utilizamos cookies intrusivos ou trackers de redes de anúncios focados em retargeting cruzado, respeitando a sua autonomia de navegação.
        </p>
      )
    },
    {
      id: "direitos",
      icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
      title: "5. Seus Direitos (LGPD)",
      content: (
        <p>
          Em total conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui o direito inalienável de requisitar o acesso, retificação, ou eliminação total de todos os seus dados pessoais armazenados pelos nossos servidores a qualquer momento. Se desejar excluir sua conta definitivamente, basta ativar a opção diretamente no painel de configurações ou entrar em contato com o nosso suporte.
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-emerald-700 tracking-wide uppercase">Privacidade Total</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#121212] tracking-tight leading-tight mb-4"
          >
            Política de Privacidade
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[16px] text-gray-500 max-w-xl mx-auto font-medium"
          >
            Última atualização: {updatedAt}. Descubra como processamos e protegemos suas informações de ponta a ponta.
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

        </div>
      </section>

      <Footer />
    </main>
  );
}
