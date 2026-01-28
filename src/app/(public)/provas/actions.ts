'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Prova } from '@/types/prova'

export interface ProvaPublic extends Prova {
  concurso?: {
    titulo: string
    slug: string
    orgao: string
  } | null
}

export interface ProvasFilters {
  orgaos: string[]
  bancas: string[]
  anos: number[]
}

// Listar provas públicas com filtros
export async function listProvasPublic(filters?: {
  search?: string
  orgao?: string
  banca?: string
  ano?: number
  page?: number
  limit?: number
}): Promise<{
  data: ProvaPublic[]
  totalPages: number
  total: number
}> {
  const supabase = await createServerSupabaseClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 12
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('provas')
    .select(`
      *,
      concurso:concursos(titulo, slug, orgao)
    `, { count: 'exact' })
    .order('ano', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (filters?.search) {
    query = query.or(`titulo.ilike.%${filters.search}%,orgao.ilike.%${filters.search}%,cargo.ilike.%${filters.search}%`)
  }
  
  if (filters?.orgao) {
    query = query.eq('orgao', filters.orgao)
  }
  
  if (filters?.banca) {
    query = query.eq('banca', filters.banca)
  }
  
  if (filters?.ano) {
    query = query.eq('ano', filters.ano)
  }
  
  const { data, count, error } = await query
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Erro ao listar provas:', error)
    return { data: [], totalPages: 0, total: 0 }
  }
  
  // Mapear para o formato correto
  const provas = (data || []).map((prova: {
    id: string
    titulo: string
    orgao: string
    banca: string | null
    ano: number
    cargo: string | null
    prova_url: string | null
    gabarito_url: string | null
    gabarito_comentado_url: string | null
    total_questoes: number
    assuntos_mais_cobrados: string[]
    downloads: number
    created_at: string
    uploaded_by: string | null
    concurso_id: string | null
    concurso: { titulo: string; slug: string; orgao: string }[] | null
  }): ProvaPublic => ({
    ...prova,
    concurso: Array.isArray(prova.concurso) && prova.concurso.length > 0 
      ? prova.concurso[0] 
      : null
  }))
  
  return {
    data: provas,
    totalPages: Math.ceil((count || 0) / limit),
    total: count || 0
  }
}

// Buscar filtros disponíveis
export async function getProvasPublicFilters(): Promise<ProvasFilters> {
  const supabase = await createServerSupabaseClient()
  
  const { data: provas } = await supabase
    .from('provas')
    .select('orgao, banca, ano')
  
  if (!provas) {
    return { orgaos: [], bancas: [], anos: [] }
  }
  
  const orgaos = [...new Set(provas.map((p: { orgao: string }) => p.orgao))].sort()
  const bancas = [...new Set(provas.map((p: { banca: string | null }) => p.banca).filter(Boolean))].sort() as string[]
  const anos = [...new Set(provas.map((p: { ano: number }) => p.ano))].sort((a, b) => b - a)
  
  return { orgaos, bancas, anos }
}

// Incrementar download e obter URL
export async function downloadProva(provaId: string, tipo: 'prova' | 'gabarito' | 'gabarito_comentado'): Promise<{
  url?: string
  error?: string
}> {
  const supabase = await createServerSupabaseClient()
  
  // Buscar prova
  const { data: prova, error } = await supabase
    .from('provas')
    .select('prova_url, gabarito_url, gabarito_comentado_url')
    .eq('id', provaId)
    .single()
  
  if (error || !prova) {
    return { error: 'Prova não encontrada' }
  }
  
  let url: string | null = null
  
  switch (tipo) {
    case 'prova':
      url = prova.prova_url
      break
    case 'gabarito':
      url = prova.gabarito_url
      break
    case 'gabarito_comentado':
      url = prova.gabarito_comentado_url
      break
  }
  
  if (!url) {
    return { error: 'Arquivo não disponível' }
  }
  
  // Incrementar downloads
  await supabase
    .from('provas')
    .update({ downloads: supabase.rpc })
    .eq('id', provaId)
  
  await supabase.rpc('increment_prova_download', { prova_id: provaId })
  
  return { url }
}

// Buscar estatísticas públicas
export async function getProvasPublicStats(): Promise<{
  totalProvas: number
  totalDownloads: number
  orgaosUnicos: number
}> {
  const supabase = await createServerSupabaseClient()
  
  const { count: totalProvas } = await supabase
    .from('provas')
    .select('*', { count: 'exact', head: true })
  
  const { data: stats } = await supabase
    .from('provas')
    .select('downloads, orgao')
  
  const totalDownloads = stats?.reduce((sum: number, p: { downloads: number }) => sum + (p.downloads || 0), 0) || 0
  const orgaosUnicos = new Set(stats?.map((p: { orgao: string }) => p.orgao)).size
  
  return {
    totalProvas: totalProvas || 0,
    totalDownloads,
    orgaosUnicos
  }
}
