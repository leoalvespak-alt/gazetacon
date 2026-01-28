-- =============================================
-- MIGRATION 010: Adicionar campos de banca do último concurso
-- =============================================

-- Adicionar campo para banca do último concurso (quando atual não definida)
ALTER TABLE public.concursos ADD COLUMN IF NOT EXISTS banca_ultimo_concurso TEXT;

-- Adicionar campo para indicar se a banca está definida oficialmente
ALTER TABLE public.concursos ADD COLUMN IF NOT EXISTS banca_definida BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.concursos.banca_ultimo_concurso IS 'Banca organizadora do último concurso realizado para este órgão (referência quando a banca atual não foi definida)';
COMMENT ON COLUMN public.concursos.banca_definida IS 'Indica se a banca organizadora foi oficialmente definida para este concurso';
