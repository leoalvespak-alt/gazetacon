"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-muted/40 py-12 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Gazeta dos Concursos
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Estratégias avançadas, análises de editais e dicas de estudo para sua aprovação.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {/* Button components will be available shortly */}
              <Button asChild size="lg">
                 <Link href="/blog/como-comecar-a-estudar">
                  Ler Destaque
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/category/editais">
                  Ver Editais Abertos
                </Link>
              </Button>
            </div>
          </div>
          <div className="mx-auto aspect-video w-full max-w-[600px] overflow-hidden rounded-xl shadow-2xl lg:order-last border-4 border-background">
             <img 
               src="/hero.png" 
               alt="Gazeta dos Concursos - Destaque" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>
    </section>
  )
}
