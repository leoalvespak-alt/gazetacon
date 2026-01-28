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
  Plus,
  LayoutGrid,
  List,
  Filter,
  StickyNote,
  BookOpen,
  Trophy,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

import { 
  getCalendarPosts, 
  getKanbanPosts, 
  getAllCalendarEvents,
  getCalendarNotes,
  getPautas,
  toggleNoteCompletion,
  CalendarPost,
  CalendarEvent,
  CalendarNote,
  EditorialPauta
} from "./actions"

import { NoteModal } from "./components/NoteModal"
import { PautaModal, PautaCard } from "./components/PautaModal"
import { DayPanel } from "./components/DayPanel"

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

const PAUTA_STATUS = {
  idea: { label: 'Ideias', color: '#94a3b8', icon: '💡' },
  approved: { label: 'Aprovadas', color: '#22c55e', icon: '✅' },
  in_progress: { label: 'Em Andamento', color: '#3b82f6', icon: '🔨' },
  review: { label: 'Em Revisão', color: '#f59e0b', icon: '👀' },
  scheduled: { label: 'Agendadas', color: '#8b5cf6', icon: '📅' },
  published: { label: 'Publicadas', color: '#10b981', icon: '🚀' },
  archived: { label: 'Arquivadas', color: '#6b7280', icon: '📦' }
}

const EVENT_FILTERS = {
  posts: { label: 'Posts', icon: FileText, color: '#3b82f6' },
  notes: { label: 'Notas', icon: StickyNote, color: '#f59e0b' },
  concursos: { label: 'Concursos', icon: Trophy, color: '#8b5cf6' },
  pautas: { label: 'Pautas', icon: BookOpen, color: '#22c55e' }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<'calendar' | 'kanban' | 'pautas'>('calendar')
  const [loading, setLoading] = useState(true)
  
  // Data
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([])
  const [kanbanPosts, setKanbanPosts] = useState<{
    draft: CalendarPost[]
    review: CalendarPost[]
    scheduled: CalendarPost[]
    published: CalendarPost[]
  }>({ draft: [], review: [], scheduled: [], published: [] })
  const [pautas, setPautas] = useState<EditorialPauta[]>([])
  
  // Filters
  const [visibleEvents, setVisibleEvents] = useState({
    posts: true,
    notes: true,
    concursos: true,
    pautas: true
  })
  const [pautaStatusFilter, setPautaStatusFilter] = useState<string>('all')
  
  // UI State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDayPanel, setShowDayPanel] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [pautaModalOpen, setPautaModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CalendarNote | null>(null)
  const [editingPauta, setEditingPauta] = useState<EditorialPauta | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const [events, notes, kanban, pautasData] = await Promise.all([
        getAllCalendarEvents(month, year),
        getCalendarNotes(month, year),
        getKanbanPosts(),
        getPautas({ status: pautaStatusFilter !== 'all' ? pautaStatusFilter : undefined })
      ])
      
      setCalendarEvents(events)
      setCalendarNotes(notes)
      setKanbanPosts(kanban)
      setPautas(pautasData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
    }
    setLoading(false)
  }, [currentDate, pautaStatusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setShowDayPanel(false)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setShowDayPanel(false)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
    setShowDayPanel(true)
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    
    return calendarEvents.filter(event => {
      // Filter by visibility
      if (event.type === 'post' && !visibleEvents.posts) return false
      if (event.type === 'note' && !visibleEvents.notes) return false
      if ((event.type === 'concurso_inscricao' || event.type === 'concurso_prova' || event.type === 'concurso_resultado') && !visibleEvents.concursos) return false
      if (event.type === 'pauta' && !visibleEvents.pautas) return false
      
      return event.date === dateStr
    })
  }

  const getNotesForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    return calendarNotes.filter(note => note.note_date === dateStr)
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)
    setShowDayPanel(true)
  }

  const handleAddNote = () => {
    setEditingNote(null)
    setNoteModalOpen(true)
  }

  const handleEditNote = (note: CalendarNote) => {
    setEditingNote(note)
    setSelectedDate(new Date(note.note_date + 'T00:00:00'))
    setNoteModalOpen(true)
  }

  const handleAddPauta = () => {
    setEditingPauta(null)
    setPautaModalOpen(true)
  }

  const handleEditPauta = (pauta: EditorialPauta) => {
    setEditingPauta(pauta)
    setPautaModalOpen(true)
  }

  const handleToggleNoteComplete = async (noteId: string, completed: boolean) => {
    const result = await toggleNoteCompletion(noteId, completed)
    if (result.error) {
      toast.error(result.error)
    } else {
      loadData()
    }
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const days = []
    
    // Empty days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 border-b border-r bg-muted/20" />)
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const eventsToday = getEventsForDay(day)
      const notesToday = getNotesForDay(day)
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
      const isSelected = selectedDate?.toDateString() === new Date(year, month, day).toDateString()
      
      // Count by type
      const postCount = eventsToday.filter(e => e.type === 'post').length
      const concursoCount = eventsToday.filter(e => 
        e.type === 'concurso_inscricao' || e.type === 'concurso_prova' || e.type === 'concurso_resultado'
      ).length
      const pautaCount = eventsToday.filter(e => e.type === 'pauta').length
      const noteCount = notesToday.length
      
      days.push(
        <div 
          key={day} 
          onClick={() => handleDayClick(day)}
          className={`
            h-28 border-b border-r p-1.5 overflow-hidden cursor-pointer
            transition-colors hover:bg-muted/50
            ${isToday ? 'bg-primary/5' : ''}
            ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`
              text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
              ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
            `}>
              {day}
            </span>
            {(postCount + concursoCount + pautaCount + noteCount) > 0 && (
              <div className="flex gap-0.5">
                {postCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
                {noteCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                {concursoCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
                {pautaCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            {eventsToday.slice(0, 3).map(event => (
              <div 
                key={event.id}
                className="text-xs p-0.5 px-1 rounded truncate"
                style={{ 
                  backgroundColor: `${event.color}15`,
                  borderLeft: `2px solid ${event.color}`
                }}
              >
                {event.type === 'post' ? event.title : 
                 event.type === 'note' ? `📝 ${event.title}` :
                 event.type === 'pauta' ? event.title :
                 event.title}
              </div>
            ))}
            {eventsToday.length > 3 && (
              <div className="text-xs text-muted-foreground pl-1">
                +{eventsToday.length - 3} mais
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

  const renderPautasView = () => {
    const groupedPautas = pautas.reduce((acc, pauta) => {
      const status = pauta.status
      if (!acc[status]) acc[status] = []
      acc[status].push(pauta)
      return acc
    }, {} as Record<string, EditorialPauta[]>)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(PAUTA_STATUS).map(([status, config]) => {
          const statusPautas = groupedPautas[status] || []
          if (pautaStatusFilter !== 'all' && pautaStatusFilter !== status) return null
          
          return (
            <Card key={status} className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                  <Badge variant="secondary" className="ml-auto">{statusPautas.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {statusPautas.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nenhuma pauta
                  </div>
                ) : (
                  statusPautas.map(pauta => (
                    <PautaCard 
                      key={pauta.id} 
                      pauta={pauta} 
                      onClick={() => handleEditPauta(pauta)} 
                    />
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all ${showDayPanel ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendário Editorial</h1>
            <p className="text-muted-foreground">
              Planeje e organize a publicação de conteúdo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleAddNote}>
              <StickyNote className="mr-2 h-4 w-4" />
              Nova Nota
            </Button>
            <Button variant="outline" onClick={handleAddPauta}>
              <BookOpen className="mr-2 h-4 w-4" />
              Nova Pauta
            </Button>
            <Button asChild>
              <Link href="/admin/posts/create">
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'kanban' | 'pautas')} className="flex-1 flex flex-col px-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="pautas">
                <BookOpen className="mr-2 h-4 w-4" />
                Pautas
              </TabsTrigger>
            </TabsList>

            {view === 'calendar' && (
              <div className="flex items-center gap-2">
                {/* Event Type Filters */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Tipos de Eventos</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(EVENT_FILTERS).map(([key, { label, icon: Icon, color }]) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={visibleEvents[key as keyof typeof visibleEvents]}
                        onCheckedChange={(checked) => 
                          setVisibleEvents(prev => ({ ...prev, [key]: checked }))
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: color }} 
                          />
                          {label}
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoje
                </Button>
              </div>
            )}

            {view === 'pautas' && (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      {pautaStatusFilter === 'all' ? 'Todos os Status' : PAUTA_STATUS[pautaStatusFilter as keyof typeof PAUTA_STATUS]?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={pautaStatusFilter === 'all'}
                      onCheckedChange={() => setPautaStatusFilter('all')}
                    >
                      Todos os Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {Object.entries(PAUTA_STATUS).map(([key, { label, icon }]) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={pautaStatusFilter === key}
                        onCheckedChange={() => setPautaStatusFilter(key)}
                      >
                        {icon} {label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <TabsContent value="calendar" className="flex-1 mt-4">
            <Card className="h-full">
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
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-20 text-muted-foreground">
                    Carregando...
                  </div>
                ) : (
                  <div className="border-t border-l">
                    {/* Days header */}
                    <div className="grid grid-cols-7">
                      {DAYS_OF_WEEK.map(day => (
                        <div 
                          key={day} 
                          className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r bg-muted/30"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7">
                      {renderCalendar()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="font-medium">Legenda:</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Posts
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Notas
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Concursos
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Pautas
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="flex-1 mt-4">
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

          <TabsContent value="pautas" className="flex-1 mt-4 overflow-y-auto">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">
                Carregando...
              </div>
            ) : (
              renderPautasView()
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Day Panel Sidebar */}
      {showDayPanel && selectedDate && (
        <div className="fixed right-0 top-0 h-full w-80 shadow-xl z-50">
          <DayPanel
            selectedDate={selectedDate}
            events={calendarEvents}
            notes={calendarNotes}
            onClose={() => setShowDayPanel(false)}
            onAddNote={() => {
              setEditingNote(null)
              setNoteModalOpen(true)
            }}
            onAddPauta={() => {
              setEditingPauta(null)
              setPautaModalOpen(true)
            }}
            onEditNote={handleEditNote}
            onEditPauta={handleEditPauta}
            onToggleNoteComplete={handleToggleNoteComplete}
          />
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false)
          setEditingNote(null)
        }}
        selectedDate={selectedDate || new Date()}
        existingNote={editingNote}
        onSuccess={loadData}
      />

      {/* Pauta Modal */}
      <PautaModal
        isOpen={pautaModalOpen}
        onClose={() => {
          setPautaModalOpen(false)
          setEditingPauta(null)
        }}
        existingPauta={editingPauta}
        selectedDate={selectedDate}
        onSuccess={loadData}
      />
    </div>
  )
}
