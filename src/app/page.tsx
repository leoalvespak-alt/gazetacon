import { supabase } from "@/lib/supabase"
import { FeaturedGrid } from "@/components/blog/FeaturedGrid"
import { PostCard } from "@/components/blog/PostCard"
import { EmptyState } from "@/components/blog/EmptyState"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch posts with categories
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Fetch all categories for the filter bar
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const hasPosts = posts && posts.length > 0
  const featuredPosts = posts?.slice(0, 4) || []
  const remainingPosts = posts?.slice(4) || []

  return (
    <div className="flex flex-col min-h-screen">
      {!hasPosts ? (
        <EmptyState />
      ) : (
        <>
          {/* Main Content Area Starts Immediately */}
          <FeaturedGrid posts={featuredPosts} />
          
          {/* Categories Bar - Refined */}
          <section className="border-y bg-background/80 backdrop-blur sticky top-[56px] z-20 overflow-x-auto">
            <div className="container mx-auto px-4 md:px-6 py-3 flex items-center gap-3 whitespace-nowrap scrollbar-hide">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">Explorar</span>
              <Badge variant="default" className="cursor-pointer rounded-full px-4">Todos</Badge>
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Badge variant="secondary" className="cursor-pointer rounded-full px-4 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>

          {/* Regular Feed */}
          {remainingPosts.length > 0 && (
            <section className="container mx-auto px-4 md:px-6 py-12">
              <div className="flex flex-col mb-10">
                <h2 className="text-3xl font-black tracking-tighter">Mais Notícias</h2>
                <div className="h-1 w-20 bg-primary mt-2"></div>
              </div>
              
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post: any) => (
                  <PostCard 
                    key={post.id} 
                    title={post.title}
                    category={post.categories?.name || 'Geral'}
                    excerpt={post.excerpt}
                    date={new Date(post.created_at).toLocaleDateString('pt-BR')}
                    readTime="5 min"
                    image={post.cover_image_url}
                    slug={post.slug}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Newsletter Section - Refined */}
      <section className="bg-muted/30 py-20 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-card border rounded-[2rem] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Fique por dentro!</h2>
              <p className="text-muted-foreground text-lg">
                Receba notícias de editais, dicas de estudo e materiais exclusivos diretamente no seu e-mail.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-3 min-w-[300px]">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-hidden"
              />
              <button className="w-full inline-flex items-center justify-center rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all h-12 px-6">
                 QUERO RECEBER AS NOVIDADES
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
