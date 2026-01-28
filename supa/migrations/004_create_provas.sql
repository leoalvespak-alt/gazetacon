-- =============================================
-- Migration: Criar tabela de provas
-- =============================================

CREATE TABLE IF NOT EXISTS provas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  concurso_id UUID REFERENCES concursos(id) ON DELETE SET NULL,
  
  orgao TEXT NOT NULL,
  banca TEXT,
  ano INTEGER NOT NULL,
  cargo TEXT,
  
  prova_url TEXT,
  gabarito_url TEXT,
  gabarito_comentado_url TEXT,
  
  total_questoes INTEGER DEFAULT 0,
  assuntos_mais_cobrados TEXT[] DEFAULT '{}',
  
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_provas_orgao ON provas(orgao);
CREATE INDEX IF NOT EXISTS idx_provas_ano ON provas(ano DESC);
CREATE INDEX IF NOT EXISTS idx_provas_banca ON provas(banca);
CREATE INDEX IF NOT EXISTS idx_provas_concurso_id ON provas(concurso_id);

-- Enable RLS
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can view provas"
  ON provas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert provas"
  ON provas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Provas can be updated by admins or uploaders"
  ON provas FOR UPDATE
  USING (
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Provas can be deleted by admins"
  ON provas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Função para incrementar downloads
CREATE OR REPLACE FUNCTION increment_prova_download(prova_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE provas
  SET downloads = downloads + 1
  WHERE id = prova_id;
END;
$$ LANGUAGE plpgsql;
