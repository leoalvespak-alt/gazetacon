"use client"
import Link from "next/link"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Use all posts for the carousel, up to 5
  const carouselPosts = posts.slice(0, 5)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselPosts.length)
  }, [carouselPosts.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselPosts.length) % carouselPosts.length)
  }, [carouselPosts.length])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  if (!posts || posts.length === 0) return null



  return (
    <section className="container mx-auto px-4 md:px-6 py-6" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Featured Carousel */}
        <div className="lg:col-span-8 group relative overflow-hidden rounded-xl border-none aspect-video lg:aspect-auto lg:h-[480px] shadow-2xl bg-black">
          

          {/* Carousel Content */}
          <div className="relative h-full w-full">
            {carouselPosts.map((post, index) => (
               <div 
                 key={post.id} 
                 className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
               >
                  <Link href={`/blog/${post.slug}`} className="block relative h-full w-full z-20 cursor-pointer">
                    <Image 
                      src={post.cover_image_url || "/hero.png"} 
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6 md:p-12">
                      <div className="space-y-4 max-w-3xl animate-in slide-in-from-bottom-5 fade-in duration-700">
                        <div className="flex items-center gap-3">
                          <span className="bg-primary hover:bg-primary/90 text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                            {post.categories?.name || "Destaque"}
                          </span>
                          <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter hover:text-secondary transition-colors duration-300">
                          {post.title}
                        </h2>
                        <p className="text-white/80 text-sm md:text-lg line-clamp-2 leading-relaxed font-medium hidden md:block">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
               </div>
            ))}
          </div>

          {/* Navigation Controls */}
          {carouselPosts.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-black/50 hover:text-white rounded-full h-10 w-10 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  prevSlide()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-black/50 hover:text-white rounded-full h-10 w-10 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  nextSlide()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Dots Indicators */}
              <div className="absolute bottom-4 right-6 z-30 flex gap-2">
                {carouselPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setCurrentSlide(idx)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-primary" : "w-1.5 bg-white/50 hover:bg-white"}`}
                    aria-label={`Ir para slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Radar & Quick News */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-[480px]">
          {/* Radar de Editais Header */}
          <div className="p-5 rounded-xl bg-secondary text-secondary-foreground border-none shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-24 h-24" />
             </div>
             <h4 className="font-black text-xl mb-2 flex items-center gap-2 tracking-tighter uppercase italic relative z-10">
                Radar de Editais
             </h4>
             <p className="text-sm opacity-90 mb-4 font-bold relative z-10 leading-tight">
                Fique à frente da concorrência com atualizações em tempo real.
             </p>
             <button className="w-full bg-black text-white text-[10px] font-black tracking-widest py-3 rounded-md hover:bg-black/80 transition-all shadow-md active:scale-95 uppercase relative z-10">
                Ver Todos os Editais
             </button>
          </div>

          {/* Quick List (Top 3 items that are NOT the current one, or just static list) */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {posts.slice(0, 4).map((post, idx) => (
               <div 
                  key={post.id} 
                  className={`group relative flex gap-3 items-start py-3 p-2 rounded-lg transition-all border border-transparent ${idx === currentSlide ? 'bg-muted/50 border-primary/20' : 'hover:bg-muted/50 hover:border-border'}`}
                  onClick={() => setCurrentSlide(idx)}
               >
                 <div className="cursor-pointer absolute inset-0 z-10" />
                 <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
                   <Image 
                     src={post.cover_image_url || "/hero.png"} 
                     alt={post.title}
                     fill
                     className="object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                 </div>
                 <div className="flex flex-col gap-1 overflow-hidden">
                   <span className="text-[9px] uppercase font-black text-primary tracking-widest">
                     {post.categories?.name || "Notícia"}
                   </span>
                   <h3 className={`font-bold text-xs leading-tight line-clamp-2 transition-colors ${idx === currentSlide ? 'text-primary' : 'group-hover:text-primary'}`}>
                     {post.title}
                   </h3>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary));
        }
      `}</style>
    </section>
  )
}
