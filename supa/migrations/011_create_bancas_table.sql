-- =============================================
-- MIGRATION 011: Criar tabela de bancas dinâmica
-- =============================================

CREATE TABLE IF NOT EXISTS public.bancas (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  nome TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Habilitar RLS
ALTER TABLE public.bancas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "bancas_select_public" ON public.bancas FOR SELECT USING (true);
CREATE POLICY "bancas_insert_authenticated" ON public.bancas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "bancas_update_authenticated" ON public.bancas FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir bancas iniciais
INSERT INTO public.bancas (nome) VALUES 
('CESPE/CEBRASPE'),
('FCC'),
('FGV'),
('VUNESP'),
('IBFC'),
('IDECAN'),
('IADES'),
('QUADRIX'),
('AOCP'),
('FUNDATEC'),
('Instituto Consulplan'),
('FUNCAB'),
('Cesgranrio'),
('ESAF')
ON CONFLICT (nome) DO NOTHING;
