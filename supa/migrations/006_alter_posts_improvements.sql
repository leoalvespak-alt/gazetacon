-- =============================================
-- MIGRATION 006: Melhorias na tabela posts
-- =============================================

-- Adicionar campos de SEO
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Adicionar campos de agendamento e métricas
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Adicionar vinculação com concurso
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS concurso_id UUID REFERENCES public.concursos(id);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON public.posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_concurso ON public.posts(concurso_id);
CREATE INDEX IF NOT EXISTS idx_posts_views ON public.posts(views DESC);
