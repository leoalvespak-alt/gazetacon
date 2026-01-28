# Product Requirements Document (PRD) - **Gazetacon / Blog Concursos**

## 1. Visão Geral do Produto

O **Gazetacon** (também referido como Blog Concursos) é uma plataforma completa voltada para o nicho de concursos públicos. O objetivo é fornecer aos estudantes ("concurseiros") um ecossistema rico com notícias, dicas de estudo, informações sobre editais, materiais interativos (flashcards, correção de redação) e ferramentas de planejamento.

Além da frente pública, o sistema possui um **Admin Dashboard** robusto para gestão de conteúdo, editais, usuários, afiliados e integração com IA para produtividade editorial.

## 2. Personas e Público-Alvo

- **O Concurseiro (Usuário Final):** Busca informações atualizadas sobre editais, dicas de estudo, materiais gratuitos e ferramentas para organizar sua rotina.
- **O Editor/Admin (Gestor):** Responsável por publicar notícias, cadastrar concursos, gerenciar links de afiliados e monitorar o desempenho do site.

## 3. Principais Funcionalidades

### 3.1. Portal Público (Frontend)

- **Home Page Dinâmica:** Destaques de notícias, concursos abertos e previstos, e acesso rápido a ferramentas.
- **Blog de Notícias:** Artigos completos com formatação rica, categorias e tags.
- **Busca Avançada (`/search`):** Pesquisa global por posts e concursos.
- **Central de Concursos:** Listagem filtrável de concursos (Abertos, Previstos, Encerrados) por região, banca ou carreira.
- **Ferramentas de Estudo:**
  - **Imersão:** Sistema de Flashcards ou estudo focado.
  - **Correção de Redações:** Módulo (anteriormente restrito, agora aberto) para envio e feedback de redações.
  - **Estudo Ativo:** Materiais e métodos de estudo.
- **Páginas Legais:** Termos de Uso e Política de Privacidade.

### 3.2. Painel Administrativo (`/admin`)

O coração da operação do site, restrito a usuários autenticados com permissão.

#### 3.2.1. Gestão de Conteúdo (CMS)

- **Posts (`/admin/posts`):**
  - Criação e edição com **Rich Text Editor (Tiptap)**.
  - Suporte a imagens, links, citações e formatação avançada.
  - Integração com **IA (Gemini)** para:
    - Revisão gramatical e de estilo.
    - Sugestão de títulos SEO.
    - Geração de rascunhos.
  - Preview de **Snippet SEO** (como o post aparecerá no Google).
- **Categorias (`/admin/categories`):** Organização taxonômica do conteúdo.

#### 3.2.2. Radar de Concursos (`/admin/concursos`)

- Cadastro detalhado de Certames:
  - Banca organizadora, Escolaridade, Salários, Vagas.
  - Cronograma (Inscrições, Provas, Resultados).
  - Link oficial do edital.
- Status visual (Aberto, Previsto, etc.).
- Gestão de Bancas Examinadoras.

#### 3.2.3. Planejamento Editorial (`/admin/calendar`)

- Calendário interativo para agendar publicações e marcos importantes de concursos.
- Notas compartilhadas e pautas entre a equipe.

#### 3.2.4. Monetização e Marketing (`/admin/affiliates`)

- **Gerenciador de Links de Afiliados:**
  - Criação de links curtos/redirecionamentos (`/go/curso-x`).
  - Rastreamento de cliques (Analytics simples).

#### 3.2.5. Configurações do Site (`/admin/settings`)

- Gerenciamento dinâmico de identidade visual (Logo, Favicon).
- Configurações globais de SEO e Redes Sociais.

#### 3.2.6. Gestão de Usuários (`/admin/users`)

- Controle de acesso e perfis de usuários.
- Logs de atividade do sistema.

#### 3.2.7. Provas (`/admin/provas`)

- Repositório de provas anteriores (Provavelmente para download ou resolução online).

## 4. Arquitetura Técnica

### 4.1. Stack Tecnológico

- **Frontend:** Next.js 16 (App Router), React 19.
- **Linguagem:** TypeScript.
- **Estilização:** Tailwind CSS v4, Radix UI (Componentes acessíveis), Lucide React (Ícones).
- **UI/UX:** Design moderno com suporte a Dark Mode (via `next-themes`), Charts (`recharts`) e Toasts (`sonner`).
- **Backend (BaaS):** Supabase (PostgreSQL).
- **AI:** Google Generative AI SDK (Gemini).
- **Editor:** Tiptap (Headless wrapper).
- **Forms:** React Hook Form + Zod (Validação).
- **Datas:** date-fns.

### 4.2. Estrutura de Banco de Dados (Supabase)

Principais tabelas inferidas das migrações:

- `profiles`: Dados de usuários e roles.
- `posts`: Artigos do blog.
- `concursos`: Dados estruturados dos certames.
- `bancas`: Organizadoras (Cebraspe, FGV, etc.).
- `provas`: Arquivos ou links de provas.
- `affiliate_links`: Links de redirecionamento.
- `activity_logs`: Auditoria de ações no admin.
- `admin_settings`: Configurações globais chave-valor.
- `calendar_events` (implícito): Eventos do calendário editorial.

## 5. Requisitos Não-Funcionais

- **Performance:** Carregamento otimizado (Next.js SSR/ISR).
- **SEO:** Otimização para motores de busca (Meta tags dinâmicas, Sitemap).
- **Responsividade:** Interface 100% adaptável a Mobile e Desktop.
- **Segurança:** Autenticação via Supabase Auth, RLS (Row Level Security) no banco de dados.

## 6. Roadmap e Futuro

- Melhoria no **Dashboard de Analytics** (Visão detalhada de tráfego).
- Expansão do sistema de **Correção de Redações** (Gamificação, IA corretora).
- Integração maior com WhatsApp (Bot de alertas de editais).
- Sistema de Assinatura/Membros Premium (caso aplicável).

---

_Documento gerado automaticamente com base na análise do repositório em 28/01/2026._
