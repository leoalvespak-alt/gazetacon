"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check,
  AlertCircle,
  Building2,
  MapPin,
  Users,
  GraduationCap,
  Link as LinkIcon,
  FileDown,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { createClient } from "@/lib/supabase-browser"
import { Concurso, STATUS_LABELS, AREA_LABELS, ConcursoArea, ConcursoStatus } from "@/types/concurso"
import { Prova } from "@/types/prova"
import { ConcursoStatusBadge } from "@/components/admin/ConcursoStatusBadge"

interface ConcursoInfoPanelProps {
  concursoId: string | null
  onInsertContent?: (content: string) => void
  onInsertLink?: (text: string, url: string) => void
}

interface ProvaWithConcurso extends Prova {
  concurso?: { id: string; titulo: string; slug: string } | null
}

export function ConcursoInfoPanel({ 
  concursoId, 
  onInsertContent,
  onInsertLink 
}: ConcursoInfoPanelProps) {
  const [concurso, setConcurso] = useState<Concurso | null>(null)
  const [provas, setProvas] = useState<ProvaWithConcurso[]>([])
  const [loading, setLoading] = useState(false)
  const [provasOpen, setProvasOpen] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchConcursoData = useCallback(async () => {
    if (!concursoId) {
      setConcurso(null)
      setProvas([])
      return
    }
    
    setLoading(true)
    
    // Buscar dados do concurso
    const { data: concursoData } = await supabase
      .from('concursos')
      .select('*')
      .eq('id', concursoId)
      .single()
    
    if (concursoData) {
      setConcurso(concursoData as Concurso)
      
      // Buscar provas vinculadas ao concurso
      const { data: provasData } = await supabase
        .from('provas')
        .select('*')
        .eq('concurso_id', concursoId)
        .order('ano', { ascending: false })
      
      setProvas((provasData || []) as ProvaWithConcurso[])
    }
    
    setLoading(false)
  }, [concursoId, supabase])

  useEffect(() => {
    fetchConcursoData()
  }, [fetchConcursoData])

  const copyToClipboard = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getBancaInfo = () => {
    if (concurso?.banca_definida && concurso?.banca) {
      return {
        text: concurso.banca,
        status: "definida" as const,
        badge: "Banca Definida"
      }
    } else if (concurso?.banca) {
      return {
        text: concurso.banca,
        status: "provavel" as const,
        badge: "Provável"
      }
    } else if (concurso?.banca_ultimo_concurso) {
      return {
        text: concurso.banca_ultimo_concurso,
        status: "ultimo" as const,
        badge: "Último Concurso"
      }
    }
    return {
      text: "Não definida",
      status: "indefinida" as const,
      badge: null
    }
  }

  const handleInsertInfo = (type: 'vagas' | 'salario' | 'prazo' | 'banca' | 'edital') => {
    if (!concurso || !onInsertContent) return

    let content = ""
    
    switch (type) {
      case 'vagas':
        content = `${concurso.vagas_total} vagas${concurso.vagas_imediatas ? ` (${concurso.vagas_imediatas} imediatas + ${concurso.vagas_cr} CR)` : ''}`
        break
      case 'salario':
        if (concurso.salario_min && concurso.salario_max) {
          content = `de ${formatCurrency(concurso.salario_min)} a ${formatCurrency(concurso.salario_max)}`
        } else if (concurso.salario_max) {
          content = `até ${formatCurrency(concurso.salario_max)}`
        }
        break
      case 'prazo':
        if (concurso.data_inscricao_fim) {
          content = `até ${formatDate(concurso.data_inscricao_fim)}`
        }
        break
      case 'banca':
        const bancaInfo = getBancaInfo()
        content = bancaInfo.text
        break
      case 'edital':
        if (concurso.edital_url && onInsertLink) {
          onInsertLink("Edital do Concurso", concurso.edital_url)
          return
        }
        break
    }
    
    if (content) {
      onInsertContent(content)
    }
  }

  const handleInsertProvaLink = (prova: ProvaWithConcurso, type: 'prova' | 'gabarito' | 'gabarito_comentado') => {
    if (!onInsertLink) return
    
    let url = ""
    let text = ""
    
    switch (type) {
      case 'prova':
        url = prova.prova_url || ""
        text = `Prova ${prova.titulo} (${prova.ano})`
        break
      case 'gabarito':
        url = prova.gabarito_url || ""
        text = `Gabarito ${prova.titulo} (${prova.ano})`
        break
      case 'gabarito_comentado':
        url = prova.gabarito_comentado_url || ""
        text = `Gabarito Comentado ${prova.titulo} (${prova.ano})`
        break
    }
    
    if (url) {
      onInsertLink(text, url)
    }
  }

  if (!concursoId) {
    return null
  }

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!concurso) {
    return null
  }

  const bancaInfo = getBancaInfo()

  return (
    <TooltipProvider>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Informações do Concurso
              </CardTitle>
              <p className="text-xs font-semibold truncate max-w-[200px]">
                {concurso.titulo}
              </p>
            </div>
            <ConcursoStatusBadge status={concurso.status as ConcursoStatus} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações principais */}
          <div className="grid gap-2 text-xs">
            {/* Órgão */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Órgão:</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{concurso.orgao}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => copyToClipboard(concurso.orgao, 'orgao')}
                    >
                      {copiedField === 'orgao' ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar órgão</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Banca */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                <span>Banca:</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{bancaInfo.text}</span>
                {bancaInfo.badge && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] h-4 px-1 ${
                      bancaInfo.status === 'definida' 
                        ? 'border-green-500 text-green-600' 
                        : bancaInfo.status === 'provavel'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-slate-400 text-slate-500'
                    }`}
                  >
                    {bancaInfo.badge}
                  </Badge>
                )}
                {(bancaInfo.status !== 'indefinida') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => handleInsertInfo('banca')}
                      >
                        <LinkIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Inserir no texto</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Localização */}
            {(concurso.estado || concurso.cidade) && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Local:</span>
                </div>
                <span className="font-medium">
                  {concurso.cidade ? `${concurso.cidade}, ` : ''}{concurso.estado || 'Nacional'}
                </span>
              </div>
            )}

            {/* Área */}
            {concurso.area && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>Área:</span>
                </div>
                <span className="font-medium">{AREA_LABELS[concurso.area as ConcursoArea]}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Dados numéricos com botões de inserção */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Clique para inserir no post:</p>
            
            <div className="flex flex-wrap gap-1.5">
              {/* Vagas */}
              {concurso.vagas_total > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={() => handleInsertInfo('vagas')}
                    >
                      <Users className="h-3 w-3" />
                      {concurso.vagas_total} vagas
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {concurso.vagas_imediatas} imediatas + {concurso.vagas_cr} CR
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Salário */}
              {concurso.salario_max && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={() => handleInsertInfo('salario')}
                    >
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(concurso.salario_max)}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {concurso.salario_min 
                      ? `De ${formatCurrency(concurso.salario_min)} a ${formatCurrency(concurso.salario_max)}`
                      : `Até ${formatCurrency(concurso.salario_max)}`
                    }
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Prazo inscrições */}
              {concurso.data_inscricao_fim && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={() => handleInsertInfo('prazo')}
                    >
                      <Calendar className="h-3 w-3" />
                      Até {formatDate(concurso.data_inscricao_fim)}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Prazo de inscrições</TooltipContent>
                </Tooltip>
              )}

              {/* Data da prova */}
              {concurso.data_prova && (
                <Badge variant="secondary" className="h-7 text-xs gap-1">
                  <Calendar className="h-3 w-3" />
                  Prova: {formatDate(concurso.data_prova)}
                </Badge>
              )}
            </div>
          </div>

          {/* Links do concurso */}
          {(concurso.edital_url || concurso.site_oficial) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Links do concurso:</p>
                <div className="flex flex-wrap gap-1.5">
                  {concurso.edital_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={() => handleInsertInfo('edital')}
                    >
                      <FileText className="h-3 w-3" />
                      Link do Edital
                    </Button>
                  )}
                  {concurso.site_oficial && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={() => onInsertLink?.("Site Oficial", concurso.site_oficial!)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Site Oficial
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Provas vinculadas */}
          {provas.length > 0 && (
            <>
              <Separator />
              <Collapsible open={provasOpen} onOpenChange={setProvasOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-8 px-2 text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileDown className="h-3 w-3" />
                      Provas Anteriores ({provas.length})
                    </span>
                    {provasOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {provas.map((prova) => (
                    <div 
                      key={prova.id} 
                      className="p-2 rounded-md bg-background border text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate max-w-[150px]">
                          {prova.titulo}
                        </span>
                        <Badge variant="outline" className="h-4 text-[10px]">
                          {prova.ano}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-2">
                        <span>{prova.orgao}</span>
                        {prova.banca && (
                          <>
                            <span>•</span>
                            <span>{prova.banca}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prova.prova_url && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-6 text-[10px] gap-1"
                            onClick={() => handleInsertProvaLink(prova, 'prova')}
                          >
                            <FileDown className="h-2.5 w-2.5" />
                            Prova
                          </Button>
                        )}
                        {prova.gabarito_url && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-6 text-[10px] gap-1"
                            onClick={() => handleInsertProvaLink(prova, 'gabarito')}
                          >
                            <FileText className="h-2.5 w-2.5" />
                            Gabarito
                          </Button>
                        )}
                        {prova.gabarito_comentado_url && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-6 text-[10px] gap-1"
                            onClick={() => handleInsertProvaLink(prova, 'gabarito_comentado')}
                          >
                            <FileText className="h-2.5 w-2.5" />
                            Comentado
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Aviso se banca não definida */}
          {!concurso.banca_definida && !concurso.banca && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-200">
                A banca organizadora ainda não foi oficialmente definida para este concurso.
                {concurso.banca_ultimo_concurso && (
                  <> No último concurso, a banca foi: <strong>{concurso.banca_ultimo_concurso}</strong>.</>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
