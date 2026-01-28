'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { ConcursoFormData, ConcursoStatus, Concurso } from '@/types/concurso'

// Função para gerar slug
function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Função para calcular status automaticamente
function calculateStatus(concurso: Partial<ConcursoFormData>): ConcursoStatus {
  // Se o status já for um dos manuais e estiver presente, mantém ele
  const manualStatuses: ConcursoStatus[] = [
    'rumor', 
    'autorizado', 
    'comissao_formada', 
    'banca_definida', 
    'suspenso', 
    'sem_previsao'
  ];

  if (concurso.status && manualStatuses.includes(concurso.status)) {
    return concurso.status;
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  if (concurso.data_inscricao_inicio && new Date(concurso.data_inscricao_inicio) > now) {
    return concurso.status || 'previsto'
  }
  
  if (concurso.data_inscricao_inicio && concurso.data_inscricao_fim) {
    const inicio = new Date(concurso.data_inscricao_inicio)
    const fim = new Date(concurso.data_inscricao_fim)
    
    if (now >= inicio && now <= fim) {
      return 'inscricoes_abertas'
    }
    
    if (now > fim) {
      if (concurso.data_prova && new Date(concurso.data_prova) > now) {
        return 'inscricoes_encerradas'
      }
      if (concurso.data_resultado && new Date(concurso.data_resultado) > now) {
        return 'em_andamento'
      }
      return 'encerrado'
    }
  }
  
  return (concurso.status as ConcursoStatus) || 'previsto'
}

// Função para sanitizar dados (converter strings vazias em null)
function sanitizeConcursoData(data: Partial<ConcursoFormData>) {
  const sanitized = { ...data } as any
  
  // Campos de data
  const dateFields = [
    'data_publicacao',
    'data_inscricao_inicio',
    'data_inscricao_fim',
    'data_prova',
    'data_resultado'
  ]
  
  dateFields.forEach(field => {
    if (sanitized[field] === '') {
      sanitized[field] = null
    }
  })
  
  // Outros campos que devem ser null se vazios
  const nullableFields = [
    'banca', 
    'banca_ultimo_concurso',
    'estado', 
    'cidade', 
    'edital_url', 
    'site_oficial', 
    'escolaridade',
    'area'
  ]
  
  nullableFields.forEach(field => {
    if (sanitized[field] === '') {
      sanitized[field] = null
    }
  })
  
  return sanitized
}

// Criar concurso
export async function createConcurso(data: ConcursoFormData): Promise<{ data?: Concurso; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }
  
  const slug = generateSlug(data.titulo)
  const status = calculateStatus(data)
  const sanitizedData = sanitizeConcursoData(data)
  
  // Calcular total de vagas
  const vagas_total = (data.vagas_imediatas || 0) + (data.vagas_cr || 0)
  
  const { data: concurso, error } = await supabase
    .from('concursos')
    .insert({
      ...sanitizedData,
      slug,
      status,
      vagas_total,
      cargos: data.cargos || [],
      author_id: user.id
    })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar concurso:', error)
    return { error: error.message }
  }
  
  // Registrar atividade
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'create',
    entity_type: 'concurso',
    entity_id: concurso.id,
    entity_title: concurso.titulo
  })
  
  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  return { data: concurso }
}

// Atualizar concurso
export async function updateConcurso(
  id: string, 
  data: Partial<ConcursoFormData>
): Promise<{ data?: Concurso; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }
  
  // Buscar dados atuais para merge
  const { data: current } = await supabase
    .from('concursos')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!current) {
    return { error: 'Concurso não encontrado' }
  }
  
  const updates: Record<string, unknown> = { ...data }
  
  // Recalcular slug se título mudou
  if (data.titulo && data.titulo !== current.titulo) {
    updates.slug = generateSlug(data.titulo)
  }
  
  // Recalcular total de vagas
  if (data.vagas_imediatas !== undefined || data.vagas_cr !== undefined) {
    updates.vagas_total = 
      (data.vagas_imediatas ?? current.vagas_imediatas ?? 0) + 
      (data.vagas_cr ?? current.vagas_cr ?? 0)
  }
  
  // Recalcular status se datas mudaram
  const merged = { ...current, ...data }
  updates.status = calculateStatus(merged)
  
  // Sanitizar updates
  const sanitizedUpdates = sanitizeConcursoData(updates)
  
  const { data: concurso, error } = await supabase
    .from('concursos')
    .update(sanitizedUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar concurso:', error)
    return { error: error.message }
  }
  
  // Registrar atividade
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'update',
    entity_type: 'concurso',
    entity_id: concurso.id,
    entity_title: concurso.titulo,
    details: { changes: Object.keys(data) }
  })
  
  revalidatePath('/admin/concursos')
  revalidatePath(`/concursos/${concurso.slug}`)
  return { data: concurso }
}

// Deletar concurso
export async function deleteConcurso(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }
  
  // Buscar título para log
  const { data: current } = await supabase
    .from('concursos')
    .select('titulo')
    .eq('id', id)
    .single()
  
  const { error } = await supabase
    .from('concursos')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar concurso:', error)
    return { error: error.message }
  }
  
  // Registrar atividade
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'delete',
    entity_type: 'concurso',
    entity_id: id,
    entity_title: current?.titulo
  })
  
  revalidatePath('/admin/concursos')
  return { success: true }
}

// Listar concursos com filtros
export async function listConcursos(filters?: {
  status?: string
  area?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{
  data?: Concurso[]
  count?: number
  totalPages?: number
  currentPage?: number
  error?: string
}> {
  const supabase = await createServerSupabaseClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('concursos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.area && filters.area !== 'all') {
    query = query.eq('area', filters.area)
  }
  
  if (filters?.search) {
    query = query.or(`titulo.ilike.%${filters.search}%,orgao.ilike.%${filters.search}%,banca.ilike.%${filters.search}%`)
  }
  
  const { data, count, error } = await query
  
  if (error) {
    console.error('Erro ao listar concursos:', error)
    return { error: error.message }
  }
  
  return { 
    data: data || [], 
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

// Buscar concurso por ID
export async function getConcursoById(id: string): Promise<{ data?: Concurso; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('concursos')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  return { data }
}

// Buscar concurso por slug
export async function getConcursoBySlug(slug: string): Promise<{ data?: Concurso; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('concursos')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Incrementar visualizações
  await supabase
    .from('concursos')
    .update({ visualizacoes: (data.visualizacoes || 0) + 1 })
    .eq('id', data.id)
  
  return { data }
}

// Obter estatísticas para dashboard
export async function getConcursosStats(): Promise<{
  total: number
  inscricoesAbertas: number
  previstos: number
  encerrados: number
}> {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('concursos')
    .select('status')
  
  if (!data) {
    return { total: 0, inscricoesAbertas: 0, previstos: 0, encerrados: 0 }
  }
  
  return {
    total: data.length,
    inscricoesAbertas: data.filter((c: { status: string }) => 
      c.status === 'inscricoes_abertas' || c.status === 'edital_aberto'
    ).length,
    previstos: data.filter((c: { status: string }) => 
      ['previsto', 'rumor', 'autorizado', 'comissao_formada', 'banca_definida'].includes(c.status)
    ).length,
    encerrados: data.filter((c: { status: string }) => 
      c.status === 'encerrado' || c.status === 'suspenso'
    ).length
  }
}

// Concursos com inscrições encerrando em breve (alertas)
export async function getConcursosEncerrando(dias: number = 3): Promise<Concurso[]> {
  const supabase = await createServerSupabaseClient()
  
  const hoje = new Date()
  const limite = new Date()
  limite.setDate(hoje.getDate() + dias)
  
  const { data } = await supabase
    .from('concursos')
    .select('*')
    .eq('status', 'inscricoes_abertas')
    .lte('data_inscricao_fim', limite.toISOString().split('T')[0])
    .gte('data_inscricao_fim', hoje.toISOString().split('T')[0])
    .order('data_inscricao_fim', { ascending: true })
  
  return data || []
}

// Atualizar status de todos os concursos (job automático)
export async function updateAllConcursosStatus(): Promise<{ updated: number }> {
  const supabase = await createServerSupabaseClient()
  
  const { data: concursos } = await supabase
    .from('concursos')
    .select('*')
    .neq('status', 'encerrado')
  
  if (!concursos) return { updated: 0 }
  
  let updated = 0
  
  for (const concurso of concursos) {
    const newStatus = calculateStatus(concurso)
    if (newStatus !== concurso.status) {
      await supabase
        .from('concursos')
        .update({ status: newStatus })
        .eq('id', concurso.id)
      updated++
    }
  }
  
  if (updated > 0) {
    revalidatePath('/admin/concursos')
    revalidatePath('/concursos')
  }
  
  return { updated }
}

// Duplicar concurso
export async function duplicateConcurso(id: string): Promise<{ data?: Concurso; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }
  
  const { data: original } = await supabase
    .from('concursos')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!original) {
    return { error: 'Concurso não encontrado' }
  }
  
  // Remover campos únicos e criar cópia
  const copyData = { ...original }
  delete copyData.id
  delete copyData.slug
  delete copyData.created_at
  delete copyData.updated_at
  
  const newSlug = generateSlug(`${original.titulo} (cópia)`)
  
  const { data: newConcurso, error } = await supabase
    .from('concursos')
    .insert({
      ...copyData,
      titulo: `${original.titulo} (cópia)`,
      slug: newSlug,
      author_id: user.id
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/concursos')
  return { data: newConcurso }
}

// =============================================
// AÇÕES DE BANCAS
// =============================================

// Listar todas as bancas
export async function getBancas(): Promise<{ data?: string[]; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('bancas')
    .select('nome')
    .order('nome')
  
  if (error) {
    return { error: error.message }
  }
  
  return { data: data.map((b: { nome: string }) => b.nome) }
}

// Criar nova banca
export async function createBanca(nome: string): Promise<{ data?: string; error?: string }> {
  const supabase = await createServerSupabaseClient()
  
  // Verifica se já existe (case insensitive)
  const { data: existing } = await supabase
    .from('bancas')
    .select('nome')
    .ilike('nome', nome)
    .single()
    
  if (existing) {
    return { data: existing.nome }
  }
  
  const { data, error } = await supabase
    .from('bancas')
    .insert({ nome })
    .select('nome')
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/concursos')
  return { data: data.nome }
}
