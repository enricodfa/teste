# Nortfy — Frontend

![Nortfy Header](https://via.placeholder.com/1200x400/1e1e2f/ffffff?text=NORTFY+-+Frontend)

Este é o repositório **Frontend** da [Nortfy](https://nortfy.com), a plataforma SaaS de rebalanceamento sistemático e inteligente de portfólios de criptomoedas através de lançamentos manuais.

## 🧰 Tech Stack
- **Framework:** Next.js 13+ (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React & Phosphor Icons
- **Pagamento:** SDK do Mercado Pago (`@mercadopago/sdk-react`)
- **Gestão de Estado:** React Context API (`AuthContext`, `PortfolioContext`)

## 🏗️ Estrutura de Diretórios
- `/src/app/` — Páginas principais usando a topologia App Router do Next.js. Contém o funil público (`page.tsx`, `planos`, `servicos`, `termos`), autenticação (`login`, `auth/callback`), e áreas logadas (`dashboard`, `rebalance`, `operations`).
- `/src/components/` — Componentes reaproveitáveis separados por funcionalidade:
  - `/landing` (Navbar e Footer públicos)
  - `/layout` (AppLayout, Sidebar e Header do Dashboard)
  - `/modals` (Modais utilitários como SupportModal)
  - `/ui` (Elementos atômicos)
- `/src/contexts/` — Gerenciadores globais de estado (Ex: Carrinho, Autenticação, Carteira selecionada cruzada via Context API).
- `/src/services/` — Camada de ponte, hospedando arquivos `.ts` que fazem as chamadas HTTP via Fetch API ou Axios para o nosso `backend-main`.

## 🚀 Como Executar Localmente

**1. Instale as dependências**
```bash
npm install
# ou
yarn install
```

**2. Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz e mapeie as variáveis públicas do Supabase e do MercadoPago, e a URL do seu backend local:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_publica
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua_key_mercado_pago
NEXT_PUBLIC_API_URL=http://localhost:5000 # url do seu backend node
```

**3. Inicie o Servidor de Desenvolvimento**
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador. As rotas internas exigem que você crie primeiro uma conta e passe pela autenticação para acessar o painel administrativo.

## 📐 Padrões Adotados (Code Guidelines)
1. Nós operamos sob **Custódia Zero e Inserção Manual**: Todos os lançamentos visuais e descritivos nas páginas devem refletir a impossibilidade técnica de conectar uma Exchange ou API externa, evidenciando nossa segurança extrema.
2. Uso do `'use client'` estritamente nas fronteiras interativas (framer-motion, event listeners). As views puras ou invólucros de SEO (`layout.tsx`) são Server Components.
