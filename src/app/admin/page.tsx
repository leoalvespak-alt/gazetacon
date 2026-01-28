"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, LayoutGrid, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const { data: posts } = await supabase.from("posts").select("published")
      const { count: catCount } = await supabase.from("categories").select("*", { count: "exact", head: true })

      if (posts) {
        setStats({
          totalPosts: posts.length,
          publishedPosts: posts.filter((p: { published: boolean }) => p.published).length,
          draftPosts: posts.filter((p: { published: boolean }) => !p.published).length,
          categories: catCount || 0
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [supabase])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo à Gazeta dos Concursos. Aqui está um resumo do seu blog.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Artigos criados no total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">Visíveis para o público</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.draftPosts}</div>
            <p className="text-xs text-muted-foreground">Aguardando finalização</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.categories}</div>
            <p className="text-xs text-muted-foreground">Seções organizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/posts/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Escrever Novo Post
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/categories">
                <LayoutGrid className="mr-2 h-4 w-4" /> Gerenciar Categorias
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sobre a Sessão</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">
               Você está logado como administrador. Todas as alterações feitas aqui refletirão imediatamente no site Gazeta dos Concursos (dependendo do cache de 60s).
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
