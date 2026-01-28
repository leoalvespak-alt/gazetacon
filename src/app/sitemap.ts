import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gazetadosconcursos.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fallback para build time
  if (!supabaseUrl || !supabaseAnonKey) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ]
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Páginas estáticas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Posts publicados
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  const postPages = (posts || []).map((post: { slug: string; updated_at: string }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Concursos
  const { data: concursos } = await supabase
    .from('concursos')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  const concursoPages = (concursos || []).map((c: { slug: string; updated_at: string }) => ({
    url: `${baseUrl}/concursos/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const categoryPages = (categories || []).map((cat: { slug: string }) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...concursoPages,
    ...postPages,
    ...categoryPages,
  ]
}
