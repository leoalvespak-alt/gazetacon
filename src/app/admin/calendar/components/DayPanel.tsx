"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  X, Plus, ChevronRight, FileText, StickyNote, 
  Trophy, CalendarCheck, BookOpen, Clock, ExternalLink,
  ChevronDown, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarEvent, CalendarNote, EditorialPauta } from "../actions"

const EVENT_ICONS = {
  post: FileText,
  note: StickyNote,
  concurso_inscricao: CalendarCheck,
  concurso_prova: Trophy,
  concurso_resultado: Trophy,
  pauta: BookOpen
}

const EVENT_LABELS = {
  post: 'Post',
  note: 'Nota',
  concurso_inscricao: 'Inscrição',
  concurso_prova: 'Prova',
  concurso_resultado: 'Resultado',
  pauta: 'Pauta'
}

interface DayPanelProps {
  selectedDate: Date
  events: CalendarEvent[]
  notes: CalendarNote[]
  onClose: () => void
  onAddNote: () => void
  onAddPauta: () => void
  onEditNote: (note: CalendarNote) => void
  onEditPauta: (pauta: EditorialPauta) => void
  onToggleNoteComplete: (noteId: string, completed: boolean) => void
}

export function DayPanel({ 
  selectedDate, 
  events, 
  notes,
  onClose, 
  onAddNote,
  onAddPauta,
  onEditNote,
  onToggleNoteComplete
}: DayPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    posts: true,
    notes: true,
    concursos: true,
    pautas: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const dayEvents = events.filter(e => {
    const eventDate = new Date(e.date + 'T00:00:00')
    return eventDate.toDateString() === selectedDate.toDateString()
  })

  const dayNotes = notes.filter(n => {
    const noteDate = new Date(n.note_date + 'T00:00:00')
    return noteDate.toDateString() === selectedDate.toDateString()
  })

  const posts = dayEvents.filter(e => e.type === 'post')
  const concursosEvents = dayEvents.filter(e => 
    e.type === 'concurso_inscricao' || 
    e.type === 'concurso_prova' || 
    e.type === 'concurso_resultado'
  )
  const pautasEvents = dayEvents.filter(e => e.type === 'pauta')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const isToday = new Date().toDateString() === selectedDate.toDateString()

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={isToday ? "default" : "secondary"}>
            {isToday ? 'Hoje' : formatDate(selectedDate).split(',')[0]}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-lg font-semibold capitalize">
          {formatDate(selectedDate).split(',').slice(1).join(',')}
        </h3>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={onAddNote} className="flex-1">
            <StickyNote className="h-4 w-4 mr-1" />
            Nota
          </Button>
          <Button size="sm" variant="outline" onClick={onAddPauta} className="flex-1">
            <BookOpen className="h-4 w-4 mr-1" />
            Pauta
          </Button>
          <Button size="sm" variant="default" asChild className="flex-1">
            <Link href="/admin/posts/create">
              <Plus className="h-4 w-4 mr-1" />
              Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Posts Section */}
        {posts.length > 0 && (
          <section>
            <button 
              onClick={() => toggleSection('posts')}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.posts ? '' : '-rotate-90'}`} />
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Posts</span>
              <Badge variant="secondary" className="ml-auto">{posts.length}</Badge>
            </button>
            {expandedSections.posts && (
              <div className="space-y-2 pl-6">
                {posts.map((event) => (
                  <Link 
                    key={event.id} 
                    href={event.link || '#'}
                    className="block"
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        <div 
                          className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">{event.title}</h4>
                          {event.subtitle && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {event.subtitle}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <span style={{ 
                              color: event.metadata?.status === 'published' ? '#22c55e' : 
                                     event.metadata?.status === 'scheduled' ? '#3b82f6' : '#94a3b8'
                            }}>
                              {event.metadata?.status === 'published' ? '✓ Publicado' : 
                               event.metadata?.status === 'scheduled' ? '⏰ Agendado' : '📝 Rascunho'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Notes Section */}
        <section>
          <button 
            onClick={() => toggleSection('notes')}
            className="flex items-center gap-2 w-full text-left mb-2"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.notes ? '' : '-rotate-90'}`} />
            <StickyNote className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-sm">Notas</span>
            <Badge variant="secondary" className="ml-auto">{dayNotes.length}</Badge>
          </button>
          {expandedSections.notes && (
            <div className="space-y-2 pl-6">
              {dayNotes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>Nenhuma nota para este dia</p>
                  <Button variant="link" size="sm" onClick={onAddNote}>
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar nota
                  </Button>
                </div>
              ) : (
                dayNotes.map((note) => (
                  <Card 
                    key={note.id} 
                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      note.completed ? 'opacity-60' : ''
                    }`}
                    onClick={() => onEditNote(note)}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleNoteComplete(note.id, !note.completed)
                        }}
                        className={`
                          mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 
                          transition-colors flex items-center justify-center
                          ${note.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        {note.completed && <Check className="h-3 w-3" />}
                      </button>
                      <div 
                        className="w-1 min-h-[30px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: note.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${note.completed ? 'line-through' : ''}`}>
                          {note.title}
                        </h4>
                        {note.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {note.content}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {note.note_type === 'general' ? 'Geral' :
                             note.note_type === 'reminder' ? 'Lembrete' :
                             note.note_type === 'deadline' ? 'Prazo' : 'Ideia'}
                          </Badge>
                          {note.priority !== 'normal' && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{
                                backgroundColor: note.priority === 'urgent' ? '#fee2e2' :
                                                note.priority === 'high' ? '#fef3c7' : '#f1f5f9',
                                color: note.priority === 'urgent' ? '#dc2626' :
                                       note.priority === 'high' ? '#d97706' : '#64748b'
                              }}
                            >
                              {note.priority === 'urgent' ? '🔴 Urgente' :
                               note.priority === 'high' ? '🟠 Alta' : '⚪ Baixa'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </section>

        {/* Concursos Events Section */}
        {concursosEvents.length > 0 && (
          <section>
            <button 
              onClick={() => toggleSection('concursos')}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.concursos ? '' : '-rotate-90'}`} />
              <Trophy className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">Concursos</span>
              <Badge variant="secondary" className="ml-auto">{concursosEvents.length}</Badge>
            </button>
            {expandedSections.concursos && (
              <div className="space-y-2 pl-6">
                {concursosEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={event.link || '#'}
                    className="block"
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${event.color}20` }}
                        >
                          <span className="text-lg">
                            {event.type === 'concurso_inscricao' ? '📝' :
                             event.type === 'concurso_prova' ? '📋' : '🏆'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{event.title}</h4>
                          {event.subtitle && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {event.subtitle}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Pautas Section */}
        {pautasEvents.length > 0 && (
          <section>
            <button 
              onClick={() => toggleSection('pautas')}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.pautas ? '' : '-rotate-90'}`} />
              <BookOpen className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-sm">Pautas</span>
              <Badge variant="secondary" className="ml-auto">{pautasEvents.length}</Badge>
            </button>
            {expandedSections.pautas && (
              <div className="space-y-2 pl-6">
                {pautasEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-1 min-h-[30px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{event.title.replace('📌 ', '')}</h4>
                        {event.subtitle && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {event.subtitle}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && dayNotes.length === 0 && concursosEvents.length === 0 && pautasEvents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Dia livre!</p>
            <p className="text-sm mt-1">Nenhum evento programado</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={onAddNote}>
                <StickyNote className="h-4 w-4 mr-1" />
                Nota
              </Button>
              <Button size="sm" variant="outline" onClick={onAddPauta}>
                <BookOpen className="h-4 w-4 mr-1" />
                Pauta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
