"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

interface SeoSnippetPreviewProps {
  title: string
  description?: string
  slug: string
}

export function SeoSnippetPreview({ title, description, slug }: SeoSnippetPreviewProps) {
  // Simular URL base
  const baseUrl = "https://gazetaconcursos.com.br"
  
  // Truncar descrição se necessário (simulando Google)
  const displayDesc = description 
    ? (description.length > 160 ? description.substring(0, 157) + "..." : description)
    : "Nenhuma descrição fornecida. O Google usará parte do conteúdo da página."

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          Pré-visualização no Google
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-white rounded-md border text-left font-sans select-none">
          {/* Mobile view simulation */}
          <div className="mb-1 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-slate-200"></div>
            <div className="flex flex-col text-xs leading-tight">
               <span className="text-slate-800 font-medium">Gazeta dos Concursos</span>
               <span className="text-slate-500">{baseUrl} › blog › {slug || 'seu-post'}</span>
            </div>
          </div>
          
          <div className="text-[#1a0dab] text-xl font-medium cursor-pointer hover:underline mb-1">
             {title || "Título do seu Artigo"} | Gazeta dos Concursos
          </div>
          
          <div className="text-[#4d5156] text-sm">
             {/* Data (simulada) */}
             <span className="text-slate-500 text-xs mr-2">27 de jan. de 2026 —</span>
             {displayDesc}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * A visualização real pode variar dependendo do dispositivo e algoritmo do Google.
        </p>
      </CardContent>
    </Card>
  )
}
