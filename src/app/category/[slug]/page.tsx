import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/blog/PostCard"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string
  created_at: string
  categories: {
    id: string
    name: string
    slug: string
    color: string
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  // Fetch category details
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const typedCategory = category as Category

  // Fetch posts for this category
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('category_id', typedCategory.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const typedPosts = (posts || []) as Post[]

  return (
    <div className="container px-4 md:px-6 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Home
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <div className="w-4 h-10 rounded-full" style={{ backgroundColor: typedCategory.color }}></div>
            <h1 className="text-4xl font-bold tracking-tight">Categoria: {typedCategory.name}</h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Explorando todos os artigos publicados em <strong>{typedCategory.name}</strong> na Gazeta dos Concursos.
        </p>
      </div>

      {typedPosts.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
          <h2 className="text-xl font-semibold text-muted-foreground">Nenhum post nesta categoria ainda.</h2>
          <Link href="/" className="text-primary hover:underline mt-4 block">Ver todos os posts</Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {typedPosts.map((post) => (
            <PostCard 
              key={post.id} 
              title={post.title}
              category={typedCategory.name}
              excerpt={post.excerpt}
              date={new Date(post.created_at).toLocaleDateString()}
              readTime="5 min"
              image={post.cover_image_url}
              slug={post.slug}
            />
          ))}
        </div>
      )}
    </div>
  )
}
