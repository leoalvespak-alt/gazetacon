-- =============================================
-- MIGRATION 005: Adicionar roles ao profiles
-- =============================================

-- Adicionar coluna de role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Adicionar mais colunas úteis
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc', now());

-- Atualizar o primeiro usuário como admin (se existir)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM public.profiles ORDER BY updated_at ASC LIMIT 1)
AND role = 'user';

-- Comentário: Valores permitidos para role:
-- 'super_admin', 'admin', 'editor', 'author', 'moderator', 'user'
