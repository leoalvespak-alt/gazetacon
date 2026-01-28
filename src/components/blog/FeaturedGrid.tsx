"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"

import Image from "next/image"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string
  created_at: string
  categories: {
    name: string
  }
}

interface FeaturedGridProps {
  posts: Post[]
}

export function FeaturedGrid({ posts }: FeaturedGridProps) {
  if (!posts || posts.length === 0) return null

  const mainPost = posts[0]
  const secondaryPosts = posts.slice(1, 4)

  return (
    <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Featured Post */}
        <div className="lg:col-span-8 group relative overflow-hidden rounded-3xl border bg-card aspect-video lg:aspect-auto lg:h-[500px]">
          <Link href={`/blog/${mainPost.slug}`} className="absolute inset-0 z-10">
            <span className="sr-only">Ver {mainPost.title}</span>
          </Link>
          <div className="relative h-full w-full">
            <Image 
              src={mainPost.cover_image_url || "/hero.png"} 
              alt={mainPost.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10 z-5">
            <div className="space-y-4 max-w-2xl">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-4 py-1 text-xs font-bold uppercase tracking-wider">
                {mainPost.categories?.name || "Destaque"}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter group-hover:text-primary-foreground transition-colors duration-300">
                {mainPost.title}
              </h2>
              <p className="text-gray-200 text-sm md:text-lg line-clamp-2 md:line-clamp-3 leading-relaxed font-medium">
                {mainPost.excerpt || "Fique por dentro das últimas atualizações e estratégias para passar no seu próximo concurso público."}
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs md:text-sm text-gray-300 font-semibold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {new Date(mainPost.created_at).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  5 min de leitura
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Posts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {secondaryPosts.length > 0 ? (
            secondaryPosts.map((post) => (
              <div key={post.id} className="group relative flex gap-4 items-center p-4 rounded-2xl border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Ver {post.title}</span>
                </Link>
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border">
                  <Image 
                    src={post.cover_image_url || "/hero.png"} 
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <Badge variant="outline" className="w-fit text-[10px] uppercase font-bold text-primary/80 border-primary/20 bg-primary/5">
                    {post.categories?.name || "Notícia"}
                  </Badge>
                  <h3 className="font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))
          ) : (
             <div className="h-full flex flex-col justify-center items-center p-8 rounded-3xl border border-dashed text-center bg-muted/20">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Fique ligado</p>
                <p className="text-xs text-muted-foreground px-4">Em breve, as notícias mais quentes dos concursos aqui.</p>
             </div>
          )}
          
          {/* Quick Newsletter or Link in Sidebar */}
          <div className="mt-auto p-6 rounded-3xl bg-primary/10 border border-primary/20">
             <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Guia de Estudos 2026
             </h4>
             <p className="text-xs text-muted-foreground mb-4">
                Baixe nosso guia gratuito com as melhores estratégias para o ano.
             </p>
             <button className="w-full bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                ACESSAR AGORA
             </button>
          </div>
        </div>
      </div>
    </section>
  )
}
