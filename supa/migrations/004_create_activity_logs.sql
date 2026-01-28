-- =============================================
-- MIGRATION 004: Criar tabela de logs de atividade
-- =============================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver logs
CREATE POLICY "logs_select_authenticated" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Sistema pode criar logs
CREATE POLICY "logs_insert_authenticated" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
