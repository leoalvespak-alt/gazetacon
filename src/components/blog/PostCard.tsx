"use client"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  title: string
  category: string
  excerpt: string
  date: string
  readTime: string
  image: string
  slug: string
}

export function PostCard({ title, category, excerpt, date, readTime, image, slug }: PostCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col h-full border-muted/60 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 bg-card/50 backdrop-blur-xs">
      <Link href={`/blog/${slug}`} className="block relative aspect-video w-full overflow-hidden">
        <img 
          src={image || "/hero.png"} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
           <span className="text-white text-sm font-medium flex items-center gap-1">
              Ler artigo <ArrowRight className="h-4 w-4" />
           </span>
        </div>
      </Link>
      
      <CardHeader className="p-5">
        <div className="mb-3">
           <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-primary/20 bg-primary/5 text-primary">
            {category}
           </Badge>
        </div>
        <Link href={`/blog/${slug}`} className="group/title">
            <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover/title:text-primary transition-colors">
              {title}
            </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-1">
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted/50 px-2 py-1 rounded-sm">
              <Calendar className="mr-1.5 h-3 w-3 text-primary" />
              {date}
          </div>
          <div className="flex items-center bg-muted/50 px-2 py-1 rounded-sm">
              <Clock className="mr-1.5 h-3 w-3 text-primary" />
              {readTime}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
