"use client"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export function Footer() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const fetchCats = async () => {
        const { data } = await supabase.from('categories').select('*').limit(5)
        if (data) setCategories(data)
    }
    fetchCats()
  }, [])

  return (
    <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-xl font-bold italic text-primary">Gazeta dos Concursos</h3>
            <p className="text-sm text-muted-foreground">
              O portal definitivo para quem busca a estabilidade do serviço público no Brasil.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sobre" className="hover:text-primary">Sobre Nós</Link></li>
              <li><Link href="/contato" className="hover:text-primary">Contato</Link></li>
              <li><Link href="/termos" className="hover:text-primary">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
               {categories.length > 0 ? categories.map((cat: any) => (
                 <li key={cat.id}><Link href={`/category/${cat.slug}`} className="hover:text-primary">{cat.name}</Link></li>
               )) : (
                 <li>Carregando...</li>
               )}
            </ul>
          </div>
        </div>
        
        {/* LEGAL DISCLAIMER */}
        <div className="container mx-auto px-4 md:px-6 mt-8 pt-8 border-t">
            <p className="text-xs text-muted-foreground/80 leading-relaxed text-center max-w-4xl mx-auto">
                <strong>Aviso Legal:</strong> A Gazeta dos Concursos é um portal de notícias independente. Não temos vínculo com bancas organizadoras ou órgãos públicos. Todas as informações devem ser confirmadas nos editais oficiais e Diários Oficiais.
            </p>
        </div>

        <div className="container mx-auto px-4 md:px-6 mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Gazeta dos Concursos. Todos os direitos reservados.
        </div>
      </footer>
  )
}
