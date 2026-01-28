-- Configuração de Buckets do Supabase Storage

-- 1. Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('covers', 'covers', true),
  ('editais', 'editais', true),
  ('provas', 'provas', true),
  ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar RLS (Row Level Security) para os buckets
-- Permitir acesso público de leitura
CREATE POLICY "Acesso Público de Leitura"
ON storage.objects FOR SELECT
USING (true);

-- Permitir upload apenas para usuários autenticados (Admin)
CREATE POLICY "Upload Autenticado"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir exclusão apenas para o autor ou admins
CREATE POLICY "Exclusão Autenticada"
ON storage.objects FOR DELETE
TO authenticated
USING (true);

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Atualização Autenticada"
ON storage.objects FOR UPDATE
TO authenticated
USING (true);
