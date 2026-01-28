-- =============================================
-- MIGRATION: Link posts to concursos
-- =============================================

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS concurso_id UUID REFERENCES public.concursos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_concurso_id ON public.posts(concurso_id);
