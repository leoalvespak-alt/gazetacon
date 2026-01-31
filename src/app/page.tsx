import { supabase } from "@/lib/supabase"
import { FeaturedGrid } from "@/components/blog/FeaturedGrid"
import { PostCard } from "@/components/blog/PostCard"
import { EmptyState } from "@/components/blog/EmptyState"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AREA_LABELS } from "@/types/concurso"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const dynamic = "force-dynamic";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  created_at: string;
  categories: { name: string };
  area?: string | null;
}

export default async function Home() {
  // Fetch posts with categories
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Fetch all categories for the filter bar
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const categories = (categoriesData || []) as Category[]
  const postsData = (posts || []) as Post[]

  const hasPosts = postsData.length > 0
  const featuredPosts = postsData.slice(0, 5)
  // Show all posts in the feed, or maybe skip the very first one if it's too redundant?
  // User asked for "posts and news below too", implying a full feed.
  // Let's show all posts to ensure the grid is populated.
  const feedPosts = postsData

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!hasPosts ? (
        <EmptyState />
      ) : (
        <>
          {/* Main Content Area - Carousel */}
          <FeaturedGrid posts={featuredPosts} />
          
          {/* Categories Bar - Minimalist G1 Style */}
          <section className="border-y border-border/50 bg-background/95 backdrop-blur sticky top-[64px] z-20 overflow-x-auto scrollbar-hide py-1">
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-center gap-6 whitespace-nowrap">
              <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-primary py-3 text-primary">
                Todos
              </Link>
              {categories?.filter(c => c.slug !== 'por-area' && c.slug !== 'areas').map((cat: Category) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`}
                  className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-transparent py-3 text-foreground/60 hover:text-primary hover:border-primary transition-all"
                >
                  {cat.name}
                </Link>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-transparent py-3 text-foreground/60 hover:text-primary hover:border-primary transition-all outline-none">
                  Por Área
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                   {Object.entries(AREA_LABELS).map(([key, label]) => (
                     <DropdownMenuItem key={key} asChild>
                        <Link href={`/search?area=${key}`} className="w-full cursor-pointer uppercase text-[10px] font-bold tracking-wider">
                          {label}
                        </Link>
                     </DropdownMenuItem>
                   ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          {/* Regular Feed - All Posts */}
          <section className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Últimas do Portal</h2>
              <div className="h-[2px] flex-1 bg-border/50"></div>
            </div>
            
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {feedPosts.map((post: Post) => (
                <PostCard 
                  key={post.id} 
                  title={post.title}
                  category={post.categories?.name || 'Geral'}
                  area={post.area && AREA_LABELS[post.area as keyof typeof AREA_LABELS] ? AREA_LABELS[post.area as keyof typeof AREA_LABELS] : undefined}
                  excerpt={post.excerpt}
                  date={new Date(post.created_at).toLocaleDateString('pt-BR')}
                  readTime="5 min"
                  image={post.cover_image_url}
                  slug={post.slug}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Newsletter Section - High Impact */}
      <section className="bg-black text-white py-24 border-t border-white/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-secondary to-primary"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-secondary text-black font-black uppercase tracking-widest px-4 py-1 rounded-none">Exclusivo</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
                Não perca nenhum <span className="text-primary">edital</span>.
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0">
                Junte-se a +50.000 concurseiros e receba atualizações em tempo real no seu e-mail.
              </p>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="SEU MELHOR E-MAIL" 
                className="flex h-16 w-full rounded-none border-2 border-white/10 bg-white/5 px-6 py-2 text-sm font-bold placeholder:text-gray-600 focus:border-secondary outline-hidden transition-all uppercase tracking-widest"
              />
              <button className="w-full inline-flex items-center justify-center rounded-none text-sm font-black bg-primary text-white hover:bg-white hover:text-black transition-all h-16 px-8 shadow-2xl tracking-[0.2em] uppercase italic">
                 CADASTRAR AGORA
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
