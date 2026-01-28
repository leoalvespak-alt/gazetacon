-- Seed Categories for Gazeta dos Concursos
-- Execute this in the Supabase SQL Editor to create the default categories

INSERT INTO public.categories (name, slug, color) VALUES
  ('Notícias', 'noticias', '#3B82F6'),       -- Blue
  ('Dicas de Estudo', 'dicas', '#10B981'),   -- Green
  ('Por Área', 'areas', '#F59E0B'),          -- Amber
  ('Editais & Provas', 'editais', '#EF4444') -- Red
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color;

-- Verify insertion
SELECT * FROM public.categories ORDER BY name;
