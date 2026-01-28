import { supabase } from "@/lib/supabase"
import { Hero } from "@/components/blog/Hero"
import { PostCard } from "@/components/blog/PostCard"
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

  const featuredPost = posts?.[0]
  const recentPosts = posts?.slice(1) || []

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      {/* Categories Bar */}
      <section className="border-b bg-background sticky top-[60px] z-20 overflow-x-auto">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-2 whitespace-nowrap scrollbar-hide">
          <span className="text-sm font-semibold text-muted-foreground mr-2">Explorar:</span>
          <Badge variant="default" className="cursor-pointer">Todos</Badge>
          {categories?.map((cat: any) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Últimas do Blog</h2>
            <p className="text-muted-foreground">Mantenha-se atualizado com as notícias mais recentes dos concursos.</p>
          </div>
        </div>
        
        {!posts || posts.length === 0 ? (
           <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20">
                <h3 className="text-2xl font-semibold text-muted-foreground">Nenhum post publicado ainda.</h3>
                <p className="mt-2">Fique ligado! Em breve traremos as melhores dicas para sua aprovação.</p>
           </div>
        ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                  <PostCard 
                      key={post.id} 
                      title={post.title}
                      category={post.categories?.name || 'Geral'}
                      excerpt={post.excerpt || 'Leia mais sobre este assunto na Gazeta dos Concursos.'}
                      date={new Date(post.created_at).toLocaleDateString()}
                      readTime="5 min"
                      image={post.cover_image_url || '/hero.png'}
                      slug={post.slug}
                  />
              ))}
            </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary/5 py-16 border-y">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-4">
          <h2 className="text-3xl font-bold">Fique por dentro de tudo!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Inscreva-se na nossa newsletter e receba notícias de editais, dicas de estudo e materiais exclusivos diretamente no seu e-mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-4">
             <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             />
             <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6">
                Inscrever-se
             </button>
          </div>
        </div>
      </section>
    </div>
  )
}
