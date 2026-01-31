"use client"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  title: string
  category: string
  area?: string | null
  excerpt: string
  date: string
  readTime: string
  image: string
  slug: string
}

export function PostCard({ title, category, area, excerpt, date, readTime, image, slug }: PostCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col h-full border-none shadow-none bg-transparent hover:bg-muted/30 transition-all duration-300 rounded-none border-b border-border/50 pb-6">
      <Link href={`/blog/${slug}`} className="block relative aspect-video w-full overflow-hidden rounded-lg mb-4">
        <img 
          src={image || "/hero.png"} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
           <Badge className="bg-primary text-primary-foreground border-none text-[9px] uppercase font-black px-2 py-0.5 rounded-none tracking-widest">
            {category}
           </Badge>
           {area && (
             <Badge className="bg-secondary text-secondary-foreground border-none text-[9px] uppercase font-black px-2 py-0.5 rounded-none tracking-widest">
              {area}
             </Badge>
           )}
        </div>
      </Link>
      
      <div className="flex flex-col flex-1 px-1">
        <Link href={`/blog/${slug}`} className="group/title">
            <h3 className="text-xl md:text-2xl font-black leading-[1.15] tracking-tighter group-hover:text-primary transition-colors mb-3">
              {title}
            </h3>
        </Link>
        <Link href={`/blog/${slug}`} className="group/excerpt">
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed font-medium mb-4 group-hover/excerpt:text-foreground transition-colors">
            {excerpt}
          </p>
        </Link>
        
        <div className="mt-auto flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center">
                <Calendar className="mr-1.5 h-3 w-3 text-primary" />
                {date}
            </span>
            <span className="flex items-center">
                <Clock className="mr-1.5 h-3 w-3 text-primary" />
                {readTime}
            </span>
          </div>
          <Link href={`/blog/${slug}`} className="text-primary hover:underline flex items-center gap-1 transition-all">
             Ler mais <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
