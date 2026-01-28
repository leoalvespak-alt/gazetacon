# Master Plan: Blog de Concursos (Frontend + Admin)

Este documento contém uma sequência lógica de prompts para criar um blog de concursos completo, incluindo área administrativa (CMS), usando o Cursor AI.

**Stack Recomendada:** Next.js (App Router), Tailwind CSS, Shadcn UI, Lucide Icons.
**Banco de Dados Sugerido:** Supabase (PostgreSQL).

---
SUPABASE
URL: https://bexxizmtifmppeeybiii.supabase.co
Publishable API Key: sb_publishable_SBbJhdjgLAxJ4JOMuaCzVw_mQA__haU
anon: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleHhpem10aWZtcHBlZXliaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTA0NjUsImV4cCI6MjA4MjI2NjQ2NX0.xbJxBB_kQt3MgYbzQ_y_yNDES8oba7RRtUfOjLq1qcY
secret: sb_secret_mTslENhDVFKSeYecbWCY2g_qKVXfvvB
service role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleHhpem10aWZtcHBlZXliaWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY5MDQ2NSwiZXhwIjoyMDgyMjY2NDY1fQ.wZZy3TKUqMzK9m97iiMNpxHSd-LSC1Fe4U79qJPtPU4
---

## 🏗️ Fase 1: Fundação e Layout Público

### Passo 1: Contexto e Configuração Inicial

- [x] Configuração Next.js 16 + Tailwind v4 + Shadcn
- [x] Integração Supabase (Auth + DB)
- [x] Frontend Público (Home + Post detail) - Gazeta dos Concursos
- [x] Área Admin (Login + CRUD Categorias + Posts)
- [x] Resolver erros de Build e Tipagem
- [x] Estilizar com design Premium e imagens IA
- [ ] Upload de Imagens no Supabase Storage (Pendência opcional)
- [ ] SEO Avançado e Sitemap (Próximos passos)
      **Copie e cole este prompt primeiro para "calibrar" o Cursor.**

> Atue como um Engenheiro de Software Senior Especialista em Frontend e UX/UI. Vamos criar uma aplicação web para um Blog de Concursos Públicos.
>
> **Stack Tecnológica:**
>
> - Framework: Next.js 16+ (App Router)
> - Estilização: Tailwind CSS
> - Componentes: Shadcn UI (instale o necessário)
> - Ícones: Lucide React
> - Banco de Dados (futuro): Supabase
>
> **Identidade Visual:**
>
> - Estilo: Minimalista, limpo, focado em leitura (similar a portais como 'Folha Dirigida' ou 'Medium').
> - Tipografia: 'Inter' ou 'Poppins' para títulos, fonte serifada moderna ou sans-serif limpa para corpo de texto.
> - Cores: Fundo claro/neutro, com uma cor de destaque (Accent Color) sóbria (Azul institucional ou Laranja).
> - **Mobile First:** Todo o design deve ser responsivo.
>
> Não gere código ainda. Apenas confirme que entendeu as diretrizes e a stack.

---

### Passo 2: Header e Estrutura de Navegação

> Crie o componente `Header` (Topo) fixo/sticky e o Layout base (`layout.tsx`).
>
> **Requisitos do Header:**
>
> 1.  **Logo:** Texto ou ícone simples à esquerda.
> 2.  **Menu Desktop:** Links centralizados: "Notícias", "Dicas de Estudo", "Por Área", "Editais & Provas".
> 3.  **Menu Mobile:** Menu "Hambúrguer" (Sheet do Shadcn UI) contendo os mesmos links.
> 4.  **Ações (Direita):** Botão de Busca (Lupa) e Toggle de Dark/Light Mode.
>
> Use `z-index` adequado para ficar sobre o conteúdo. Adicione uma borda inferior sutil (`border-b`).

---

### Passo 3: Página Inicial (Home) - Grid e Cards

> Implemente a página inicial (`app/page.tsx`) focada em hierarquia de informação.
>
> **Estrutura:**
>
> 1.  **Seção Hero:** Destaque para o post mais importante. Layout deve ser impactante (imagem grande à esquerda ou fundo, texto sobreposto ou ao lado).
> 2.  **Componente `PostCard`:** Crie um card reutilizável contendo:
>     - Imagem de capa (aspect-video).
>     - Badge de Categoria (ex: "Policial", "Fiscal").
>     - Título (H3, negrito).
>     - Metadados: Data e Tempo de Leitura (ícone relógio).
> 3.  **Grid de Notícias:** Abaixo do Hero, um grid responsivo (1 coluna mobile, 3 colunas desktop) listando os posts recentes.
> 4.  **Seções por Categoria:** Blocos horizontais separando "Dicas de Estudo" e "Editais Abertos".
>
> Use _mock data_ (arrays estáticos) por enquanto para popular a tela e visualizar o design.

---

### Passo 4: Página do Artigo (Leitura)

> Crie a página dinâmica de leitura do post: `app/blog/[slug]/page.tsx`.
>
> **Design focado em leitura (Distraction-free):**
>
> 1.  **Breadcrumb:** Home > Categoria > Título do Post.
> 2.  **Header do Artigo:** Título H1 grande, Subtítulo (Lead), Autor (avatar + nome) e Data atualizada.
> 3.  **Corpo do Texto:**
>     - Largura máxima de `65ch` (caracteres) centralizada.
>     - Tipografia escalonada e entrelinha confortável (`leading-relaxed`).
>     - Estilize headings (h2, h3), listas e blockquotes usando a classe `prose` do Tailwind Typography plugin (se necessário instale `@tailwindcss/typography`).
> 4.  **Sidebar Lateral (Desktop apenas):** Coluna à direita (sticky) com "Tópicos deste artigo" (Table of Contents) ou "Notícias Relacionadas".

---

## 🗄️ Fase 2: Dados e Backend (Supabase)

### Passo 5: Modelagem de Dados (SQL)

> Agora vamos preparar a estrutura de dados. Considere que usaremos o Supabase. Crie o script SQL ou a definição de tipos TypeScript para as seguintes tabelas:
>
> 1.  **posts:** id, title, slug (unique), content (rich text/html), excerpt, cover_image_url, category_id, author_id, published (boolean), created_at.
> 2.  **categories:** id, name, slug, color (hex).
> 3.  **tags:** id, name, slug.
> 4.  **posts_tags:** tabela pivô (post_id, tag_id).
>
> Crie também um arquivo `lib/supabase.ts` (ou similar) configurando o cliente do Supabase.

---

## ⚙️ Fase 3: Painel Administrativo (CMS)

### Passo 6: Layout do Admin e Sidebar

> Vamos criar a área administrativa em `/app/admin`.
>
> 1.  **Layout Admin (`admin/layout.tsx`):** Diferente do site público. Deve ter uma **Sidebar Lateral Esquerda** fixa.
> 2.  **Itens da Sidebar:**
>     - Dashboard (Visão geral)
>     - Posts (Listar/Criar)
>     - Categorias
>     - Tags
>     - Configurações
>     - Botão Sair/Logout.
> 3.  **Proteção:** Simule uma verificação de sessão. Se não estiver logado, redirecionar para `/login`.
>
> Use componentes do Shadcn UI (Sidebar, Buttons) para manter o visual profissional e sóbrio.

---

### Passo 7: Listagem de Conteúdo (Data Tables)

> Crie a página de listagem de posts (`/app/admin/posts/page.tsx`).
>
> **Requisitos:**
>
> 1.  Use o componente `Table` (Shadcn UI) para listar os artigos.
> 2.  **Colunas:** Título, Categoria, Status (Publicado/Rascunho), Data, Ações.
> 3.  **Coluna Ações:** Um menu dropdown (três pontinhos) com: "Editar", "Ver no site", "Excluir".
> 4.  Inclua uma barra de busca e filtro por categoria no topo da tabela.
> 5.  Botão "Novo Post" destacado no canto superior direito.

---

### Passo 8: O Editor de Posts (Coração do Blog)

> Precisamos de uma interface robusta para criar/editar posts em `/app/admin/posts/create` (ou `[id]/edit`).
>
> 1.  **Layout do Formulário:**
>     - Coluna Principal (Esquerda, larga): Campo Título e o **Editor de Texto Rico**.
>     - Coluna Lateral (Direita, estreita): Configurações de publicação.
> 2.  **Editor WYSIWYG:** Implemente um editor usando `Tiptap` ou similar. Deve suportar: Negrito, Itálico, H2/H3, Listas e Upload de Imagem (ou inserção de URL).
> 3.  **Painel Lateral (Settings):**
>     - Upload de Imagem de Capa (Input file com preview).
>     - Select de Categoria.
>     - Input de Tags (estilo "chips", onde digita e aperta enter).
>     - Toggle Switch: "Publicado / Rascunho".
>     - Campo Slug (gerado auto pelo título, mas editável).
> 4.  Botão "Salvar" flutuante ou fixo no topo.

---

### Passo 9: Categorias e Tags (CRUD Simples)

> Crie páginas simples para gerenciar Categorias e Tags (`/app/admin/categories`).
>
> 1.  Lista simples com opção de Editar/Excluir.
> 2.  Um Dialog (Modal) do Shadcn UI para "Adicionar Nova Categoria" sem sair da página.
> 3.  Para categorias, permita escolher uma "Cor de etiqueta" (Color picker simples ou presets de cores do Tailwind).

---

## 🚀 Fase 4: Integração Final

### Passo 10: Conectar Front e Back

> Agora, atualize a Home Page pública (`app/page.tsx`) e a página de post (`app/blog/[slug]`) para buscar os dados reais do Supabase (ou do mock state que criamos) em vez de dados estáticos.
>
> Garanta que apenas posts com `published: true` apareçam na área pública.

---

### Dica de Ouro para o Cursor:

Se o código ficar muito longo, peça para ele criar arquivos separados. Exemplo: _"Crie apenas o componente `Editor.tsx` agora"_ e depois _"Agora crie a página que usa esse componente"_.
