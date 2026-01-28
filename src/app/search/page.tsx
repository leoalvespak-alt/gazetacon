"use client"
import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/blog/PostCard"
import { Input } from "@/components/ui/input"
import { Loader2, Search as SearchIcon } from "lucide-react"

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
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [query, setQuery] = useState(initialQuery)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
        setPosts([])
        return
    }
    
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, categories(*)')
      .eq('published', true)
      .ilike('title', `%${searchQuery}%`)
      .order('created_at', { ascending: false })

    if (data) setPosts(data as Post[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (initialQuery) {
        // Use setTimeout to avoid setState in effect body warning
        const timer = setTimeout(() => handleSearch(initialQuery), 0)
        return () => clearTimeout(timer)
    }
  }, [initialQuery, handleSearch])

  return (
    <div className="container px-4 md:px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Buscar na Gazeta</h1>
        <p className="text-muted-foreground">Encontre notícias, editais e dicas relevantes para sua aprovação.</p>
        <div className="relative mt-8">
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
             className="pl-10 h-12 text-lg" 
             placeholder="Digite sua busca..." 
             value={query}
             onChange={(e) => {
                 setQuery(e.target.value)
                 handleSearch(e.target.value)
             }}
           />
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
