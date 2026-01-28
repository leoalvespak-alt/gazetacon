'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'admin' | 'editor' | 'author'
  created_at: string
  last_sign_in: string | null
}

export interface ActivityLog {
  id: string
  user_id: string
  user_email: string
  action: string
  entity_type: 'post' | 'concurso' | 'prova' | 'category' | 'user' | 'system'
  entity_id: string | null
  entity_title: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Listar usuários
export async function listUsers(filters?: {
  role?: string
  search?: string
  page?: number
  limit?: number
}) {
  const supabase = await createServerSupabaseClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }
  
  if (filters?.search) {
    query = query.or(`email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`)
  }
  
  const { data, count, error } = await query
  
  if (error) {
    return { error: error.message }
  }
  
  return {
    data: data as User[],
    count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

// Buscar usuário por ID
export async function getUserById(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  return { data: data as User }
}

// Atualizar role do usuário
export async function updateUserRole(userId: string, role: 'admin' | 'editor' | 'author') {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Log da ação
  await logActivity('user_role_updated', 'user', userId, data.email, { newRole: role })
  
  revalidatePath('/admin/users')
  return { data: data as User }
}

// Listar logs de atividade
export async function listActivityLogs(filters?: {
  userId?: string
  entityType?: string
  page?: number
  limit?: number
}) {
  const supabase = await createServerSupabaseClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 30
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }
  
  if (filters?.entityType && filters.entityType !== 'all') {
    query = query.eq('entity_type', filters.entityType)
  }
  
  const { data, count, error } = await query
  
  if (error) {
    return { error: error.message }
  }
  
  return {
    data: data as ActivityLog[],
    count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

// Registrar atividade
export async function logActivity(
  action: string,
  entityType: ActivityLog['entity_type'],
  entityId: string | null,
  entityTitle: string | null,
  metadata?: Record<string, unknown>
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    user_email: user.email,
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    metadata
  })
}

// Estatísticas de usuários
export async function getUsersStats() {
  const supabase = await createServerSupabaseClient()
  
  const [
    { count: total },
    { count: admins },
    { count: editors },
    { count: authors }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'editor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'author')
  ])
  
  return {
    total: total || 0,
    admins: admins || 0,
    editors: editors || 0,
    authors: authors || 0
  }
}
