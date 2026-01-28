'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// ===================== TYPES =====================

export interface CalendarPost {
  id: string
  title: string
  slug: string
  published: boolean
  status: 'draft' | 'review' | 'scheduled' | 'published'
  scheduled_at: string | null
  created_at: string
  category?: { name: string; color: string } | null
  author?: { name: string; email: string } | null
}

export interface CalendarNote {
  id: string
  note_date: string
  title: string
  content: string | null
  color: string
  note_type: 'general' | 'reminder' | 'deadline' | 'idea'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  completed: boolean
  created_by: string
  created_at: string
  author?: { name: string; email: string } | null
}

export interface CalendarEvent {
  id: string
  type: 'post' | 'note' | 'concurso_inscricao' | 'concurso_prova' | 'concurso_resultado' | 'pauta'
  date: string
  title: string
  subtitle?: string
  color: string
  link?: string
  metadata?: Record<string, unknown>
}

export interface EditorialPauta {
  id: string
  title: string
  slug: string | null
  briefing: string | null
  keywords: string[] | null
  target_audience: string | null
  content_type: string
  reference_links: string[] | null
  inspiration_notes: string | null
  category_id: string | null
  concurso_id: string | null
  target_date: string | null
  status: 'idea' | 'approved' | 'in_progress' | 'review' | 'scheduled' | 'published' | 'archived'
  assigned_to: string | null
  post_id: string | null
  estimated_time_hours: number | null
  word_count_target: number | null
  created_by: string
  created_at: string
  updated_at: string
  category?: { name: string; color: string } | null
  concurso?: { titulo: string; orgao: string } | null
  assignee?: { name: string; email: string } | null
  comments_count?: number
}

export interface PautaComment {
  id: string
  pauta_id: string
  content: string
  author_id: string
  created_at: string
  author?: { name: string; email: string } | null
}

// ===================== CALENDAR POSTS =====================

export async function getCalendarPosts(month: number, year: number): Promise<CalendarPost[]> {
  const supabase = await createServerSupabaseClient()
  
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
  
  const { data: scheduledPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      published,
      scheduled_at,
      created_at,
      category:categories(name, color),
      author:profiles(name, email)
    `)
    .gte('scheduled_at', startDate)
    .lte('scheduled_at', endDate)
    .order('scheduled_at', { ascending: true })
  
  const { data: publishedPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      published,
      scheduled_at,
      created_at,
      category:categories(name, color),
      author:profiles(name, email)
    `)
    .eq('published', true)
    .is('scheduled_at', null)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true })
  
  const mapPost = (post: {
    id: string
    title: string
    slug: string
    published: boolean
    scheduled_at: string | null
    created_at: string
    category: { name: string; color: string }[] | null
    author: { name: string; email: string }[] | null
  }): CalendarPost => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    published: post.published,
    scheduled_at: post.scheduled_at,
    created_at: post.created_at,
    status: post.published ? 'published' : (post.scheduled_at ? 'scheduled' : 'draft'),
    category: Array.isArray(post.category) && post.category.length > 0 ? post.category[0] : null,
    author: Array.isArray(post.author) && post.author.length > 0 ? post.author[0] : null
  })
  
  const allPosts = [
    ...(scheduledPosts || []).map(mapPost),
    ...(publishedPosts || []).map(mapPost)
  ]
  
  const uniquePosts = allPosts.reduce((acc, post) => {
    if (!acc.find(p => p.id === post.id)) {
      acc.push(post)
    }
    return acc
  }, [] as CalendarPost[])
  
  return uniquePosts
}

export async function getKanbanPosts() {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      published,
      scheduled_at,
      created_at,
      category:categories(name, color),
      author:profiles(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  
  const posts = (data || []).map((post: {
    id: string
    title: string
    slug: string
    published: boolean
    scheduled_at: string | null
    created_at: string
    category: { name: string; color: string }[] | null
    author: { name: string; email: string }[] | null
  }): CalendarPost => {
    let status: CalendarPost['status'] = 'draft'
    
    if (post.published) {
      status = 'published'
    } else if (post.scheduled_at) {
      status = 'scheduled'
    }
    
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      published: post.published,
      scheduled_at: post.scheduled_at,
      created_at: post.created_at,
      status,
      category: Array.isArray(post.category) && post.category.length > 0 ? post.category[0] : null,
      author: Array.isArray(post.author) && post.author.length > 0 ? post.author[0] : null
    }
  })
  
  return {
    draft: posts.filter(p => p.status === 'draft'),
    review: posts.filter(p => p.status === 'review'),
    scheduled: posts.filter(p => p.status === 'scheduled'),
    published: posts.filter(p => p.status === 'published').slice(0, 10)
  }
}

export async function schedulePost(postId: string, scheduledAt: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ scheduled_at: scheduledAt })
    .eq('id', postId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function unschedulePost(postId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ scheduled_at: null })
    .eq('id', postId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

// ===================== CALENDAR NOTES =====================

export async function getCalendarNotes(month: number, year: number): Promise<CalendarNote[]> {
  const supabase = await createServerSupabaseClient()
  
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('calendar_notes')
    .select(`
      id,
      note_date,
      title,
      content,
      color,
      note_type,
      priority,
      completed,
      created_by,
      created_at,
      author:profiles!created_by(name, email)
    `)
    .gte('note_date', startDate)
    .lte('note_date', endDate)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }
  
  return (data || []).map((note: {
    id: string
    note_date: string
    title: string
    content: string | null
    color: string
    note_type: string
    priority: string
    completed: boolean
    created_by: string
    created_at: string
    author: { name: string; email: string }[] | null
  }) => ({
    ...note,
    note_type: note.note_type as CalendarNote['note_type'],
    priority: note.priority as CalendarNote['priority'],
    author: Array.isArray(note.author) && note.author.length > 0 ? note.author[0] : null
  }))
}

export async function createCalendarNote(data: {
  note_date: string
  title: string
  content?: string
  color?: string
  note_type?: CalendarNote['note_type']
  priority?: CalendarNote['priority']
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const { error } = await supabase
    .from('calendar_notes')
    .insert({
      ...data,
      created_by: user.id
    })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function updateCalendarNote(
  noteId: string,
  data: Partial<{
    title: string
    content: string
    color: string
    note_type: CalendarNote['note_type']
    priority: CalendarNote['priority']
    completed: boolean
    note_date: string
  }>
) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('calendar_notes')
    .update(data)
    .eq('id', noteId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function deleteCalendarNote(noteId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('calendar_notes')
    .delete()
    .eq('id', noteId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function toggleNoteCompletion(noteId: string, completed: boolean) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('calendar_notes')
    .update({ completed })
    .eq('id', noteId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

// ===================== CONCURSOS EVENTS =====================

export async function getConcursosEvents(month: number, year: number): Promise<CalendarEvent[]> {
  const supabase = await createServerSupabaseClient()
  
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  
  const { data: concursos, error } = await supabase
    .from('concursos')
    .select('id, titulo, orgao, slug, data_inscricao_inicio, data_inscricao_fim, data_prova, data_resultado')
    .or(`data_inscricao_inicio.gte.${startDate},data_inscricao_fim.gte.${startDate},data_prova.gte.${startDate},data_resultado.gte.${startDate}`)
    .or(`data_inscricao_inicio.lte.${endDate},data_inscricao_fim.lte.${endDate},data_prova.lte.${endDate},data_resultado.lte.${endDate}`)
  
  if (error) {
    console.error('Error fetching concursos:', error)
    return []
  }
  
  const events: CalendarEvent[] = []
  
  for (const concurso of concursos || []) {
    // Início das inscrições
    if (concurso.data_inscricao_inicio && 
        concurso.data_inscricao_inicio >= startDate && 
        concurso.data_inscricao_inicio <= endDate) {
      events.push({
        id: `${concurso.id}-inscricao-inicio`,
        type: 'concurso_inscricao',
        date: concurso.data_inscricao_inicio,
        title: `📝 Início Inscrições`,
        subtitle: `${concurso.titulo} - ${concurso.orgao}`,
        color: '#22c55e',
        link: `/admin/concursos/${concurso.id}/edit`,
        metadata: { concurso_id: concurso.id, event_type: 'inscricao_inicio' }
      })
    }
    
    // Fim das inscrições
    if (concurso.data_inscricao_fim && 
        concurso.data_inscricao_fim >= startDate && 
        concurso.data_inscricao_fim <= endDate) {
      events.push({
        id: `${concurso.id}-inscricao-fim`,
        type: 'concurso_inscricao',
        date: concurso.data_inscricao_fim,
        title: `⏰ Fim Inscrições`,
        subtitle: `${concurso.titulo} - ${concurso.orgao}`,
        color: '#ef4444',
        link: `/admin/concursos/${concurso.id}/edit`,
        metadata: { concurso_id: concurso.id, event_type: 'inscricao_fim' }
      })
    }
    
    // Data da prova
    if (concurso.data_prova && 
        concurso.data_prova >= startDate && 
        concurso.data_prova <= endDate) {
      events.push({
        id: `${concurso.id}-prova`,
        type: 'concurso_prova',
        date: concurso.data_prova,
        title: `📋 Prova`,
        subtitle: `${concurso.titulo} - ${concurso.orgao}`,
        color: '#8b5cf6',
        link: `/admin/concursos/${concurso.id}/edit`,
        metadata: { concurso_id: concurso.id, event_type: 'prova' }
      })
    }
    
    // Data do resultado
    if (concurso.data_resultado && 
        concurso.data_resultado >= startDate && 
        concurso.data_resultado <= endDate) {
      events.push({
        id: `${concurso.id}-resultado`,
        type: 'concurso_resultado',
        date: concurso.data_resultado,
        title: `🏆 Resultado`,
        subtitle: `${concurso.titulo} - ${concurso.orgao}`,
        color: '#f59e0b',
        link: `/admin/concursos/${concurso.id}/edit`,
        metadata: { concurso_id: concurso.id, event_type: 'resultado' }
      })
    }
  }
  
  return events
}

// ===================== EDITORIAL PAUTA =====================

export async function getPautas(filters?: {
  status?: string
  category_id?: string
  month?: number
  year?: number
}): Promise<EditorialPauta[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('editorial_pauta')
    .select(`
      *,
      category:categories(name, color),
      concurso:concursos(titulo, orgao),
      assignee:profiles!assigned_to(name, email)
    `)
    .order('target_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }
  
  if (filters?.month && filters?.year) {
    const startDate = new Date(filters.year, filters.month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(filters.year, filters.month, 0).toISOString().split('T')[0]
    query = query.gte('target_date', startDate).lte('target_date', endDate)
  }
  
  const { data, error } = await query.limit(100)
  
  if (error) {
    console.error('Error fetching pautas:', error)
    return []
  }
  
  // Get comment counts
  const pautaIds = (data || []).map(p => p.id)
  const { data: commentCounts } = await supabase
    .from('pauta_comments')
    .select('pauta_id')
    .in('pauta_id', pautaIds)
  
  const countMap: Record<string, number> = {}
  for (const comment of commentCounts || []) {
    countMap[comment.pauta_id] = (countMap[comment.pauta_id] || 0) + 1
  }
  
  return (data || []).map((pauta: {
    id: string
    title: string
    slug: string | null
    briefing: string | null
    keywords: string[] | null
    target_audience: string | null
    content_type: string
    reference_links: string[] | null
    inspiration_notes: string | null
    category_id: string | null
    concurso_id: string | null
    target_date: string | null
    status: string
    assigned_to: string | null
    post_id: string | null
    estimated_time_hours: number | null
    word_count_target: number | null
    created_by: string
    created_at: string
    updated_at: string
    category: { name: string; color: string }[] | null
    concurso: { titulo: string; orgao: string }[] | null
    assignee: { name: string; email: string }[] | null
  }) => ({
    ...pauta,
    status: pauta.status as EditorialPauta['status'],
    category: Array.isArray(pauta.category) && pauta.category.length > 0 ? pauta.category[0] : null,
    concurso: Array.isArray(pauta.concurso) && pauta.concurso.length > 0 ? pauta.concurso[0] : null,
    assignee: Array.isArray(pauta.assignee) && pauta.assignee.length > 0 ? pauta.assignee[0] : null,
    comments_count: countMap[pauta.id] || 0
  }))
}

export async function getPautaById(id: string): Promise<EditorialPauta | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('editorial_pauta')
    .select(`
      *,
      category:categories(name, color),
      concurso:concursos(titulo, orgao),
      assignee:profiles!assigned_to(name, email)
    `)
    .eq('id', id)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return {
    ...data,
    status: data.status as EditorialPauta['status'],
    category: Array.isArray(data.category) && data.category.length > 0 ? data.category[0] : null,
    concurso: Array.isArray(data.concurso) && data.concurso.length > 0 ? data.concurso[0] : null,
    assignee: Array.isArray(data.assignee) && data.assignee.length > 0 ? data.assignee[0] : null
  }
}

export async function createPauta(data: {
  title: string
  briefing?: string
  keywords?: string[]
  target_audience?: string
  content_type?: string
  reference_links?: string[]
  inspiration_notes?: string
  category_id?: string
  concurso_id?: string
  target_date?: string
  status?: EditorialPauta['status']
  assigned_to?: string
  estimated_time_hours?: number
  word_count_target?: number
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  const { data: pauta, error } = await supabase
    .from('editorial_pauta')
    .insert({
      ...data,
      slug: `${slug}-${Date.now()}`,
      created_by: user.id
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true, data: pauta }
}

export async function updatePauta(
  id: string,
  data: Partial<{
    title: string
    briefing: string
    keywords: string[]
    target_audience: string
    content_type: string
    reference_links: string[]
    inspiration_notes: string
    category_id: string
    concurso_id: string
    target_date: string
    status: EditorialPauta['status']
    assigned_to: string
    post_id: string
    estimated_time_hours: number
    word_count_target: number
  }>
) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('editorial_pauta')
    .update(data)
    .eq('id', id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function deletePauta(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('editorial_pauta')
    .delete()
    .eq('id', id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

// ===================== PAUTA COMMENTS =====================

export async function getPautaComments(pautaId: string): Promise<PautaComment[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('pauta_comments')
    .select(`
      *,
      author:profiles!author_id(name, email)
    `)
    .eq('pauta_id', pautaId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  
  return (data || []).map((comment: {
    id: string
    pauta_id: string
    content: string
    author_id: string
    created_at: string
    author: { name: string; email: string }[] | null
  }) => ({
    ...comment,
    author: Array.isArray(comment.author) && comment.author.length > 0 ? comment.author[0] : null
  }))
}

export async function addPautaComment(pautaId: string, content: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const { error } = await supabase
    .from('pauta_comments')
    .insert({
      pauta_id: pautaId,
      content,
      author_id: user.id
    })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function deletePautaComment(commentId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('pauta_comments')
    .delete()
    .eq('id', commentId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/calendar')
  return { success: true }
}

// ===================== COMBINED CALENDAR DATA =====================

export async function getAllCalendarEvents(month: number, year: number): Promise<CalendarEvent[]> {
  const [posts, notes, concursosEvents, pautas] = await Promise.all([
    getCalendarPosts(month, year),
    getCalendarNotes(month, year),
    getConcursosEvents(month, year),
    getPautas({ month, year })
  ])
  
  const events: CalendarEvent[] = []
  
  // Posts
  for (const post of posts) {
    const date = post.scheduled_at || post.created_at
    events.push({
      id: `post-${post.id}`,
      type: 'post',
      date: date.split('T')[0],
      title: post.title,
      subtitle: post.category?.name,
      color: post.category?.color || '#6b7280',
      link: `/admin/posts/${post.id}/edit`,
      metadata: { post_id: post.id, status: post.status }
    })
  }
  
  // Notes
  for (const note of notes) {
    events.push({
      id: `note-${note.id}`,
      type: 'note',
      date: note.note_date,
      title: note.title,
      subtitle: note.content?.slice(0, 50) || undefined,
      color: note.color,
      metadata: { 
        note_id: note.id, 
        note_type: note.note_type,
        priority: note.priority,
        completed: note.completed
      }
    })
  }
  
  // Concursos events
  events.push(...concursosEvents)
  
  // Pautas
  for (const pauta of pautas) {
    if (pauta.target_date) {
      events.push({
        id: `pauta-${pauta.id}`,
        type: 'pauta',
        date: pauta.target_date,
        title: `📌 ${pauta.title}`,
        subtitle: pauta.category?.name,
        color: pauta.category?.color || '#f59e0b',
        metadata: { pauta_id: pauta.id, status: pauta.status }
      })
    }
  }
  
  return events.sort((a, b) => a.date.localeCompare(b.date))
}

// ===================== HELPER FUNCTIONS =====================

export async function getCategories() {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('categories')
    .select('id, name, color')
    .order('name')
  
  return data || []
}

export async function getAdminUsers() {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('id, name, email')
    .not('name', 'is', null)
    .order('name')
  
  return data || []
}

export async function getConcursosList() {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('concursos')
    .select('id, titulo, orgao')
    .order('created_at', { ascending: false })
    .limit(50)
  
  return data || []
}
