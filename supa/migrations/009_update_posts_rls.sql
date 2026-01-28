-- =============================================
-- Migration: Corregir políticas RLS para posts, categorias e tags
-- =============================================

-- 1. POSTS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Limpar políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Staff can view all posts" ON posts;
DROP POLICY IF EXISTS "Staff can insert posts" ON posts;
DROP POLICY IF EXISTS "Staff can update posts" ON posts;
DROP POLICY IF EXISTS "Staff can delete posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON posts;

-- P1: Qualquer pessoa pode ver posts publicados
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (published = true);

-- P2: Equipe (admin, editor, author) pode ver todos os posts (incluindo rascunhos)
CREATE POLICY "Staff can view all posts" ON posts
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'editor', 'author')
      )
    )
  );

-- P3: Equipe pode criar posts
-- Nota: Usamos WITH CHECK para garantir que o autor_id seja validado se necessário
CREATE POLICY "Staff can insert posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'editor', 'author')
      )
    )
  );

-- P4: Admin/Editor pode editar qualquer um, Autor apenas os seus
CREATE POLICY "Staff can update posts" ON posts
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'editor') OR (role = 'author' AND author_id = auth.uid()))
      )
    )
  );

-- P5: Admin/Editor pode deletar qualquer um, Autor apenas os seus
CREATE POLICY "Staff can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'editor') OR (role = 'author' AND author_id = auth.uid()))
      )
    )
  );

-- 2. CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Staff can manage categories" ON categories;

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage categories" ON categories
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'editor')
      )
    )
  );

-- 3. TAGS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Staff can manage tags" ON tags;

CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage tags" ON tags
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'editor')
      )
    )
  );
