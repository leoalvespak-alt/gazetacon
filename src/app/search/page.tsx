"use client"
import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/blog/PostCard"
import { Input } from "@/components/ui/input"
import { Loader2, Search as SearchIcon } from "lucide-react"
import { AREA_LABELS } from "@/types/concurso"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string
  created_at: string
  categories: {
    name: string
  } | null
  area?: string | null
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialArea = searchParams.get("area") || "all"
  
  const [query, setQuery] = useState(initialQuery)
  const [area, setArea] = useState(initialArea)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (searchQuery: string, searchArea: string) => {
    setLoading(true)
    
    let queryBuilder = supabase
      .from('posts')
      .select('*, categories(*)')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (searchQuery.trim()) {
       queryBuilder = queryBuilder.ilike('title', `%${searchQuery}%`)
    }

    if (searchArea && searchArea !== 'all') {
       queryBuilder = queryBuilder.eq('area', searchArea)
    }

    const { data } = await queryBuilder

    if (data) setPosts(data as Post[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // Initial fetch to show something or filter if present
    const timer = setTimeout(() => handleSearch(query, area), 0)
    return () => clearTimeout(timer)
  }, [handleSearch, query, area])

  return (
    <div className="container px-4 md:px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Buscar na Gazeta</h1>
        <p className="text-muted-foreground">Encontre notícias, editais e dicas relevantes para sua aprovação.</p>
        <div className="flex gap-4 max-w-2xl mx-auto items-center mt-8">
            <div className="relative flex-1">
               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 className="pl-10 h-10" 
                 placeholder="Digite sua busca..." 
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
               />
            </div>
            <div className="w-[200px]">
                <Select value={area} onValueChange={setArea}>
                    <SelectTrigger>
                        <SelectValue placeholder="Carreira" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Carreiras</SelectItem>
                        {Object.entries(AREA_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              title={post.title}
              category={post.categories?.name || 'Geral'}
              area={post.area && AREA_LABELS[post.area as keyof typeof AREA_LABELS] ? AREA_LABELS[post.area as keyof typeof AREA_LABELS] : undefined}
              excerpt={post.excerpt}
              date={new Date(post.created_at).toLocaleDateString()}
              readTime="5 min"
              image={post.cover_image_url}
              slug={post.slug}
            />
          ))}
        </div>
      ) : query && (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <h2 className="text-xl font-semibold text-muted-foreground">Nenhum resultado para &quot;{query}&quot;</h2>
            <p className="mt-2 text-muted-foreground">Tente outros termos ou navegue pelas categorias.</p>
          </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
