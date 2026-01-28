-- =============================================
-- MIGRATIONS CONSOLIDADAS - GAZETACON
-- Execute este arquivo no Supabase SQL Editor
-- =============================================

-- 1. Tabela de Concursos
CREATE TABLE IF NOT EXISTS concursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  orgao TEXT NOT NULL,
  banca TEXT,
  
  vagas_total INTEGER DEFAULT 0,
  vagas_imediatas INTEGER DEFAULT 0,
  vagas_cr INTEGER DEFAULT 0,
  salario_min DECIMAL(12,2),
  salario_max DECIMAL(12,2),
  
  escolaridade TEXT,
  cargos JSONB DEFAULT '[]',
  
  data_publicacao DATE,
  data_inscricao_inicio DATE,
  data_inscricao_fim DATE,
  data_prova DATE,
  data_resultado DATE,
  
  status TEXT NOT NULL DEFAULT 'previsto' CHECK (status IN ('previsto', 'inscricoes_abertas', 'inscricoes_encerradas', 'em_andamento', 'encerrado')),
  
  edital_url TEXT,
  site_oficial TEXT,
  taxa_inscricao DECIMAL(10,2),
  
  estado CHAR(2),
  cidade TEXT,
  abrangencia TEXT DEFAULT 'nacional' CHECK (abrangencia IN ('nacional', 'estadual', 'municipal')),
  
  area TEXT CHECK (area IN ('fiscal', 'policial', 'juridica', 'administrativa', 'saude', 'educacao', 'bancaria', 'ti', 'outra')),
  
  destaque BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_concursos_slug ON concursos(slug);
CREATE INDEX IF NOT EXISTS idx_concursos_status ON concursos(status);
CREATE INDEX IF NOT EXISTS idx_concursos_area ON concursos(area);
CREATE INDEX IF NOT EXISTS idx_concursos_destaque ON concursos(destaque);

ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;

-- Manuseio Seguro de Políticas (Remover antes de criar)
DROP POLICY IF EXISTS "Anyone can view concursos" ON concursos;
DROP POLICY IF EXISTS "Authenticated users can insert concursos" ON concursos;
DROP POLICY IF EXISTS "Authenticated users can update concursos" ON concursos;
DROP POLICY IF EXISTS "Admins can delete concursos" ON concursos;

CREATE POLICY "Anyone can view concursos" ON concursos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert concursos" ON concursos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update concursos" ON concursos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete concursos" ON concursos FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. Tabela de Provas
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

CREATE INDEX IF NOT EXISTS idx_provas_orgao ON provas(orgao);
CREATE INDEX IF NOT EXISTS idx_provas_ano ON provas(ano DESC);
CREATE INDEX IF NOT EXISTS idx_provas_banca ON provas(banca);
CREATE INDEX IF NOT EXISTS idx_provas_concurso_id ON provas(concurso_id);

ALTER TABLE provas ENABLE ROW LEVEL SECURITY;

-- Manuseio Seguro de Políticas
DROP POLICY IF EXISTS "Anyone can view provas" ON provas;
DROP POLICY IF EXISTS "Authenticated users can insert provas" ON provas;
DROP POLICY IF EXISTS "Authenticated users can update provas" ON provas;
DROP POLICY IF EXISTS "Admins can delete provas" ON provas;

CREATE POLICY "Anyone can view provas" ON provas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert provas" ON provas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update provas" ON provas FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete provas" ON provas FOR DELETE USING (auth.uid() IS NOT NULL);

-- Função para incrementar downloads
CREATE OR REPLACE FUNCTION increment_prova_download(prova_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE provas SET downloads = downloads + 1 WHERE id = prova_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Tabela de Configurações Admin
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings" ON admin_settings FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Profile role (adicionar coluna se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_sign_in'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in TIMESTAMPTZ;
  END IF;
END $$;

-- 5. Tabela de Logs de Atividade
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'concurso', 'prova', 'category', 'user', 'system')),
  entity_id TEXT,
  entity_title TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated can insert logs" ON activity_logs;

CREATE POLICY "Admins can view logs" ON activity_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Adicionar campos nos posts se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN scheduled_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE posts ADD COLUMN seo_title TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE posts ADD COLUMN seo_description TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'concurso_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN concurso_id UUID REFERENCES concursos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'author'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Confirmar sucesso
SELECT 'Migrations executadas com sucesso!' as status;
