-- =============================================
-- MIGRATION 002: Criar tabela de arquivos/mídias
-- =============================================

CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  storage_path TEXT NOT NULL,
  public_url TEXT,
  
  folder TEXT DEFAULT 'uploads',
  alt_text TEXT,
  
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_files_folder ON public.files(folder);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by);

-- RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Policy: Arquivos públicos para leitura
CREATE POLICY "files_select_public" ON public.files
  FOR SELECT USING (true);

-- Policy: Usuários autenticados podem fazer upload
CREATE POLICY "files_insert_authenticated" ON public.files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "files_delete_owner" ON public.files
  FOR DELETE USING (auth.uid() = uploaded_by);
