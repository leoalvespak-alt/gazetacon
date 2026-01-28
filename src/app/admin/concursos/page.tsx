"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Copy,
  Trophy,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ConcursoStatusBadge } from "@/components/admin/ConcursoStatusBadge"
import { listConcursos, deleteConcurso, duplicateConcurso, getConcursosStats } from "./actions"
import { Concurso, AREA_LABELS, ConcursoArea, ConcursoStatus } from "@/types/concurso"
import { toast } from "sonner"

export default function ConcursosPage() {
  const router = useRouter()
  
  const [concursos, setConcursos] = useState<Concurso[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, inscricoesAbertas: 0, previstos: 0, encerrados: 0 })
  const [totalPages, setTotalPages] = useState(1)
  
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")
  const [page, setPage] = useState(1)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [concursoToDelete, setConcursoToDelete] = useState<Concurso | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    
    const [listResult, statsResult] = await Promise.all([
      listConcursos({ search, status: statusFilter, area: areaFilter, page, limit: 15 }),
      getConcursosStats()
    ])
    
    if (listResult.data) {
      setConcursos(listResult.data)
      setTotalPages(listResult.totalPages || 1)
    }
    
    setStats(statsResult)
    setLoading(false)
  }, [search, statusFilter, areaFilter, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!concursoToDelete) return
    
    setDeleting(true)
    const result = await deleteConcurso(concursoToDelete.id)
    
    if (result.error) {
      toast.error("Erro ao excluir concurso", { description: result.error })
    } else {
      toast.success("Concurso excluído com sucesso")
      loadData()
    }
    
    setDeleting(false)
    setDeleteDialogOpen(false)
    setConcursoToDelete(null)
  }

  const handleDuplicate = async (concurso: Concurso) => {
    const result = await duplicateConcurso(concurso.id)
    
    if (result.error) {
      toast.error("Erro ao duplicar concurso", { description: result.error })
    } else {
      toast.success("Concurso duplicado com sucesso")
      router.push(`/admin/concursos/${result.data?.id}/edit`)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return "-"
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Concursos</h1>
          <p className="text-muted-foreground">
            Gerencie os editais e concursos públicos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/concursos/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Concurso
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscrições Abertas</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inscricoesAbertas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previstos</CardTitle>
            <div className="h-3 w-3 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.previstos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encerrados</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encerrados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, órgão ou banca..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("previsto")}>
                    Previsto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inscricoes_abertas")}>
                    Inscrições Abertas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inscricoes_encerradas")}>
                    Inscrições Encerradas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("em_andamento")}>
                    Em Andamento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("encerrado")}>
                    Encerrado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Área
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setAreaFilter("all")}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.entries(AREA_LABELS).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => setAreaFilter(key)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Active Filters */}
          {(statusFilter !== "all" || areaFilter !== "all" || search) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {statusFilter !== "all" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Status: {statusFilter} ×
                </Button>
              )}
              {areaFilter !== "all" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAreaFilter("all")}
                >
                  Área: {AREA_LABELS[areaFilter as ConcursoArea]} ×
                </Button>
              )}
              {search && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearch("")}
                >
                  Busca: {search} ×
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Concurso</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Vagas</TableHead>
                <TableHead>Inscrições até</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : concursos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Nenhum concurso encontrado</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/concursos/create">Criar primeiro concurso</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                concursos.map((concurso) => (
                  <TableRow key={concurso.id}>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{concurso.titulo}</div>
                      {concurso.area && (
                        <div className="text-xs text-muted-foreground">
                          {AREA_LABELS[concurso.area as ConcursoArea] || concurso.area}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-1">{concurso.orgao}</div>
                      {concurso.banca && (
                        <div className="text-xs text-muted-foreground">{concurso.banca}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <ConcursoStatusBadge status={concurso.status as ConcursoStatus} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">{concurso.vagas_total || "-"}</div>
                      {concurso.vagas_imediatas > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {concurso.vagas_imediatas} imediatas
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(concurso.data_inscricao_fim)}
                    </TableCell>
                    <TableCell>
                      {concurso.salario_max 
                        ? formatCurrency(concurso.salario_max) 
                        : concurso.salario_min 
                          ? formatCurrency(concurso.salario_min)
                          : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/concursos/${concurso.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/concursos/${concurso.slug}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver no site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(concurso)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setConcursoToDelete(concurso)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Concurso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o concurso &quot;{concursoToDelete?.titulo}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
