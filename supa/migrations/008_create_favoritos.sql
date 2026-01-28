-- =============================================
-- MIGRATION 008: Criar tabela de favoritos
-- =============================================

CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id UUID REFERENCES public.concursos(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  
  -- Constraint: Um dos dois deve ser preenchido
  CONSTRAINT chk_favorito_tipo CHECK (
    (concurso_id IS NOT NULL AND post_id IS NULL) OR
    (concurso_id IS NULL AND post_id IS NOT NULL)
  )
);

-- Índices únicos para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_concurso 
  ON public.favoritos(user_id, concurso_id) 
  WHERE concurso_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_post 
  ON public.favoritos(user_id, post_id) 
  WHERE post_id IS NOT NULL;

-- Índices de busca
CREATE INDEX IF NOT EXISTS idx_favoritos_user ON public.favoritos(user_id);

-- RLS
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas seus favoritos
CREATE POLICY "favoritos_select_own" ON public.favoritos
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuários gerenciam seus próprios favoritos
CREATE POLICY "favoritos_insert_own" ON public.favoritos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favoritos_delete_own" ON public.favoritos
  FOR DELETE USING (auth.uid() = user_id);
