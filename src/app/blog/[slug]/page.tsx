import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

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
  categories: {
    name: string
  } | null
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  

  const { data: post } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()

  if (!post) notFound()

  const typedPost = post as Post

  return (
    <div className="container px-4 md:px-6 py-10 md:py-16">
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
               <span className="text-foreground font-medium">{typedPost.categories?.name || 'Artigo'}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {typedPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm border-b pb-6">
               <div className="flex items-center gap-2">
                 <User className="w-4 h-4"/>
                 Autor Desconhecido
               </div>
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4"/>
                 {new Date(typedPost.created_at).toLocaleDateString()}
               </div>
               <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4"/>
                 5 min de leitura
               </div>
            </div>
          </div>
          
          {typedPost.cover_image_url && (
              <div className="relative w-full h-auto max-h-[500px] aspect-video overflow-hidden rounded-xl shadow-md mb-10">
                <Image 
                  src={typedPost.cover_image_url} 
                  alt={typedPost.title} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: typedPost.content }} />
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
