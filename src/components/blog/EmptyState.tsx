"use client"
import { PostCard } from "./PostCard"

export function EmptyState() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">
          Gazeta dos Concursos
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl font-medium">
          Em breve, as melhores estratégias, análises e dicas para sua aprovação.
          Estamos preparando conteúdos incríveis para você.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 opacity-40 grayscale pointer-events-none">
        {[1, 2, 3].map((i) => (
          <PostCard
            key={i}
            title="Título de Exemplo: O que esperar para 2026"
            category="Geral"
            excerpt="Este é um exemplo de como os artigos serão exibidos. Fique ligado para as novidades."
            date="Em breve"
            readTime="-"
            image="/hero.png"
            slug="#"
          />
        ))}
      </div>
    </div>
  )
}
