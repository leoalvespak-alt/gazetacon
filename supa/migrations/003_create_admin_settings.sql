-- =============================================
-- MIGRATION 003: Criar tabela de configurações
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Settings públicos para leitura
CREATE POLICY "settings_select_public" ON public.admin_settings
  FOR SELECT USING (true);

-- Policy: Apenas usuários autenticados podem alterar
CREATE POLICY "settings_update_authenticated" ON public.admin_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "settings_insert_authenticated" ON public.admin_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Configurações iniciais
INSERT INTO public.admin_settings (key, value, description) VALUES
  ('site_name', '"Gazeta dos Concursos"', 'Nome do site'),
  ('site_description', '"Portal de notícias e informações sobre concursos públicos"', 'Descrição para SEO'),
  ('social_links', '{"twitter": "", "facebook": "", "instagram": "", "telegram": ""}', 'Links das redes sociais'),
  ('analytics_id', '""', 'Google Analytics ID'),
  ('default_cover_image', '"/images/default-cover.jpg"', 'Imagem padrão para posts')
ON CONFLICT (key) DO NOTHING;
