'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { ProvaFormData, Prova } from '@/types/prova'

// Criar prova
export async function createProva(data: ProvaFormData) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: prova, error } = await supabase
    .from('provas')
    .insert({
      ...data,
      total_questoes: data.total_questoes || 0,
      assuntos_mais_cobrados: data.assuntos_mais_cobrados || [],
      uploaded_by: user?.id
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/provas')
  return { data: prova }
}

// Atualizar prova
export async function updateProva(id: string, data: Partial<ProvaFormData>) {
  const supabase = await createServerSupabaseClient()
  
  const { data: prova, error } = await supabase
    .from('provas')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/provas')
  return { data: prova }
}

// Deletar prova
export async function deleteProva(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('provas')
    .delete()
    .eq('id', id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/provas')
  return { success: true }
}

// Listar provas com filtros
export async function listProvas(filters?: {
  orgao?: string
  banca?: string
  ano?: number
  search?: string
  page?: number
  limit?: number
}) {
  const supabase = await createServerSupabaseClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('provas')
    .select('*, concurso:concursos(id, titulo, slug)', { count: 'exact' })
    .order('ano', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.orgao) {
    query = query.eq('orgao', filters.orgao)
  }
  
  if (filters?.banca) {
    query = query.eq('banca', filters.banca)
  }
  
  if (filters?.ano) {
    query = query.eq('ano', filters.ano)
  }
  
  if (filters?.search) {
    query = query.or(
      `titulo.ilike.%${filters.search}%,orgao.ilike.%${filters.search}%,cargo.ilike.%${filters.search}%`
    )
  }
  
  const { data, count, error } = await query
  
  if (error) {
    return { error: error.message }
  }
  
  return {
    data: data as (Prova & { concurso?: { id: string; titulo: string; slug: string } | null })[],
    count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

// Buscar prova por ID
export async function getProvaById(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('provas')
    .select('*, concurso:concursos(id, titulo, slug)')
    .eq('id', id)
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  return { data: data as Prova & { concurso?: { id: string; titulo: string; slug: string } | null } }
}

// Estatísticas de provas
export async function getProvasStats() {
  const supabase = await createServerSupabaseClient()
  
  const [
    { count: total },
    { data: downloadsData },
    { data: topOrgaos }
  ] = await Promise.all([
    supabase.from('provas').select('*', { count: 'exact', head: true }),
    supabase.from('provas').select('downloads'),
    supabase.from('provas').select('orgao').limit(100)
  ])
  
  const totalDownloads = (downloadsData || []).reduce((acc: number, p: { downloads: number }) => acc + (p.downloads || 0), 0)
  
  // Contar órgãos únicos
  const orgaosUnicos = new Set((topOrgaos || []).map((p: { orgao: string }) => p.orgao))
  
  return {
    total: total || 0,
    totalDownloads,
    orgaosUnicos: orgaosUnicos.size
  }
}

// Incrementar download
export async function incrementDownload(id: string) {
  const supabase = await createServerSupabaseClient()
  
  await supabase.rpc('increment_prova_download', { prova_id: id })
  
  return { success: true }
}

// Buscar órgãos e bancas únicos para filtros
export async function getProvasFilters() {
  const supabase = await createServerSupabaseClient()
  
  const [{ data: orgaos }, { data: bancas }, { data: anos }] = await Promise.all([
    supabase.from('provas').select('orgao').order('orgao'),
    supabase.from('provas').select('banca').order('banca'),
    supabase.from('provas').select('ano').order('ano', { ascending: false })
  ])
  
  return {
    orgaos: [...new Set((orgaos || []).map((o: { orgao: string }) => o.orgao).filter(Boolean))],
    bancas: [...new Set((bancas || []).map((b: { banca: string | null }) => b.banca).filter(Boolean))],
    anos: [...new Set((anos || []).map((a: { ano: number }) => a.ano))]
  }
}
