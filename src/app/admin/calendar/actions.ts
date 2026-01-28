'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

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

// Buscar posts para o calendário
export async function getCalendarPosts(month: number, year: number): Promise<CalendarPost[]> {
  const supabase = await createServerSupabaseClient()
  
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
  
  // Posts agendados no período
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
  
  // Posts publicados no período
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
  
  // Remover duplicatas
  const uniquePosts = allPosts.reduce((acc, post) => {
    if (!acc.find(p => p.id === post.id)) {
      acc.push(post)
    }
    return acc
  }, [] as CalendarPost[])
  
  return uniquePosts
}

// Buscar posts para o Kanban
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

// Agendar publicação
export async function schedulePost(postId: string, scheduledAt: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ scheduled_at: scheduledAt })
    .eq('id', postId)
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

// Remover agendamento
export async function unschedulePost(postId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ scheduled_at: null })
    .eq('id', postId)
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}
