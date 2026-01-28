-- =============================================
-- MIGRATION 010: Calendar Features - Notes & Editorial Planning
-- =============================================

-- 1. Notas do Calendário (compartilhadas entre admins)
CREATE TABLE IF NOT EXISTS public.calendar_notes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  -- Data da nota
  note_date DATE NOT NULL,
  
  -- Conteúdo
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#3b82f6', -- Cor para identificação visual
  
  -- Tipo de nota
  note_type TEXT DEFAULT 'general', -- 'general', 'reminder', 'deadline', 'idea'
  
  -- Prioridade
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Status
  completed BOOLEAN DEFAULT false,
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Pauta Editorial (planejamento de conteúdo)
CREATE TABLE IF NOT EXISTS public.editorial_pauta (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  -- Identificação
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  
  -- Briefing
  briefing TEXT, -- Descrição detalhada do que deve ser abordado
  keywords TEXT[], -- Palavras-chave para SEO
  target_audience TEXT, -- Público-alvo específico
  content_type TEXT DEFAULT 'artigo', -- 'artigo', 'noticia', 'tutorial', 'lista', 'analise'
  
  -- Referências
  reference_links TEXT[], -- Links de referência para pesquisa
  inspiration_notes TEXT, -- Notas de inspiração
  
  -- Relacionamentos
  category_id UUID REFERENCES public.categories(id),
  concurso_id UUID REFERENCES public.concursos(id),
  
  -- Datas
  target_date DATE, -- Data alvo para publicação
  
  -- Status do fluxo
  status TEXT DEFAULT 'idea', -- 'idea', 'approved', 'in_progress', 'review', 'scheduled', 'published', 'archived'
  
  -- Responsáveis
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Se foi transformado em post
  post_id UUID REFERENCES public.posts(id),
  
  -- Estimativas
  estimated_time_hours INTEGER, -- Tempo estimado em horas
  word_count_target INTEGER, -- Meta de palavras
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. Comentários na Pauta (para colaboração)
CREATE TABLE IF NOT EXISTS public.pauta_comments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pauta_id UUID REFERENCES public.editorial_pauta(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_calendar_notes_date ON public.calendar_notes(note_date);
CREATE INDEX IF NOT EXISTS idx_calendar_notes_type ON public.calendar_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_editorial_pauta_status ON public.editorial_pauta(status);
CREATE INDEX IF NOT EXISTS idx_editorial_pauta_target_date ON public.editorial_pauta(target_date);
CREATE INDEX IF NOT EXISTS idx_editorial_pauta_category ON public.editorial_pauta(category_id);
CREATE INDEX IF NOT EXISTS idx_pauta_comments_pauta ON public.pauta_comments(pauta_id);

-- RLS para calendar_notes
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_notes_select_authenticated" ON public.calendar_notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "calendar_notes_insert_authenticated" ON public.calendar_notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "calendar_notes_update_authenticated" ON public.calendar_notes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "calendar_notes_delete_authenticated" ON public.calendar_notes
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS para editorial_pauta
ALTER TABLE public.editorial_pauta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "editorial_pauta_select_authenticated" ON public.editorial_pauta
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "editorial_pauta_insert_authenticated" ON public.editorial_pauta
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "editorial_pauta_update_authenticated" ON public.editorial_pauta
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "editorial_pauta_delete_authenticated" ON public.editorial_pauta
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS para pauta_comments
ALTER TABLE public.pauta_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pauta_comments_select_authenticated" ON public.pauta_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pauta_comments_insert_authenticated" ON public.pauta_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "pauta_comments_delete_own" ON public.pauta_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_calendar_notes_updated_at ON public.calendar_notes;
CREATE TRIGGER update_calendar_notes_updated_at
  BEFORE UPDATE ON public.calendar_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_editorial_pauta_updated_at ON public.editorial_pauta;
CREATE TRIGGER update_editorial_pauta_updated_at
  BEFORE UPDATE ON public.editorial_pauta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
