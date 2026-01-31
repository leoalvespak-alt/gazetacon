import { NewsletterForm } from "@/components/newsletter/NewsletterForm"

export function BlogSidebar() {
  return (
    <aside className="hidden md:block w-full">
       <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
             <h3 className="font-semibold mb-4 text-lg">Sobre o Blog</h3>
             <div className="space-y-4">
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    A <strong>Gazeta dos Concursos</strong> é sua fonte confiável de notícias, editais e estratégias de estudo para concursos públicos.
                 </p>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    Nossa missão é simplificar sua jornada até a aprovação.
                 </p>
             </div>
          </div>

          <NewsletterForm variant="sidebar" source="blog_sidebar" />
       </div>
    </aside>
  )
}
