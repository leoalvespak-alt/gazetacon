import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShareButtons } from "@/components/blog/ShareButtons"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image_url: string
  created_at: string
  updated_at?: string
  author_id?: string
  author_name?: string
  reading_time?: number
  categories: {
    name: string
  } | null
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  
  // 1. Fetch Post Data
  const { data: postData } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()

  if (!postData) notFound()

  const post = postData as Post
  
  // 2. Fetch Author Profile (if linked)
  let authorProfile = null
  if (post.author_id) {
    const { data } = await supabase
      .from('profiles')
      .select('name, avatar_url, username') // Ensure username exists in profiles schema or remove it if unsure defined
      // Based on step 61, profiles has properties of Use interface: name, avatar_url. 'username' was not in User interface 
      // User interface: id, email, name, avatar_url, role, created_at, last_sign_in
      // So I will remove username from select to avoid error.
      .eq('id', post.author_id)
      .single()
    authorProfile = data
  }

  // 3. Prepare JSON-LD Data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gazetadosconcursos.com.br'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  
  // Author fallback logic
  const authorName = authorProfile?.name || post.author_name || "Equipe Gazeta"
  // If we had a username/profile page, we'd add it here. For now, omit URL if no public profile page known.
  
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title.substring(0, 110),
    "image": [post.cover_image_url],
    "datePublished": new Date(post.created_at).toISOString(),
    "dateModified": new Date(post.updated_at || post.created_at).toISOString(),
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gazeta Concursos",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "description": post.excerpt,
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
    }
  }

  // Optimize: Add keywords if category relates to "Concurso"
  const categoryName = post.categories?.name || ""
  if (categoryName.toLowerCase().includes('concurso')) {
     jsonLd.keywords = "Concursos Públicos, Editais, Vagas, Carreira Pública"
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-6">
           <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Home
                </Link>
           </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10">
        <article className="prose prose-stone dark:prose-invert max-w-none">
          <div className="mb-8 not-prose">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
               <Link href="/" className="hover:text-primary">Home</Link>
               <span>/</span>
               <span className="text-foreground font-medium">{post.categories?.name || 'Artigo'}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm border-b pb-6">
               <div className="flex items-center gap-2">
                 {authorProfile?.avatar_url ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <Image src={authorProfile.avatar_url} alt={authorName} fill className="object-cover" />
                    </div>
                 ) : (
                    <User className="w-4 h-4"/>
                 )}
                 <span className="font-medium">{authorName}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4"/>
                 {new Date(post.created_at).toLocaleDateString('pt-BR')}
               </div>
               <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4"/>
                 {post.reading_time || 5} min de leitura
               </div>
            </div>
            </div>
            
            <div className="my-4 not-prose">
               <ShareButtons title={post.title} />
            </div>

          
          {post.cover_image_url && (
              <div className="relative w-full h-auto max-h-[500px] aspect-video overflow-hidden rounded-xl shadow-md mb-10">
                <Image 
                  src={post.cover_image_url} 
                  alt={post.title} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          
          <div className="mt-8 not-prose border-t pt-4">
               <h4 className="text-xl font-bold mb-2">Gostou deste artigo? Compartilhe!</h4>
               <ShareButtons title={post.title} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden md:block space-y-8">
           <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                 <h3 className="font-semibold mb-4">Sobre o Blog</h3>
                 <p className="text-sm text-muted-foreground">
                    A Gazeta dos Concursos ajuda milhares de estudantes a alcançarem a aprovação com dicas estratégicas e material de qualidade.
                 </p>
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}
