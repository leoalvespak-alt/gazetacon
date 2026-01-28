"use client"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useSettings } from "@/components/providers/settings-provider"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Send } from "lucide-react"

export function Footer() {
  const [categories, setCategories] = useState<any[]>([])
  const { settings } = useSettings()

  useEffect(() => {
    const fetchCats = async () => {
        const { data } = await supabase.from('categories').select('*').limit(5)
        if (data) setCategories(data)
    }
    fetchCats()
  }, [])

  return (
    <footer className="py-20 bg-black text-white border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 grid gap-12 md:grid-cols-4">
          <div className="space-y-6 md:col-span-2">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">
                {settings?.siteName || "Gazeta dos Concursos"}
            </h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-sm">
              {settings?.siteDescription || "O portal definitivo para quem busca a estabilidade do serviço público no Brasil. Notícias, editais e as melhores dicas de estudo."}
            </p>
            <div className="flex gap-6 pt-2">
              {[
                { icon: Facebook, url: settings?.facebookUrl, label: "Facebook" },
                { icon: Instagram, url: settings?.instagramUrl, label: "Instagram" },
                { icon: Twitter, url: settings?.twitterUrl, label: "Twitter" },
                { icon: Youtube, url: settings?.youtubeUrl, label: "YouTube" },
                { icon: Linkedin, url: settings?.linkedinUrl, label: "LinkedIn" },
                { icon: Send, url: settings?.telegramUrl, label: "Telegram" },
              ].filter(s => s.url).map((social, idx) => (
                <Link key={idx} href={social.url!} target="_blank" className="text-gray-500 hover:text-white transition-all transform hover:scale-110">
                  <social.icon className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-primary">Conteúdo</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400 uppercase tracking-tighter">
               {categories.length > 0 ? categories.map((cat: any) => (
                 <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                        {cat.name}
                    </Link>
                 </li>
               )) : (
                 <li className="animate-pulse">Sintonizando...</li>
               )}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-primary">Institucional</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400 uppercase tracking-tighter">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        
        {/* LEGAL DISCLAIMER */}
        <div className="container mx-auto px-4 md:px-6 mt-16 pt-8 border-t border-white/5">
            <p className="text-[10px] text-gray-600 leading-relaxed text-center max-w-4xl mx-auto font-bold uppercase tracking-widest">
                <strong>Aviso Legal:</strong> A {settings?.siteName || "Gazeta dos Concursos"} é um portal independente. Não temos vínculo com bancas ou órgãos públicos. Confirme sempre nos editais oficiais.
            </p>
        </div>

        <div className="container mx-auto px-4 md:px-6 mt-10 text-center text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} {settings?.siteName || "Gazeta dos Concursos"} • Todos os direitos reservados.
        </div>
      </footer>
  )
}
