"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  FileText,
  Clock,
  Check,
  Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getCalendarPosts, getKanbanPosts, CalendarPost } from "./actions"

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: FileText },
  review: { label: 'Revisão', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800', icon: Clock },
  published: { label: 'Publicado', color: 'bg-green-100 text-green-800', icon: Check }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>([])
  const [kanbanPosts, setKanbanPosts] = useState<{
    draft: CalendarPost[]
    review: CalendarPost[]
    scheduled: CalendarPost[]
    published: CalendarPost[]
  }>({ draft: [], review: [], scheduled: [], published: [] })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'kanban'>('calendar')

  const loadData = useCallback(async () => {
    setLoading(true)
    
    const [calendarData, kanbanData] = await Promise.all([
      getCalendarPosts(currentDate.getMonth() + 1, currentDate.getFullYear()),
      getKanbanPosts()
    ])
    
    setCalendarPosts(calendarData)
    setKanbanPosts(kanbanData)
    setLoading(false)
  }, [currentDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getPostsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return calendarPosts.filter(post => {
      const postDate = post.scheduled_at 
        ? new Date(post.scheduled_at) 
        : new Date(post.created_at)
      return postDate.toDateString() === date.toDateString()
    })
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const days = []
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-b border-r" />)
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const postsToday = getPostsForDay(day)
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border-b border-r p-1 overflow-hidden ${isToday ? 'bg-primary/5' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {postsToday.slice(0, 2).map(post => (
              <Link 
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="block"
              >
                <div 
                  className="text-xs p-1 rounded truncate"
                  style={{ 
                    backgroundColor: post.category?.color ? `${post.category.color}20` : '#e5e7eb',
                    borderLeft: `2px solid ${post.category?.color || '#9ca3af'}`
                  }}
                >
                  {post.title}
                </div>
              </Link>
            ))}
            {postsToday.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{postsToday.length - 2} mais
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  const renderKanbanColumn = (title: string, posts: CalendarPost[], status: keyof typeof STATUS_CONFIG) => {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon
    
    return (
      <div className="flex-1 min-w-[280px] max-w-[320px]">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{title}</h3>
          <Badge variant="secondary" className="ml-auto">{posts.length}</Badge>
        </div>
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {posts.map(post => (
            <Link key={post.id} href={`/admin/posts/${post.id}/edit`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 mb-2">{post.title}</h4>
                  {post.category && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${post.category.color}20`, 
                        color: post.category.color 
                      }}
                    >
                      {post.category.name}
                    </Badge>
                  )}
                  {post.scheduled_at && (
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(post.scheduled_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum post
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário Editorial</h1>
          <p className="text-muted-foreground">
            Planeje e organize a publicação de conteúdo
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'kanban')}>
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <FileText className="mr-2 h-4 w-4" />
            Kanban
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-20 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <div className="border-t border-l">
                  {/* Cabeçalho dos dias */}
                  <div className="grid grid-cols-7">
                    {DAYS_OF_WEEK.map(day => (
                      <div 
                        key={day} 
                        className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Grid do calendário */}
                  <div className="grid grid-cols-7">
                    {renderCalendar()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {renderKanbanColumn('Rascunhos', kanbanPosts.draft, 'draft')}
              {renderKanbanColumn('Em Revisão', kanbanPosts.review, 'review')}
              {renderKanbanColumn('Agendados', kanbanPosts.scheduled, 'scheduled')}
              {renderKanbanColumn('Publicados', kanbanPosts.published, 'published')}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
