'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AREA_LABELS, ConcursoArea } from '@/types/concurso'
import { RadarItem } from '@/components/admin/RadarEditais'

export interface DashboardStats {
  totalPosts: number
  postsThisMonth: number
  totalPostsDraft: number
  totalConcursos: number
  concursosAbertos: number
  totalCategories: number
}

export interface PostsPerMonth {
  month: string
  posts: number
}

export interface ConcursosByArea {
  area: string
  count: number
}

export interface DashboardAlert {
  id: string
  type: "warning" | "info" | "muted"
  title: string
  description: string
  link?: string
  linkLabel?: string
}

export interface RecentPost {
  id: string
  title: string
  slug: string
  published: boolean
  created_at: string
  category?: { name: string; color: string } | null
}

export interface FeaturedConcurso {
  id: string
  titulo: string
  slug: string
  orgao: string
  status: string
  visualizacoes: number
}

// Buscar estatísticas gerais do dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const [
    { count: totalPosts },
    { count: postsThisMonth },
    { count: totalPostsDraft },
    { count: totalConcursos },
    { count: concursosAbertos },
    { count: totalCategories }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth),
    supabase.from('posts').select('*', { count: 'exact', head: true })
      .eq('published', false),
    supabase.from('concursos').select('*', { count: 'exact', head: true }),
    supabase.from('concursos').select('*', { count: 'exact', head: true })
      .eq('status', 'inscricoes_abertas'),
    supabase.from('categories').select('*', { count: 'exact', head: true })
  ])
  
  return {
    totalPosts: totalPosts || 0,
    postsThisMonth: postsThisMonth || 0,
    totalPostsDraft: totalPostsDraft || 0,
    totalConcursos: totalConcursos || 0,
    concursosAbertos: concursosAbertos || 0,
    totalCategories: totalCategories || 0
  }
}

// Buscar posts por mês (últimos 6 meses)
export async function getPostsPerMonth(): Promise<PostsPerMonth[]> {
  const supabase = await createServerSupabaseClient()
  
  const months: PostsPerMonth[] = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)
    
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
    months.push({ month: monthName.charAt(0).toUpperCase() + monthName.slice(1), posts: count || 0 })
  }
  
  return months
}

// Buscar concursos por área
export async function getConcursosByArea(): Promise<ConcursosByArea[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data: concursos } = await supabase
    .from('concursos')
    .select('area')
  
  if (!concursos) return []
  
  const areaCount: Record<string, number> = {}
  
  concursos.forEach((c: { area: string | null }) => {
    const area = c.area || 'outra'
    areaCount[area] = (areaCount[area] || 0) + 1
  })
  
  return Object.entries(areaCount).map(([area, count]) => ({
    area: AREA_LABELS[area as ConcursoArea] || area,
    count
  }))
}

// Buscar alertas do dashboard
export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const supabase = await createServerSupabaseClient()
  const alerts: DashboardAlert[] = []
  
  // Concursos com inscrições encerrando em 3 dias
  const hoje = new Date()
  const tresDias = new Date()
  tresDias.setDate(hoje.getDate() + 3)
  
  const { data: concursosEncerrando } = await supabase
    .from('concursos')
    .select('id, titulo, data_inscricao_fim')
    .eq('status', 'inscricoes_abertas')
    .lte('data_inscricao_fim', tresDias.toISOString().split('T')[0])
    .gte('data_inscricao_fim', hoje.toISOString().split('T')[0])
    .limit(3)
  
  concursosEncerrando?.forEach((c: { id: string; titulo: string; data_inscricao_fim: string }) => {
    alerts.push({
      id: `concurso-${c.id}`,
      type: "warning",
      title: `Inscrições encerrando: ${c.titulo}`,
      description: `Termina em ${new Date(c.data_inscricao_fim).toLocaleDateString('pt-BR')}`,
      link: `/admin/concursos/${c.id}/edit`,
      linkLabel: "Ver"
    })
  })
  
  // Posts agendados
  const { data: postsAgendados } = await supabase
    .from('posts')
    .select('id, title, scheduled_at')
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', hoje.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(3)
  
  postsAgendados?.forEach((p: { id: string; title: string; scheduled_at: string }) => {
    alerts.push({
      id: `post-agendado-${p.id}`,
      type: "info",
      title: `Post agendado: ${p.title}`,
      description: `Publicação em ${new Date(p.scheduled_at).toLocaleDateString('pt-BR')}`,
      link: `/admin/posts/${p.id}/edit`,
      linkLabel: "Editar"
    })
  })
  
  // Posts rascunho há mais de 7 dias
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(hoje.getDate() - 7)
  
  const { data: rascunhosAntigos } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .eq('published', false)
    .lte('created_at', seteDiasAtras.toISOString())
    .order('created_at', { ascending: true })
    .limit(3)
  
  rascunhosAntigos?.forEach((p: { id: string; title: string; created_at: string }) => {
    alerts.push({
      id: `rascunho-${p.id}`,
      type: "muted",
      title: `Rascunho: ${p.title}`,
      description: `Criado em ${new Date(p.created_at).toLocaleDateString('pt-BR')}`,
      link: `/admin/posts/${p.id}/edit`,
      linkLabel: "Continuar"
    })
  })
  
  return alerts
}

// Buscar posts recentes
export async function getRecentPosts(limit: number = 5): Promise<RecentPost[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      published,
      created_at,
      category:categories(name, color)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Mapear para o formato correto (category como objeto em vez de array)
  return (data || []).map((post: { 
    id: string
    title: string
    slug: string
    published: boolean
    created_at: string
    category: { name: string; color: string }[] | null
  }) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    published: post.published,
    created_at: post.created_at,
    category: Array.isArray(post.category) && post.category.length > 0 
      ? post.category[0] 
      : null
  }))
}

// Buscar concursos mais visualizados
export async function getFeaturedConcursos(limit: number = 5): Promise<FeaturedConcurso[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('concursos')
    .select('id, titulo, slug, orgao, status, visualizacoes')
    .order('visualizacoes', { ascending: false })
    .limit(limit)
  
  return (data || []) as FeaturedConcurso[]
}

// Buscar dados para o Radar de Editais
export async function getRadarData(limit: number = 5): Promise<RadarItem[]> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  // Buscar concursos com inscrições ou provas próximas
  const { data } = await supabase
    .from('concursos')
    .select('id, titulo, status, data_inscricao_fim, data_prova, banca')
    .or(`status.eq.inscricoes_abertas,status.eq.previsto`)
    .gte('data_inscricao_fim', today) // Apenas futuros ou hoje
    .order('data_inscricao_fim', { ascending: true })
    .limit(limit)

  return (data || []) as RadarItem[]
}
