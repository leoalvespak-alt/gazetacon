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
  Download,
  FileText,
  Filter,
  ExternalLink
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { listProvas, deleteProva, getProvasStats, getProvasFilters } from "./actions"
import { Prova } from "@/types/prova"
import { toast } from "sonner"

type ProvaWithConcurso = Prova & { concurso?: { id: string; titulo: string; slug: string } | null }

export default function ProvasPage() {
  const router = useRouter()
  
  const [provas, setProvas] = useState<ProvaWithConcurso[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, totalDownloads: 0, orgaosUnicos: 0 })
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<{ orgaos: string[], bancas: (string | null)[], anos: number[] }>({
    orgaos: [],
    bancas: [],
    anos: []
  })
  
  const [search, setSearch] = useState("")
  const [orgaoFilter, setOrgaoFilter] = useState("all")
  const [bancaFilter, setBancaFilter] = useState("all")
  const [anoFilter, setAnoFilter] = useState("all")
  const [page, setPage] = useState(1)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [provaToDelete, setProvaToDelete] = useState<ProvaWithConcurso | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    
    const [listResult, statsResult, filtersResult] = await Promise.all([
      listProvas({ 
        search, 
        orgao: orgaoFilter !== "all" ? orgaoFilter : undefined,
        banca: bancaFilter !== "all" ? bancaFilter : undefined,
        ano: anoFilter !== "all" ? parseInt(anoFilter) : undefined,
        page, 
        limit: 15 
      }),
      getProvasStats(),
      getProvasFilters()
    ])
    
    if (listResult.data) {
      setProvas(listResult.data)
      setTotalPages(listResult.totalPages || 1)
    }
    
    setStats(statsResult)
    setFilters(filtersResult)
    setLoading(false)
  }, [search, orgaoFilter, bancaFilter, anoFilter, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!provaToDelete) return
    
    setDeleting(true)
    const result = await deleteProva(provaToDelete.id)
    
    if (result.error) {
      toast.error("Erro ao excluir prova", { description: result.error })
    } else {
      toast.success("Prova excluída com sucesso")
      loadData()
    }
    
    setDeleting(false)
    setDeleteDialogOpen(false)
    setProvaToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banco de Provas</h1>
          <p className="text-muted-foreground">
            Gerencie as provas anteriores de concursos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/provas/create">
            <Plus className="mr-2 h-4 w-4" />
            Nova Prova
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Provas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalDownloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órgãos</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgaosUnicos}</div>
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
                placeholder="Buscar por título, órgão ou cargo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={orgaoFilter} onValueChange={(v) => { setOrgaoFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos órgãos</SelectItem>
                  {filters.orgaos.map((orgao) => (
                    <SelectItem key={orgao} value={orgao}>{orgao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={bancaFilter} onValueChange={(v) => { setBancaFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Banca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas bancas</SelectItem>
                  {filters.bancas.map((banca) => (
                    <SelectItem key={banca} value={banca as string}>{banca}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={anoFilter} onValueChange={(v) => { setAnoFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos anos</SelectItem>
                  {filters.anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Prova</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Banca</TableHead>
                <TableHead className="text-center">Ano</TableHead>
                <TableHead className="text-center">Downloads</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : provas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Nenhuma prova encontrada</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/provas/create">Adicionar primeira prova</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                provas.map((prova) => (
                  <TableRow key={prova.id}>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{prova.titulo}</div>
                      {prova.cargo && (
                        <div className="text-xs text-muted-foreground">{prova.cargo}</div>
                      )}
                      {prova.concurso && (
                        <Badge variant="outline" className="mt-1">
                          Vinculado a concurso
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{prova.orgao}</TableCell>
                    <TableCell>{prova.banca || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{prova.ano}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Download className="h-3 w-3 text-muted-foreground" />
                        {prova.downloads || 0}
                      </div>
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
                            <Link href={`/admin/provas/${prova.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          {prova.prova_url && (
                            <DropdownMenuItem asChild>
                              <a href={prova.prova_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver prova
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setProvaToDelete(prova)
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
            <DialogTitle>Excluir Prova</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a prova &quot;{provaToDelete?.titulo}&quot;?
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
