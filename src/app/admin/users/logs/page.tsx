"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Activity, User, FileText, Trophy, FileUp, Settings, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { listActivityLogs, ActivityLog } from "../actions"

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  post: <FileText className="h-4 w-4" />,
  concurso: <Trophy className="h-4 w-4" />,
  prova: <FileUp className="h-4 w-4" />,
  category: <Tag className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />
}

const ENTITY_COLORS: Record<string, string> = {
  post: "bg-blue-100 text-blue-800",
  concurso: "bg-amber-100 text-amber-800",
  prova: "bg-purple-100 text-purple-800",
  category: "bg-green-100 text-green-800",
  user: "bg-red-100 text-red-800",
  system: "bg-gray-100 text-gray-800"
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  
  const [entityFilter, setEntityFilter] = useState("all")
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    
    const result = await listActivityLogs({ 
      entityType: entityFilter !== "all" ? entityFilter : undefined,
      page, 
      limit: 30 
    })
    
    if (result.data) {
      setLogs(result.data)
      setTotalPages(result.totalPages || 1)
    }
    
    setLoading(false)
  }, [entityFilter, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Atividade</h1>
          <p className="text-muted-foreground">
            Histórico de ações realizadas no sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ações</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="concurso">Concursos</SelectItem>
                <SelectItem value="prova">Provas</SelectItem>
                <SelectItem value="category">Categorias</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Carregando...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhuma atividade registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${ENTITY_COLORS[log.entity_type]}`}>
                    {ENTITY_ICONS[log.entity_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.user_email}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    {log.entity_title && (
                      <p className="text-sm text-muted-foreground truncate">
                        {log.entity_title}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
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
    </div>
  )
}
