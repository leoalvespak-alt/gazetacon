"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import { differenceInDays, format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

// Reuse types or define simplified ones for the widget
export interface RadarItem {
  id: string
  titulo: string
  status: string
  data_inscricao_fim?: string | null
  data_prova?: string | null
  banca?: string | null
}

interface RadarEditaisProps {
  items: RadarItem[]
}

export function RadarEditais({ items }: RadarEditaisProps) {
  if (!items?.length) return null

  // Helper to calculate urgency
  const getUrgency = (dateStr?: string | null) => {
    if (!dateStr) return { color: "text-muted-foreground", text: "Data a definir" }
    
    const days = differenceInDays(parseISO(dateStr), new Date())
    
    if (days < 0) return { color: "text-red-500", text: "Encerrado" }
    if (days === 0) return { color: "text-red-600", text: "HOJE!" }
    if (days <= 3) return { color: "text-red-500", text: `${days} dias restantes` }
    if (days <= 7) return { color: "text-amber-500", text: `${days} dias` }
    
    return { color: "text-green-600", text: format(parseISO(dateStr), "dd/MM", { locale: ptBR }) }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-indigo-500" />
                Radar de Editais
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
                Próximos Vencimentos
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
            const urgency = getUrgency(item.data_inscricao_fim)
            
            return (
                <div key={item.id} className="group flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1 min-w-0">
                        <Link 
                            href={`/admin/concursos/${item.id}/edit`}
                            className="font-medium hover:underline truncate block"
                        >
                            {item.titulo}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{item.banca || 'Banca N/A'}</Badge>
                            <span className="flex items-center gap-1">
                                {item.status === 'inscricoes_abertas' ? 'Inscrições até:' : 'Prova em:'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="text-right whitespace-nowrap">
                        <div className={`font-bold text-sm ${urgency.color}`}>
                            {urgency.text}
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                             <Link href={`/admin/concursos/${item.id}/edit`}>
                                <ArrowRight className="h-3 w-3" />
                             </Link>
                        </Button>
                    </div>
                </div>
            )
        })}
        
        <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <Link href="/admin/concursos">Ver lista completa</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
