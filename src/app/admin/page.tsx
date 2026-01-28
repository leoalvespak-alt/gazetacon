"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, LayoutGrid, PlusCircle, Trophy, TrendingUp, Eye, Calendar as CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { PostsPerMonthChart } from "@/components/admin/charts/PostsPerMonthChart"
import { ConcursosByAreaChart } from "@/components/admin/charts/ConcursosByAreaChart"
import { RadarEditais, RadarItem } from "@/components/admin/RadarEditais"
import { DashboardAlerts } from "@/components/admin/DashboardAlerts"
import { ConcursoStatusBadge } from "@/components/admin/ConcursoStatusBadge"
import { ConcursoStatus } from "@/types/concurso"

import {
  getDashboardStats,
  getPostsPerMonth,
  getConcursosByArea,
  getDashboardAlerts,
  getRecentPosts,
  getFeaturedConcursos,
  getRadarData,
  DashboardStats,
  PostsPerMonth,
  ConcursosByArea,
  DashboardAlert,
  RecentPost,
  FeaturedConcurso
} from "./dashboard-actions"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [postsPerMonth, setPostsPerMonth] = useState<PostsPerMonth[]>([])
  const [concursosByArea, setConcursosByArea] = useState<ConcursosByArea[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [featuredConcursos, setFeaturedConcursos] = useState<FeaturedConcurso[]>([])
  const [radarData, setRadarData] = useState<RadarItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      const [
        statsData,
        postsData,
        concursosData,
        alertsData,
        recentData,
        featuredData,
        radar
      ] = await Promise.all([
        getDashboardStats(),
        getPostsPerMonth(),
        getConcursosByArea(),
        getDashboardAlerts(),
        getRecentPosts(5),
        getFeaturedConcursos(5),
        getRadarData(5)
      ])
      
      setStats(statsData)
      setPostsPerMonth(postsData)
      setConcursosByArea(concursosData)
      setAlerts(alertsData)
      setRecentPosts(recentData)
      setFeaturedConcursos(featuredData)
      setRadarData(radar)
      setLoading(false)
    }
    
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo à Gazeta dos Concursos. Aqui está um resumo do seu blog.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground">Artigos criados</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats?.postsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">Posts publicados</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPostsDraft || 0}</div>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concursos</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalConcursos || 0}</div>
                <p className="text-xs text-muted-foreground">Cadastrados</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscrições Abertas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats?.concursosAbertos || 0}</div>
                <p className="text-xs text-muted-foreground">Concursos ativos</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
                <p className="text-xs text-muted-foreground">Seções</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Radar de Editais */}
      {!loading && radarData.length > 0 && (
        <div className="grid gap-6">
           <RadarEditais items={radarData} />
        </div>
      )}

      {/* Alertas */}
      {!loading && alerts.length > 0 && (
        <DashboardAlerts alerts={alerts} />
      )}

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Posts por Mês</CardTitle>
            <CardDescription>Últimos 6 meses de publicação</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <PostsPerMonthChart data={postsPerMonth} />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Concursos por Área</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : concursosByArea.length > 0 ? (
              <ConcursosByAreaChart data={concursosByArea} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum concurso cadastrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listas e Ações */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/posts/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Escrever Novo Post
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/concursos/create">
                <Trophy className="mr-2 h-4 w-4" /> Cadastrar Concurso
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/categories">
                <LayoutGrid className="mr-2 h-4 w-4" /> Gerenciar Categorias
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Posts Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Posts Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {post.category && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                          >
                            {post.category.name}
                          </Badge>
                        )}
                        <Badge variant={post.published ? "default" : "outline"} className="text-xs">
                          {post.published ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum post ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Concursos em Destaque */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Concursos Populares</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/concursos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : featuredConcursos.length > 0 ? (
              <div className="space-y-3">
                {featuredConcursos.map((concurso) => (
                  <div 
                    key={concurso.id} 
                    className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted transition-colors group relative"
                  >
                    <Link 
                      href={`/admin/concursos/${concurso.id}/edit`}
                      className="flex-1 min-w-0"
                    >
                      <p className="font-medium text-sm truncate">{concurso.titulo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{concurso.orgao}</span>
                        <ConcursoStatusBadge status={concurso.status as ConcursoStatus} />
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {concurso.visualizacoes}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum concurso ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
