"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  Search, 
  Download, 
  FileText, 
  FileCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Building2,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { 
  listProvasPublic, 
  getProvasPublicFilters, 
  getProvasPublicStats,
  downloadProva,
  ProvaPublic,
  ProvasFilters
} from "./actions"
import { toast } from "sonner"

export default function ProvasPublicPage() {
  const [provas, setProvas] = useState<ProvaPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalProvas: 0, totalDownloads: 0, orgaosUnicos: 0 })
  const [filters, setFilters] = useState<ProvasFilters>({ orgaos: [], bancas: [], anos: [] })
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  const [search, setSearch] = useState("")
  const [orgaoFilter, setOrgaoFilter] = useState("")
  const [bancaFilter, setBancaFilter] = useState("")
  const [anoFilter, setAnoFilter] = useState("")
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    
    const [provasResult, filtersResult, statsResult] = await Promise.all([
      listProvasPublic({
        search: search || undefined,
        orgao: orgaoFilter || undefined,
        banca: bancaFilter || undefined,
        ano: anoFilter ? parseInt(anoFilter) : undefined,
        page,
        limit: 12
      }),
      getProvasPublicFilters(),
      getProvasPublicStats()
    ])
    
    setProvas(provasResult.data)
    setTotalPages(provasResult.totalPages)
    setTotal(provasResult.total)
    setFilters(filtersResult)
    setStats(statsResult)
    setLoading(false)
  }, [search, orgaoFilter, bancaFilter, anoFilter, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDownload = async (provaId: string, tipo: 'prova' | 'gabarito' | 'gabarito_comentado', fileName: string) => {
    const result = await downloadProva(provaId, tipo)
    
    if (result.error) {
      toast.error(result.error)
      return
    }
    
    if (result.url) {
      window.open(result.url, '_blank')
      toast.success(`Download iniciado: ${fileName}`)
    }
  }

  const clearFilters = () => {
    setSearch("")
    setOrgaoFilter("")
    setBancaFilter("")
    setAnoFilter("")
    setPage(1)
  }

  const hasActiveFilters = search || orgaoFilter || bancaFilter || anoFilter

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-12 px-4 md:py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Banco de Provas
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Acesse provas anteriores de concursos públicos de todo o Brasil. 
            Baixe provas, gabaritos e gabaritos comentados.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">{stats.totalProvas}</div>
              <div className="text-sm opacity-80">Provas</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">{stats.totalDownloads}</div>
              <div className="text-sm opacity-80">Downloads</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">{stats.orgaosUnicos}</div>
              <div className="text-sm opacity-80">Órgãos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por órgão, cargo ou título..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={orgaoFilter} onValueChange={(v) => { setOrgaoFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os órgãos</SelectItem>
                  {filters.orgaos.map((orgao) => (
                    <SelectItem key={orgao} value={orgao}>{orgao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={bancaFilter} onValueChange={(v) => { setBancaFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Banca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as bancas</SelectItem>
                  {filters.bancas.map((banca) => (
                    <SelectItem key={banca} value={banca}>{banca}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={anoFilter} onValueChange={(v) => { setAnoFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {filters.anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {loading ? 'Carregando...' : `${total} prova${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
          </div>
        </div>
      </section>

      {/* Provas Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : provas.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhuma prova encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {provas.map((prova) => (
                <Card key={prova.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{prova.titulo}</CardTitle>
                      <Badge variant="secondary">{prova.ano}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{prova.orgao}</span>
                    </div>
                    
                    {prova.banca && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4 shrink-0" />
                        <span>{prova.banca}</span>
                      </div>
                    )}
                    
                    {prova.cargo && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{prova.cargo}</span>
                      </div>
                    )}
                    
                    {prova.concurso && (
                      <Link 
                        href={`/concursos/${prova.concurso.slug}`}
                        className="block text-sm text-primary hover:underline"
                      >
                        Ver concurso →
                      </Link>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {prova.downloads} download{prova.downloads !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 pt-0">
                    {prova.prova_url && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleDownload(prova.id, 'prova', 'Prova')}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Prova
                      </Button>
                    )}
                    {prova.gabarito_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(prova.id, 'gabarito', 'Gabarito')}
                      >
                        <FileCheck className="mr-1 h-3 w-3" />
                        Gabarito
                      </Button>
                    )}
                    {prova.gabarito_comentado_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(prova.id, 'gabarito_comentado', 'Comentado')}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        Comentado
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
