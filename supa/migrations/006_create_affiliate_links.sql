-- Tabela de Links de Afiliados
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_affiliate_links_slug ON affiliate_links(slug);

-- RLS
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Anyone can redirect" ON affiliate_links;
CREATE POLICY "Anyone can redirect" ON affiliate_links FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage links" ON affiliate_links;
CREATE POLICY "Admins can manage links" ON affiliate_links FOR ALL USING (auth.uid() IS NOT NULL);

-- Função para incrementar clicks
CREATE OR REPLACE FUNCTION increment_affiliate_click(link_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliate_links SET clicks = clicks + 1 WHERE slug = link_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
