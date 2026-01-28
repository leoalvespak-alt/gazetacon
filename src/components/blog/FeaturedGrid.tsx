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
    <section className="container mx-auto px-4 md:px-6 py-6 transition-all duration-300">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Featured Post */}
        <div className="lg:col-span-8 group relative overflow-hidden rounded-xl border-none aspect-video lg:aspect-auto lg:h-[480px] shadow-2xl">
          <Link href={`/blog/${mainPost.slug}`} className="absolute inset-0 z-10">
            <span className="sr-only">Ver {mainPost.title}</span>
          </Link>
          <div className="relative h-full w-full">
            <Image 
              src={mainPost.cover_image_url || "/hero.png"} 
              alt={mainPost.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12 z-5">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="bg-primary hover:bg-primary/90 text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                  {mainPost.categories?.name || "Destaque"}
                </span>
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                  {new Date(mainPost.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter group-hover:text-secondary transition-colors duration-500">
                {mainPost.title}
              </h2>
              <p className="text-white/80 text-sm md:text-lg line-clamp-2 leading-relaxed font-medium">
                {mainPost.excerpt}
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Posts */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {secondaryPosts.length > 0 ? (
            secondaryPosts.map((post) => (
              <div key={post.id} className="group relative flex gap-4 items-start py-4 border-b last:border-0 border-border/50 hover:bg-muted/50 transition-all rounded-lg px-2">
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Ver {post.title}</span>
                </Link>
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md">
                  <Image 
                    src={post.cover_image_url || "/hero.png"} 
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-[10px] uppercase font-black text-primary tracking-widest">
                    {post.categories?.name || "Notícia"}
                  </span>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-bold">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))
          ) : null}
          
          {/* Quick Newsletter or Link in Sidebar */}
          <div className="mt-auto p-6 rounded-xl bg-secondary text-secondary-foreground border-none shadow-lg">
             <h4 className="font-black text-lg mb-1 flex items-center gap-2 tracking-tighter uppercase italic">
                Radar de Editais
             </h4>
             <p className="text-xs opacity-80 mb-4 font-semibold">
                Receba alertas em tempo real sobre os concursos mais disputados do Brasil.
             </p>
             <button className="w-full bg-black text-white text-[10px] font-black tracking-widest py-3 rounded-md hover:bg-black/80 transition-all shadow-md active:scale-95 uppercase">
                Assinar Newsletter Grátis
             </button>
          </div>
        </div>
      </div>
    </section>
  )
}
