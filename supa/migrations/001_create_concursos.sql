-- =============================================
-- MIGRATION 001: Criar tabela de concursos
-- =============================================

CREATE TABLE IF NOT EXISTS public.concursos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  -- Identificação
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  orgao TEXT NOT NULL,
  banca TEXT,
  
  -- Vagas e Remuneração
  vagas_total INTEGER DEFAULT 0,
  vagas_imediatas INTEGER DEFAULT 0,
  vagas_cr INTEGER DEFAULT 0,
  salario_min DECIMAL(12, 2),
  salario_max DECIMAL(12, 2),
  
  -- Requisitos
  escolaridade TEXT,
  cargos JSONB DEFAULT '[]',
  
  -- Datas Importantes
  data_publicacao DATE,
  data_inscricao_inicio DATE,
  data_inscricao_fim DATE,
  data_prova DATE,
  data_resultado DATE,
  
  -- Status
  status TEXT DEFAULT 'previsto',
  
  -- Links e Arquivos
  edital_url TEXT,
  site_oficial TEXT,
  taxa_inscricao DECIMAL(8, 2),
  
  -- Localização
  estado TEXT,
  cidade TEXT,
  abrangencia TEXT DEFAULT 'nacional',
  
  -- Área/Categoria
  area TEXT,
  
  -- Metadados
  destaque BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  author_id UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_concursos_status ON public.concursos(status);
CREATE INDEX IF NOT EXISTS idx_concursos_area ON public.concursos(area);
CREATE INDEX IF NOT EXISTS idx_concursos_orgao ON public.concursos(orgao);
CREATE INDEX IF NOT EXISTS idx_concursos_data_inscricao_fim ON public.concursos(data_inscricao_fim);
CREATE INDEX IF NOT EXISTS idx_concursos_slug ON public.concursos(slug);

-- RLS
ALTER TABLE public.concursos ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública
CREATE POLICY "concursos_select_public" ON public.concursos
  FOR SELECT USING (true);

-- Policy: Insert/Update/Delete para usuários autenticados
CREATE POLICY "concursos_insert_authenticated" ON public.concursos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "concursos_update_authenticated" ON public.concursos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "concursos_delete_authenticated" ON public.concursos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_concursos_updated_at ON public.concursos;
CREATE TRIGGER update_concursos_updated_at
  BEFORE UPDATE ON public.concursos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
