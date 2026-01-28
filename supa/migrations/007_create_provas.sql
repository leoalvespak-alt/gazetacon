-- =============================================
-- MIGRATION 007: Criar tabela de provas anteriores
-- =============================================

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
  prova_url TEXT,
  gabarito_url TEXT,
  gabarito_comentado_url TEXT,
  
  -- Estatísticas
  total_questoes INTEGER DEFAULT 0,
  assuntos_mais_cobrados JSONB DEFAULT '[]',
  
  -- Metadados
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_provas_orgao ON public.provas(orgao);
CREATE INDEX IF NOT EXISTS idx_provas_banca ON public.provas(banca);
CREATE INDEX IF NOT EXISTS idx_provas_ano ON public.provas(ano DESC);
CREATE INDEX IF NOT EXISTS idx_provas_concurso ON public.provas(concurso_id);

-- RLS
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;

-- Policy: Provas públicas para todos
CREATE POLICY "provas_select_public" ON public.provas
  FOR SELECT USING (true);

-- Policy: Usuários autenticados podem gerenciar
CREATE POLICY "provas_insert_authenticated" ON public.provas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "provas_update_authenticated" ON public.provas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "provas_delete_authenticated" ON public.provas
  FOR DELETE USING (auth.role() = 'authenticated');
