# 🎛️ Plano de Implementação: Painel Administrativo Completo

## Gazeta dos Concursos - Blog de Concursos Públicos

> **Versão:** 1.0  
> **Data:** 2026-01-27  
> **Tipo:** Não monetizado (gratuito)  
> **Stack:** Next.js 16+ (App Router), Tailwind CSS v4, Shadcn UI, Supabase  
> **Projeto Supabase:** `bexxizmtifmppeeybiii`

---

## 📋 ÍNDICE DE FASES

| Fase   | Nome                         | Módulos                         | Prioridade |
| ------ | ---------------------------- | ------------------------------- | ---------- |
| **1**  | Fundação do Database         | Novas tabelas, migrations       | 🔴 CRÍTICA |
| **2**  | Gestão de Concursos          | CRUD completo de editais        | 🔴 CRÍTICA |
| **3**  | Dashboard Avançado           | Métricas, gráficos, alertas     | 🟡 ALTA    |
| **4**  | Editor de Posts Melhorado    | Blocos customizados, auto-save  | 🟡 ALTA    |
| **5**  | SEO Toolkit                  | Meta tags, sitemap, schema      | 🟡 ALTA    |
| **6**  | Gestão de Usuários           | Roles, permissões, logs         | 🟢 MÉDIA   |
| **7**  | Ferramentas de Produtividade | Calendário, Kanban, templates   | 🟢 MÉDIA   |
| **8**  | Automações com IA            | Títulos, resumos, tags auto     | 🟢 MÉDIA   |
| **9**  | Banco de Provas              | Upload, gabaritos, estatísticas | 🔵 BAIXA   |
| **10** | Configurações do Sistema     | Identidade, integrações, backup | 🔵 BAIXA   |

---

## 📊 ESTADO ATUAL DO PROJETO

### Tabelas Existentes no Supabase

```sql
-- ✅ JÁ EXISTEM:
- categories (id, name, slug, color, created_at) -- 4 registros
- posts (id, title, slug, content, excerpt, cover_image_url, category_id, author_id, published, created_at, updated_at)
- tags (id, name, slug)
- posts_tags (post_id, tag_id)
- profiles (id, full_name, avatar_url, updated_at, phone, secondary_email, is_lead, lead_source, lead_score)
- newsletter_consents (id, email, ip_address, consent_type, accepted_terms_version, created_at, opt_out_at)
```

### Estrutura de Pastas Existente

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx ✅
│   │   ├── page.tsx ✅ (Dashboard básico)
│   │   ├── categories/ ✅
│   │   ├── posts/ ✅
│   │   ├── settings/
│   │   └── users/
│   ├── blog/
│   ├── login/
│   └── ...
├── components/
│   ├── admin/ ✅ (AdminSidebar)
│   ├── ui/ ✅ (15 componentes Shadcn)
│   └── ...
└── lib/
    ├── supabase.ts ✅
    └── supabase-browser.ts ✅
```

---

# 🔴 FASE 1: FUNDAÇÃO DO DATABASE

**Tempo estimado:** 2-3 horas  
**Dependências:** Nenhuma

## 1.1 Criar Novas Tabelas

### Tarefa 1.1.1: Tabela `concursos`

**Arquivo:** `supa/migrations/001_create_concursos.sql`

```sql
-- Tabela principal de concursos/editais
CREATE TABLE IF NOT EXISTS public.concursos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Identificação
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  orgao TEXT NOT NULL,                    -- Ex: "INSS", "Receita Federal"
  banca TEXT,                             -- Ex: "CESPE/CEBRASPE", "FCC"

  -- Vagas e Remuneração
  vagas_total INTEGER DEFAULT 0,
  vagas_imediatas INTEGER DEFAULT 0,
  vagas_cr INTEGER DEFAULT 0,             -- Cadastro de Reserva
  salario_min DECIMAL(12, 2),
  salario_max DECIMAL(12, 2),

  -- Requisitos
  escolaridade TEXT,                      -- 'medio', 'superior', 'especifico'
  cargos JSONB DEFAULT '[]',              -- Array de cargos [{nome, vagas, salario}]

  -- Datas Importantes
  data_publicacao DATE,
  data_inscricao_inicio DATE,
  data_inscricao_fim DATE,
  data_prova DATE,
  data_resultado DATE,

  -- Status automático calculado
  status TEXT DEFAULT 'previsto',         -- 'previsto', 'inscricoes_abertas', 'inscricoes_encerradas', 'em_andamento', 'encerrado'

  -- Links e Arquivos
  edital_url TEXT,
  site_oficial TEXT,
  taxa_inscricao DECIMAL(8, 2),

  -- Localização
  estado TEXT,                            -- UF
  cidade TEXT,
  abrangencia TEXT DEFAULT 'nacional',    -- 'nacional', 'estadual', 'municipal'

  -- Área/Categoria
  area TEXT,                              -- 'fiscal', 'policial', 'juridica', 'administrativa', 'saude', 'educacao', 'bancaria', 'ti'

  -- Metadados
  destaque BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  author_id UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_concursos_status ON public.concursos(status);
CREATE INDEX idx_concursos_area ON public.concursos(area);
CREATE INDEX idx_concursos_orgao ON public.concursos(orgao);
CREATE INDEX idx_concursos_data_inscricao_fim ON public.concursos(data_inscricao_fim);

-- RLS
ALTER TABLE public.concursos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Concursos públicos para todos" ON public.concursos
  FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar concursos" ON public.concursos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

### Tarefa 1.1.2: Tabela `files` (Mídia)

**Arquivo:** `supa/migrations/002_create_files.sql`

```sql
-- Biblioteca de arquivos/mídias
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,

  storage_path TEXT NOT NULL,             -- Caminho no Supabase Storage
  public_url TEXT,

  folder TEXT DEFAULT 'uploads',          -- Organização: 'covers', 'provas', 'editais', 'uploads'
  alt_text TEXT,

  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arquivos públicos para leitura" ON public.files
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem fazer upload" ON public.files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Tarefa 1.1.3: Tabela `admin_settings`

**Arquivo:** `supa/migrations/003_create_admin_settings.sql`

```sql
-- Configurações do sistema
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,

  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_by UUID REFERENCES auth.users(id)
);

-- Configurações iniciais
INSERT INTO public.admin_settings (key, value, description) VALUES
  ('site_name', '"Gazeta dos Concursos"', 'Nome do site'),
  ('site_description', '"Portal de notícias e informações sobre concursos públicos"', 'Descrição para SEO'),
  ('social_links', '{"twitter": "", "facebook": "", "instagram": "", "telegram": ""}', 'Links das redes sociais'),
  ('analytics_id', '""', 'Google Analytics ID'),
  ('default_cover_image', '"/images/default-cover.jpg"', 'Imagem padrão para posts');

-- RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings públicos para leitura" ON public.admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem alterar settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

### Tarefa 1.1.4: Tabela `activity_logs`

**Arquivo:** `supa/migrations/004_create_activity_logs.sql`

```sql
-- Logs de atividades do admin
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,                   -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL,              -- 'post', 'concurso', 'category', 'user', 'settings'
  entity_id UUID,
  entity_title TEXT,                      -- Para exibição sem JOIN

  details JSONB,                          -- Detalhes extras (old_value, new_value, etc)
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Índices
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins veem logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Sistema pode criar logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Tarefa 1.1.5: Alterar tabela `profiles` para adicionar roles

**Arquivo:** `supa/migrations/005_alter_profiles_add_role.sql`

```sql
-- Adicionar coluna de role
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Valores permitidos: 'super_admin', 'admin', 'editor', 'author', 'moderator', 'user'

-- Atualizar o usuário atual como admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users LIMIT 1);

-- Adicionar mais colunas úteis
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc', now());
```

### Tarefa 1.1.6: Alterar tabela `posts` para melhorias

**Arquivo:** `supa/migrations/006_alter_posts_improvements.sql`

```sql
-- Melhorias na tabela posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS concurso_id UUID REFERENCES public.concursos(id);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON public.posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_concurso ON public.posts(concurso_id);
```

### Tarefa 1.1.7: Tabela `provas` (Banco de Provas)

**Arquivo:** `supa/migrations/007_create_provas.sql`

```sql
-- Banco de provas anteriores
CREATE TABLE IF NOT EXISTS public.provas (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  titulo TEXT NOT NULL,
  concurso_id UUID REFERENCES public.concursos(id),

  -- Identificação
  orgao TEXT NOT NULL,
  banca TEXT,
  ano INTEGER NOT NULL,
  cargo TEXT,

  -- Arquivos
  prova_url TEXT,                         -- PDF da prova
  gabarito_url TEXT,                      -- PDF do gabarito
  gabarito_comentado_url TEXT,            -- Gabarito comentado (se houver)

  -- Estatísticas (calculadas)
  total_questoes INTEGER DEFAULT 0,
  assuntos_mais_cobrados JSONB DEFAULT '[]',

  -- Metadados
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provas públicas para todos" ON public.provas
  FOR SELECT USING (true);

CREATE POLICY "Admins gerenciam provas" ON public.provas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );
```

### Tarefa 1.1.8: Tabela `favoritos` (Para usuários)

**Arquivo:** `supa/migrations/008_create_favoritos.sql`

```sql
-- Favoritos de usuários
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id UUID REFERENCES public.concursos(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),

  -- Um dos dois deve ser preenchido
  CONSTRAINT chk_favorito_tipo CHECK (
    (concurso_id IS NOT NULL AND post_id IS NULL) OR
    (concurso_id IS NULL AND post_id IS NOT NULL)
  ),

  -- Único por usuário/item
  CONSTRAINT unique_user_concurso UNIQUE (user_id, concurso_id),
  CONSTRAINT unique_user_post UNIQUE (user_id, post_id)
);

-- RLS
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus favoritos" ON public.favoritos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam seus favoritos" ON public.favoritos
  FOR ALL USING (auth.uid() = user_id);
```

## 1.2 Criar Storage Buckets

### Tarefa 1.2.1: Script de criação de buckets

**Arquivo:** `supa/storage_setup.sql`

```sql
-- Criar buckets no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('covers', 'covers', true),
  ('editais', 'editais', true),
  ('provas', 'provas', true),
  ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Policies para acesso público aos covers
CREATE POLICY "Covers públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Admins podem fazer upload de covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND
    auth.role() = 'authenticated'
  );

-- Policies para editais
CREATE POLICY "Editais públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'editais');

-- Policies para provas
CREATE POLICY "Provas públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'provas');
```

## 1.3 Executar Migrations

### Passos de Execução:

```bash
# 1. Conectar via Supabase CLI ou Dashboard
# 2. Executar cada migration em ordem:
#    - 001_create_concursos.sql
#    - 002_create_files.sql
#    - 003_create_admin_settings.sql
#    - 004_create_activity_logs.sql
#    - 005_alter_profiles_add_role.sql
#    - 006_alter_posts_improvements.sql
#    - 007_create_provas.sql
#    - 008_create_favoritos.sql
#    - storage_setup.sql
```

---

# 🔴 FASE 2: GESTÃO DE CONCURSOS

**Tempo estimado:** 4-6 horas  
**Dependências:** Fase 1

## 2.1 Tipos TypeScript

### Tarefa 2.1.1: Criar tipos para Concursos

**Arquivo:** `src/types/concurso.ts`

```typescript
export type ConcursoStatus =
  | "previsto"
  | "inscricoes_abertas"
  | "inscricoes_encerradas"
  | "em_andamento"
  | "encerrado";

export type ConcursoArea =
  | "fiscal"
  | "policial"
  | "juridica"
  | "administrativa"
  | "saude"
  | "educacao"
  | "bancaria"
  | "ti"
  | "outra";

export type ConcursoAbrangencia = "nacional" | "estadual" | "municipal";

export interface ConcursoCargo {
  nome: string;
  vagas: number;
  salario: number;
  escolaridade?: string;
}

export interface Concurso {
  id: string;
  titulo: string;
  slug: string;
  orgao: string;
  banca: string | null;

  vagas_total: number;
  vagas_imediatas: number;
  vagas_cr: number;
  salario_min: number | null;
  salario_max: number | null;

  escolaridade: string | null;
  cargos: ConcursoCargo[];

  data_publicacao: string | null;
  data_inscricao_inicio: string | null;
  data_inscricao_fim: string | null;
  data_prova: string | null;
  data_resultado: string | null;

  status: ConcursoStatus;

  edital_url: string | null;
  site_oficial: string | null;
  taxa_inscricao: number | null;

  estado: string | null;
  cidade: string | null;
  abrangencia: ConcursoAbrangencia;

  area: ConcursoArea;

  destaque: boolean;
  visualizacoes: number;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

export interface ConcursoFormData {
  titulo: string;
  orgao: string;
  banca?: string;
  area: ConcursoArea;
  abrangencia: ConcursoAbrangencia;
  estado?: string;
  cidade?: string;

  vagas_total?: number;
  vagas_imediatas?: number;
  vagas_cr?: number;
  salario_min?: number;
  salario_max?: number;
  escolaridade?: string;
  cargos?: ConcursoCargo[];

  data_publicacao?: string;
  data_inscricao_inicio?: string;
  data_inscricao_fim?: string;
  data_prova?: string;
  data_resultado?: string;

  edital_url?: string;
  site_oficial?: string;
  taxa_inscricao?: number;

  destaque?: boolean;
}
```

## 2.2 Server Actions para Concursos

### Tarefa 2.2.1: Actions CRUD

**Arquivo:** `src/app/admin/concursos/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ConcursoFormData, ConcursoStatus } from "@/types/concurso";

// Função para gerar slug
function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Função para calcular status automaticamente
function calculateStatus(concurso: ConcursoFormData): ConcursoStatus {
  const now = new Date();

  if (
    concurso.data_inscricao_inicio &&
    new Date(concurso.data_inscricao_inicio) > now
  ) {
    return "previsto";
  }

  if (concurso.data_inscricao_inicio && concurso.data_inscricao_fim) {
    const inicio = new Date(concurso.data_inscricao_inicio);
    const fim = new Date(concurso.data_inscricao_fim);

    if (now >= inicio && now <= fim) {
      return "inscricoes_abertas";
    }

    if (now > fim) {
      if (concurso.data_prova && new Date(concurso.data_prova) > now) {
        return "inscricoes_encerradas";
      }
      if (concurso.data_resultado && new Date(concurso.data_resultado) > now) {
        return "em_andamento";
      }
      return "encerrado";
    }
  }

  return "previsto";
}

// Criar concurso
export async function createConcurso(data: ConcursoFormData) {
  const supabase = await createClient();

  const slug = generateSlug(data.titulo);
  const status = calculateStatus(data);

  const { data: concurso, error } = await supabase
    .from("concursos")
    .insert({
      ...data,
      slug,
      status,
      cargos: data.cargos || [],
      vagas_total: data.vagas_total || 0,
      vagas_imediatas: data.vagas_imediatas || 0,
      vagas_cr: data.vagas_cr || 0,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/concursos");
  return { data: concurso };
}

// Atualizar concurso
export async function updateConcurso(
  id: string,
  data: Partial<ConcursoFormData>,
) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  // Recalcular slug se título mudou
  if (data.titulo) {
    updates.slug = generateSlug(data.titulo);
  }

  // Recalcular status se datas mudaram
  if (
    data.data_inscricao_inicio ||
    data.data_inscricao_fim ||
    data.data_prova ||
    data.data_resultado
  ) {
    // Buscar dados atuais para merge
    const { data: current } = await supabase
      .from("concursos")
      .select("*")
      .eq("id", id)
      .single();

    if (current) {
      updates.status = calculateStatus({ ...current, ...data });
    }
  }

  const { data: concurso, error } = await supabase
    .from("concursos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/concursos");
  revalidatePath(`/concursos/${concurso.slug}`);
  return { data: concurso };
}

// Deletar concurso
export async function deleteConcurso(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("concursos").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/concursos");
  return { success: true };
}

// Listar concursos com filtros
export async function listConcursos(filters?: {
  status?: string;
  area?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("concursos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.area) {
    query = query.eq("area", filters.area);
  }

  if (filters?.search) {
    query = query.or(
      `titulo.ilike.%${filters.search}%,orgao.ilike.%${filters.search}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return {
    data,
    count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

// Atualizar status de todos os concursos (CRON job)
export async function updateAllConcursosStatus() {
  const supabase = await createClient();

  const { data: concursos } = await supabase
    .from("concursos")
    .select("*")
    .neq("status", "encerrado");

  if (!concursos) return;

  for (const concurso of concursos) {
    const newStatus = calculateStatus(concurso);
    if (newStatus !== concurso.status) {
      await supabase
        .from("concursos")
        .update({ status: newStatus })
        .eq("id", concurso.id);
    }
  }

  revalidatePath("/admin/concursos");
}
```

## 2.3 Interface de Listagem

### Tarefa 2.3.1: Página de listagem de concursos

**Arquivo:** `src/app/admin/concursos/page.tsx`

**Requisitos:**

- Tabela com colunas: Título, Órgão, Status, Vagas, Inscrições até, Ações
- Filtros: Status (dropdown), Área (dropdown), Busca (input)
- Badges coloridos para status:
  - `previsto` → Cinza
  - `inscricoes_abertas` → Verde
  - `inscricoes_encerradas` → Amarelo
  - `em_andamento` → Azul
  - `encerrado` → Vermelho
- Paginação
- Botão "Novo Concurso" → `/admin/concursos/create`
- Menu de ações: Editar, Ver no site, Duplicar, Excluir

### Tarefa 2.3.2: Componente de Status Badge

**Arquivo:** `src/components/admin/ConcursoStatusBadge.tsx`

```typescript
// Mapear status para cores e labels em português
const statusConfig = {
  previsto: { label: "Previsto", variant: "secondary" },
  inscricoes_abertas: { label: "Inscrições Abertas", variant: "success" },
  inscricoes_encerradas: { label: "Inscrições Encerradas", variant: "warning" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  encerrado: { label: "Encerrado", variant: "destructive" },
};
```

## 2.4 Formulário de Criação/Edição

### Tarefa 2.4.1: Página de criação

**Arquivo:** `src/app/admin/concursos/create/page.tsx`

**Requisitos do formulário:**

1. **Seção Identificação:**
   - Título (obrigatório)
   - Órgão (obrigatório, com sugestões autocomplete)
   - Banca (opcional, com sugestões autocomplete)
   - Área (select com opções)
   - Abrangência (radio: Nacional/Estadual/Municipal)
   - Estado/Cidade (condicionais)

2. **Seção Vagas e Remuneração:**
   - Vagas Imediatas
   - Vagas CR
   - Total de Vagas (calculado automaticamente)
   - Salário Mínimo / Máximo
   - Escolaridade (select)

3. **Seção Cargos (Dinâmica):**
   - Adicionar cargo: Nome, Vagas, Salário
   - Lista de cargos adicionados
   - Botão para adicionar mais

4. **Seção Datas:**
   - Data de Publicação (datepicker)
   - Período de Inscrição (range picker)
   - Data da Prova
   - Data do Resultado
   - Status (calculado automaticamente, mas editável)

5. **Seção Links:**
   - URL do Edital (com validação)
   - Site Oficial
   - Taxa de Inscrição

6. **Seção Opções:**
   - Toggle "Destacar na Home"

### Tarefa 2.4.2: Página de edição

**Arquivo:** `src/app/admin/concursos/[id]/edit/page.tsx`

- Reutilizar componentes do formulário de criação
- Pré-popular com dados existentes
- Botão "Salvar Alterações"
- Botão "Excluir" com confirmação

## 2.5 Atualizar Sidebar Admin

### Tarefa 2.5.1: Adicionar link de Concursos

**Arquivo:** `src/components/admin/AdminSidebar.tsx`

```typescript
// Adicionar ao array de links:
{
  title: "Concursos",
  url: "/admin/concursos",
  icon: Trophy, // de lucide-react
  badge: null // ou número de concursos ativos
}
```

---

# 🟡 FASE 3: DASHBOARD AVANÇADO

**Tempo estimado:** 3-4 horas  
**Dependências:** Fase 1, Fase 2

## 3.1 Métricas Expandidas

### Tarefa 3.1.1: Atualizar Dashboard principal

**Arquivo:** `src/app/admin/page.tsx`

**Novas métricas a adicionar:**

1. **Cards de Resumo:**
   - Total de Posts
   - Posts Publicados (este mês)
   - Total de Concursos
   - Concursos com Inscrições Abertas

2. **Alertas Importantes (Nova seção):**
   - Concursos com inscrição encerrando em 3 dias
   - Posts agendados para publicação
   - Posts em rascunho há mais de 7 dias

3. **Gráficos (Nova seção):**
   - Publicações por mês (últimos 6 meses) - Gráfico de barras
   - Concursos por área - Gráfico de pizza

4. **Posts Recentes:**
   - Lista dos 5 últimos posts criados/editados

5. **Concursos em Destaque:**
   - Lista dos 5 concursos mais visualizados

## 3.2 Componentes de Gráfico

### Tarefa 3.2.1: Instalar dependência de gráficos

```bash
npm install recharts
```

### Tarefa 3.2.2: Componente de gráfico de barras

**Arquivo:** `src/components/admin/charts/PostsPerMonthChart.tsx`

### Tarefa 3.2.3: Componente de gráfico de pizza

**Arquivo:** `src/components/admin/charts/ConcursosByAreaChart.tsx`

## 3.3 Componente de Alertas

### Tarefa 3.3.1: Alertas do Dashboard

**Arquivo:** `src/components/admin/DashboardAlerts.tsx`

```typescript
// Tipos de alerta:
// - 'warning': Concurso com inscrição encerrando
// - 'info': Post agendado
// - 'muted': Rascunho antigo
```

---

# 🟡 FASE 4: EDITOR DE POSTS MELHORADO

**Tempo estimado:** 4-5 horas  
**Dependências:** Fase 1

## 4.1 Blocos Customizados para TipTap

### Tarefa 4.1.1: Bloco "Card de Concurso"

**Arquivo:** `src/components/editor/extensions/ConcursoCardBlock.tsx`

**Funcionalidade:**

- Inserir preview de um concurso no meio do texto
- Buscar concurso por ID
- Exibir: Título, Órgão, Vagas, Salário, Status, Link

### Tarefa 4.1.2: Bloco "Leia Também"

**Arquivo:** `src/components/editor/extensions/RelatedPostBlock.tsx`

**Funcionalidade:**

- Inserir link estilizado para outro post
- Buscar post por título
- Exibir: Thumbnail, Título, Excerpt

### Tarefa 4.1.3: Bloco "Tabela de Vagas"

**Arquivo:** `src/components/editor/extensions/VagasTableBlock.tsx`

**Funcionalidade:**

- Inserir tabela formatada de vagas
- Colunas: Cargo, Vagas, Salário, Escolaridade
- Dados vindos do concurso vinculado ou inserção manual

### Tarefa 4.1.4: Bloco "Linha do Tempo"

**Arquivo:** `src/components/editor/extensions/TimelineBlock.tsx`

**Funcionalidade:**

- Inserir timeline visual de eventos
- Adicionar: Data, Título, Descrição
- Exibir cronograma do concurso

## 4.2 Auto-Save

### Tarefa 4.2.1: Implementar debounce auto-save

**Arquivo:** `src/hooks/useAutoSave.ts`

```typescript
// Hook que salva rascunho automaticamente
// - Debounce de 3 segundos após última edição
// - Indicador visual "Salvando..." / "Salvo"
// - Fallback para localStorage se offline
```

## 4.3 Vinculação com Concurso

### Tarefa 4.3.1: Seletor de concurso no painel lateral

**Arquivo:** `src/components/admin/posts/ConcursoSelector.tsx`

**Funcionalidade:**

- Dropdown/Combobox para buscar concurso
- Vincular post ao concurso (foreign key)
- Exibir info resumida do concurso selecionado

---

# 🟡 FASE 5: SEO TOOLKIT

**Tempo estimado:** 3-4 horas  
**Dependências:** Fase 4

## 5.1 Campos de SEO no Editor

### Tarefa 5.1.1: Painel de SEO

**Arquivo:** `src/components/admin/posts/SeoPanel.tsx`

**Campos:**

- Meta Title (contador de caracteres, máx 60)
- Meta Description (contador, máx 160)
- Slug (editável, preview da URL)
- Imagem OG (preview)
- Canonical URL (opcional)

### Tarefa 5.1.2: Score de SEO em tempo real

**Arquivo:** `src/components/admin/posts/SeoScore.tsx`

**Verificações:**

- Título tem a palavra-chave?
- Meta description definida?
- Tamanho ideal do título?
- Imagem de capa definida?
- Texto tem mínimo de 300 palavras?
- Possui headings (H2, H3)?
- Possui links internos?

## 5.2 Sitemap Dinâmico

### Tarefa 5.2.1: Gerar sitemap.xml

**Arquivo:** `src/app/sitemap.ts`

```typescript
// Gerar sitemap dinâmico com:
// - Todas as páginas estáticas
// - Todos os posts publicados
// - Todos os concursos
// - Todas as categorias
// - Lastmod baseado em updated_at
```

## 5.3 Schema Markup

### Tarefa 5.3.1: JSON-LD para Posts

**Arquivo:** `src/components/seo/ArticleSchema.tsx`

```typescript
// Schema Article para posts
// - headline, author, datePublished, dateModified
// - image, publisher
```

### Tarefa 5.3.2: JSON-LD para Concursos

**Arquivo:** `src/components/seo/JobPostingSchema.tsx`

```typescript
// Schema JobPosting adaptado para concursos
// - title, hiringOrganization, employmentType
// - datePosted, validThrough
// - baseSalary, jobLocation
```

---

# 🟢 FASE 6: GESTÃO DE USUÁRIOS

**Tempo estimado:** 3-4 horas  
**Dependências:** Fase 1

## 6.1 Lista de Usuários

### Tarefa 6.1.1: Página de listagem

**Arquivo:** `src/app/admin/users/page.tsx`

**Colunas:**

- Avatar + Nome
- Email
- Role (badge colorido)
- Último acesso
- Status (ativo/inativo)
- Ações

**Funcionalidades:**

- Filtro por role
- Busca por nome/email
- Alterar role (dropdown inline)
- Ver atividades do usuário

## 6.2 Log de Atividades

### Tarefa 6.2.1: Página de logs

**Arquivo:** `src/app/admin/logs/page.tsx`

**Exibição:**

- Timeline de atividades
- Filtros: Usuário, Tipo de ação, Período
- Detalhes expandíveis

### Tarefa 6.2.2: Hook para registrar atividades

**Arquivo:** `src/hooks/useActivityLog.ts`

```typescript
// Usar em todas as actions:
// await logActivity({
//   action: 'create',
//   entity_type: 'post',
//   entity_id: post.id,
//   entity_title: post.title
// })
```

---

# 🟢 FASE 7: FERRAMENTAS DE PRODUTIVIDADE

**Tempo estimado:** 4-5 horas  
**Dependências:** Fase 2, Fase 4

## 7.1 Calendário Editorial

### Tarefa 7.1.1: Instalar dependência

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

### Tarefa 7.1.2: Página do calendário

**Arquivo:** `src/app/admin/calendar/page.tsx`

**Funcionalidades:**

- Visualização mensal/semanal
- Eventos:
  - Posts agendados (verde)
  - Rascunhos com prazo (amarelo)
  - Datas de concursos (azul)
- Drag & drop para reagendar
- Click para ver/editar

## 7.2 Kanban de Posts

### Tarefa 7.2.1: Instalar dependência

```bash
npm install @hello-pangea/dnd
```

### Tarefa 7.2.2: Página do Kanban

**Arquivo:** `src/app/admin/kanban/page.tsx`

**Colunas:**

- Ideias (novo status)
- Rascunho
- Em Revisão
- Agendado
- Publicado

**Funcionalidades:**

- Drag & drop entre colunas
- Atualização automática de status
- Cards com: Título, Categoria, Autor, Data

## 7.3 Templates de Posts

### Tarefa 7.3.1: Tabela de templates

**Arquivo:** `supa/migrations/009_create_post_templates.sql`

```sql
CREATE TABLE IF NOT EXISTS public.post_templates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

### Tarefa 7.3.2: Gestão de templates

**Arquivo:** `src/app/admin/templates/page.tsx`

**Templates sugeridos:**

- "Abertura de Edital" - Com estrutura padrão para notícia de novo concurso
- "Resultado de Concurso" - Template para divulgação de resultados
- "Dica de Estudo" - Estrutura para artigos de dicas
- "Cronograma Atualizado" - Para atualizações de datas

---

# 🟢 FASE 8: AUTOMAÇÕES COM IA

**Tempo estimado:** 3-4 horas  
**Dependências:** Fase 4

## 8.1 Gerador de Títulos

### Tarefa 8.1.1: API Route para geração

**Arquivo:** `src/app/api/ai/generate-title/route.ts`

**Entrada:** Conteúdo do post (primeiros 500 caracteres)
**Saída:** 3 sugestões de títulos otimizados para SEO

### Tarefa 8.1.2: Componente no editor

**Arquivo:** `src/components/admin/posts/TitleSuggestions.tsx`

**UI:**

- Botão "Sugerir Títulos ✨"
- Modal com 3 opções
- Click para aplicar

## 8.2 Gerador de Tags Automático

### Tarefa 8.2.1: API Route

**Arquivo:** `src/app/api/ai/suggest-tags/route.ts`

**Entrada:** Título + Conteúdo resumido
**Saída:** 5-10 tags sugeridas

### Tarefa 8.2.2: Integração no editor

- Exibir tags sugeridas como chips
- Click para adicionar ao post

## 8.3 Resumo Automático

### Tarefa 8.3.1: API Route

**Arquivo:** `src/app/api/ai/generate-excerpt/route.ts`

**Entrada:** Conteúdo completo
**Saída:** Excerpt de 160 caracteres (meta description)

---

# 🔵 FASE 9: BANCO DE PROVAS

**Tempo estimado:** 3-4 horas  
**Dependências:** Fase 1, Fase 2

## 9.1 Upload de Provas

### Tarefa 9.1.1: Página de upload

**Arquivo:** `src/app/admin/provas/upload/page.tsx`

**Formulário:**

- Seletor de concurso (ou novo)
- Órgão, Banca, Ano, Cargo
- Upload de PDF (prova)
- Upload de PDF (gabarito)
- Upload de PDF (gabarito comentado - opcional)

## 9.2 Listagem e Filtros

### Tarefa 9.2.1: Página de listagem

**Arquivo:** `src/app/admin/provas/page.tsx`

**Filtros:**

- Por órgão
- Por banca
- Por ano
- Por área

## 9.3 Página Pública

### Tarefa 9.3.1: Lista de provas para usuários

**Arquivo:** `src/app/provas/page.tsx`

**Funcionalidades:**

- Busca e filtros
- Cards de provas
- Contador de downloads
- Botões de download

---

# 🔵 FASE 10: CONFIGURAÇÕES DO SISTEMA

**Tempo estimado:** 2-3 horas  
**Dependências:** Fase 1

## 10.1 Página de Configurações

### Tarefa 10.1.1: Interface de settings

**Arquivo:** `src/app/admin/settings/page.tsx`

**Seções:**

1. **Identidade do Site:**
   - Nome do site
   - Descrição
   - Logo (upload)
   - Favicon

2. **Redes Sociais:**
   - Twitter URL
   - Facebook URL
   - Instagram URL
   - Telegram URL

3. **Analytics:**
   - Google Analytics ID
   - Google Tag Manager ID
   - Verificação Google Search Console

4. **Aparência:**
   - Cor primária (color picker)
   - Cor secundária

5. **Backup:**
   - Exportar dados (JSON)
   - Status do último backup

---

# 📋 CHECKLIST DE COMPONENTES UI NECESSÁRIOS

## Shadcn UI a instalar:

```bash
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add popover
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add progress
npx shadcn@latest add alert
npx shadcn@latest add skeleton
npx shadcn@latest add scroll-area
```

---

# 🗓️ CRONOGRAMA SUGERIDO

| Semana | Fases       | Entregas                         |
| ------ | ----------- | -------------------------------- |
| **1**  | Fase 1 + 2  | Database + CRUD Concursos        |
| **2**  | Fase 3 + 4  | Dashboard + Editor melhorado     |
| **3**  | Fase 5 + 6  | SEO Toolkit + Gestão de Usuários |
| **4**  | Fase 7 + 8  | Produtividade + IA               |
| **5**  | Fase 9 + 10 | Banco de Provas + Settings       |

---

# 🔍 ORDEM DE EXECUÇÃO PARA IAs

## Regra Geral:

1. **Sempre executar migrations na ordem numérica**
2. **Criar tipos antes de componentes**
3. **Criar server actions antes de páginas**
4. **Testar cada feature isoladamente antes de prosseguir**

## Sequência Detalhada:

### Bloco 1 (Database):

```
1. Executar 001_create_concursos.sql
2. Executar 002_create_files.sql
3. Executar 003_create_admin_settings.sql
4. Executar 004_create_activity_logs.sql
5. Executar 005_alter_profiles_add_role.sql
6. Executar 006_alter_posts_improvements.sql
7. Executar 007_create_provas.sql
8. Executar 008_create_favoritos.sql
9. Executar storage_setup.sql
10. Verificar se todas as tabelas foram criadas
```

### Bloco 2 (Concursos):

```
1. Criar src/types/concurso.ts
2. Criar src/app/admin/concursos/actions.ts
3. Criar src/components/admin/ConcursoStatusBadge.tsx
4. Criar src/app/admin/concursos/page.tsx
5. Criar src/app/admin/concursos/create/page.tsx
6. Criar src/app/admin/concursos/[id]/edit/page.tsx
7. Atualizar AdminSidebar com link de Concursos
8. Testar: criar, editar, listar, deletar concurso
```

### Bloco 3 (Dashboard):

```
1. Instalar recharts
2. Criar componentes de gráficos
3. Criar DashboardAlerts.tsx
4. Atualizar src/app/admin/page.tsx
5. Testar visualização completa
```

### Bloco 4 (Editor):

```
1. Criar blocos customizados TipTap
2. Implementar useAutoSave
3. Criar ConcursoSelector
4. Integrar ao editor existente
5. Testar criação de post com novos blocos
```

### Bloco 5 (SEO):

```
1. Criar SeoPanel e SeoScore
2. Integrar ao editor
3. Criar sitemap.ts
4. Criar schemas JSON-LD
5. Testar meta tags e sitemap
```

### Bloco 6 (Usuários):

```
1. Criar listagem de usuários
2. Implementar alteração de roles
3. Criar página de logs
4. Implementar hook de logging
5. Integrar logging em todas as actions
```

### Bloco 7 (Produtividade):

```
1. Instalar dependências de calendário
2. Criar página do calendário
3. Instalar dnd-kit
4. Criar página do Kanban
5. Criar sistema de templates
6. Testar todas as features
```

### Bloco 8 (IA):

```
1. Criar API routes de IA
2. Criar componentes de sugestão
3. Integrar ao editor
4. Testar geração de títulos, tags, excerpts
```

### Bloco 9 (Provas):

```
1. Criar páginas admin de provas
2. Criar página pública
3. Testar upload e download
```

### Bloco 10 (Settings):

```
1. Criar interface de configurações
2. Implementar persistência
3. Testar todas as opções
```

---

# ✅ VALIDAÇÃO FINAL

Após cada fase, verificar:

- [ ] Build sem erros (`npm run build`)
- [ ] Lint sem warnings críticos
- [ ] Funcionalidades testadas manualmente
- [ ] RLS policies funcionando
- [ ] Responsividade mobile
- [ ] Dark mode funcionando

---

**FIM DO PLANO DE IMPLEMENTAÇÃO**
