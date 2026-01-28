import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Concurso } from "@/types/concurso"
import { Calendar, Building, MapPin, DollarSign, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Metadata } from "next"
import { cache } from "react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic";

// Cached fetch to deduplicate requests
const getConcurso = cache(async (slug: string) => {
  const { data: concursoData } = await supabase
    .from('concursos')
    .select('*')
    .eq('slug', slug)
    .single()
  return concursoData as Concurso | null
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const concurso = await getConcurso(slug)

  if (!concurso) {
    return {
      title: "Concurso não encontrado | Gazeta dos Concursos",
    }
  }

  // Formatting helpers
  const formatMoney = (val?: number | null) => val ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null
  
  // Logic: "[Status] Concurso [Nome do Órgão] [Ano]: Edital e Salário"
  const currentYear = new Date().getFullYear()
  const statusLabel = concurso.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // Capitalize
  const salarioTxt = formatMoney(concurso.salario_max || concurso.salario_min)
  
  const title = `${statusLabel}: Concurso ${concurso.orgao} ${currentYear}: Edital${salarioTxt ? ` e Salário de ${salarioTxt}` : ''}`

  // Logic: "Saiba tudo sobre o Concurso [Órgão]. [Vagas] vagas para [Cargo]. Banca [Banca]. ..."
  const vagasTxt = concurso.vagas_total ? `${concurso.vagas_total} vagas` : 'Vagas a definir'
  // Since we don't have a single "Cargo" field (it's an array or generic), we might omit it or use title
  // Using title as proxy for cargo/concurso name
  
  const bancaTxt = concurso.banca ? `Banca ${concurso.banca}.` : ''
  
  const description = `Saiba tudo sobre o Concurso ${concurso.orgao}. ${vagasTxt}. ${bancaTxt} Baixe o edital e provas anteriores em PDF.`

  // Open Graph Images
  // Assuming we might have a specific image for the contest, or fallback to default OG
  // We don't have a direct 'image_url' on Concurso type in the file I read earlier (it had edital_url, site_oficial, etc)
  // Checking type again: it has no cover image. 
  // However, I can use a default open graph image or generate one dynamically if I had `og` endpoint.
  // For now, I will use a placeholder or site default if no specific image field exists.
  // Wait, I see `cover_image_url` in Post, but let's check Concurso type in previous steps.
  // Step 18 shows Concurso interface. No `cover_image_url`. 
  // I will use a default site OG image for now, or if meaningful, map status to an image path.
  
  const ogImages = [
    {
      url: 'https://gazetadosconcursos.com.br/og-concursos.png', // Replace with actual default or dynamic OG
      width: 1200,
      height: 630,
      alt: `Concurso ${concurso.orgao}`,
    }
  ]

  return {
    title: {
      absolute: title.substring(0, 60), // Google limits, but usually 60 chars is visible. Next.js template might append suffix.
      // Using absolute to override template if needed, or just string
    },
    description: description.substring(0, 160), // SEO optimal length
    openGraph: {
      title,
      description,
      images: ogImages,
      locale: 'pt_BR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages, // Twitter uses same if not specified, but good to be explicit
    }
  }
}

export default async function ConcursoPage({ params }: PageProps) {
  const { slug } = await params
  const concurso = await getConcurso(slug)

  if (!concurso) {
    notFound()
  }
  
  // JSON-LD Generation
  // Regra de Negócio: Só renderize o JSON-LD se o status do concurso NÃO for "Encerrado".
  const isEncerrado = concurso.status === 'encerrado'
  
  // Construção da descrição baseada nos dados disponíveis
  const description = `Concurso ${concurso.titulo} para o órgão ${concurso.orgao}. ` +
    `${concurso.vagas_total ? `Total de vagas: ${concurso.vagas_total}.` : ''} ` +
    `${concurso.salario_min ? `Salário inicial de R$ ${concurso.salario_min}.` : ''} ` +
    `Status atual: ${concurso.status.replace(/_/g, ' ')}.`

  const hiringOrgName = concurso.banca || concurso.orgao || "Organização Responsável"
  
  // validThrough: Data fim das inscrições ou +3 meses
  const validThroughDate = concurso.data_inscricao_fim 
    ? new Date(concurso.data_inscricao_fim).toISOString()
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

  // Mapeamento JobPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": concurso.titulo,
    "description": description,
    "datePosted": concurso.created_at,
    "validThrough": validThroughDate,
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": hiringOrgName,
      "sameAs": concurso.site_oficial || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": concurso.estado || "BR",
        "addressCountry": "BR"
      }
    },
    "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "BRL",
        "value": {
            "@type": "QuantitativeValue",
            "value": concurso.salario_min || 0,
            "unitText": "MONTH"
        }
    }
  }

  return (
    <main className="container mx-auto px-4 py-10 md:py-16">
      {/* Insert JSON-LD Script */}
      {!isEncerrado && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      
      {/* Layout Base do Concurso */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
           <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
             ← Voltar para Home
           </Link>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={isEncerrado ? "secondary" : "default"} className="capitalize">
                            {concurso.status.replace(/_/g, ' ')}
                        </Badge>
                        {concurso.estado && (
                            <Badge variant="outline">{concurso.estado}</Badge>
                        )}
                        {concurso.area && (
                            <Badge variant="outline" className="capitalize">{concurso.area}</Badge>
                        )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                        {concurso.titulo}
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">
                        {concurso.orgao}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Banca</p>
                            <p className="font-medium text-foreground">{concurso.banca || 'A definir'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Salário Inicial</p>
                            <p className="font-medium text-foreground">
                                {concurso.salario_min 
                                    ? `R$ ${concurso.salario_min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                                    : 'A definir'}
                            </p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Localização</p>
                            <p className="font-medium text-foreground">{concurso.cidade ? `${concurso.cidade}, ` : ''}{concurso.estado || 'Nacional'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                         <Calendar className="h-5 w-5 text-primary" />
                         <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Inscrições</p>
                            <p className="font-medium text-foreground">
                                {concurso.data_inscricao_inicio ? new Date(concurso.data_inscricao_inicio).toLocaleDateString('pt-BR') : 'A definir'} 
                                {concurso.data_inscricao_fim ? ` até ${new Date(concurso.data_inscricao_fim).toLocaleDateString('pt-BR')}` : ''}
                            </p>
                         </div>
                    </div>
                </div>

                {concurso.site_oficial && (
                    <div className="pt-6">
                        <Button asChild className="w-full md:w-auto font-bold" size="lg">
                            <a href={concurso.site_oficial} target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Edital / Site Oficial
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </main>
  )
}
