"use client"

import { useState } from "react"
import { X, StickyNote, AlertCircle, Clock, Lightbulb, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
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
import { toast } from "sonner"
import { 
  CalendarNote, 
  createCalendarNote, 
  updateCalendarNote, 
  deleteCalendarNote,
  toggleNoteCompletion 
} from "../actions"

const NOTE_TYPES = {
  general: { label: 'Geral', icon: StickyNote, color: '#3b82f6' },
  reminder: { label: 'Lembrete', icon: Clock, color: '#f59e0b' },
  deadline: { label: 'Prazo', icon: AlertCircle, color: '#ef4444' },
  idea: { label: 'Ideia', icon: Lightbulb, color: '#22c55e' }
}

const PRIORITIES = {
  low: { label: 'Baixa', color: '#94a3b8' },
  normal: { label: 'Normal', color: '#3b82f6' },
  high: { label: 'Alta', color: '#f59e0b' },
  urgent: { label: 'Urgente', color: '#ef4444' }
}

const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  existingNote?: CalendarNote | null
  onSuccess: () => void
}

export function NoteModal({ isOpen, onClose, selectedDate, existingNote, onSuccess }: NoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: existingNote?.title || '',
    content: existingNote?.content || '',
    color: existingNote?.color || '#3b82f6',
    note_type: existingNote?.note_type || 'general' as CalendarNote['note_type'],
    priority: existingNote?.priority || 'normal' as CalendarNote['priority'],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setLoading(true)

    try {
      if (existingNote) {
        const result = await updateCalendarNote(existingNote.id, formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Nota atualizada!')
          onSuccess()
          onClose()
        }
      } else {
        const result = await createCalendarNote({
          ...formData,
          note_date: selectedDate.toISOString().split('T')[0]
        })
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Nota criada!')
          onSuccess()
          onClose()
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingNote) return
    
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return

    setLoading(true)
    try {
      const result = await deleteCalendarNote(existingNote.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Nota excluída!')
        onSuccess()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async () => {
    if (!existingNote) return

    setLoading(true)
    try {
      const result = await toggleNoteCompletion(existingNote.id, !existingNote.completed)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(existingNote.completed ? 'Nota reaberta!' : 'Nota concluída!')
        onSuccess()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const NoteTypeIcon = NOTE_TYPES[formData.note_type].icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NoteTypeIcon className="h-5 w-5" style={{ color: formData.color }} />
            {existingNote ? 'Editar Nota' : 'Nova Nota'}
            <Badge variant="secondary" className="ml-auto">
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Lembrar de publicar sobre INSS"
              autoFocus
            />
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="content">Detalhes</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Notas adicionais..."
              rows={3}
            />
          </div>

          {/* Tipo e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.note_type}
                onValueChange={(v) => setFormData({ 
                  ...formData, 
                  note_type: v as CalendarNote['note_type'],
                  color: NOTE_TYPES[v as keyof typeof NOTE_TYPES].color
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NOTE_TYPES).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as CalendarNote['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITIES).map(([key, { label, color }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cores */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color 
                      ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {existingNote && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleComplete}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {existingNote.completed ? 'Reabrir' : 'Concluir'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : existingNote ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Lista de notas do dia
interface DayNotesListProps {
  notes: CalendarNote[]
  onNoteClick: (note: CalendarNote) => void
  onToggleComplete: (noteId: string, completed: boolean) => void
}

export function DayNotesList({ notes, onNoteClick, onToggleComplete }: DayNotesListProps) {
  if (notes.length === 0) return null

  return (
    <div className="space-y-1">
      {notes.map((note) => {
        const NoteIcon = NOTE_TYPES[note.note_type].icon
        const priorityColor = PRIORITIES[note.priority].color

        return (
          <div
            key={note.id}
            onClick={() => onNoteClick(note)}
            className={`
              group flex items-start gap-2 p-2 rounded-lg cursor-pointer
              transition-all hover:shadow-md
              ${note.completed ? 'opacity-50' : ''}
            `}
            style={{ 
              backgroundColor: `${note.color}15`,
              borderLeft: `3px solid ${note.color}`
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete(note.id, !note.completed)
              }}
              className={`
                mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 
                transition-colors flex items-center justify-center
                ${note.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {note.completed && <Check className="h-3 w-3" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <NoteIcon className="h-3 w-3 flex-shrink-0" style={{ color: note.color }} />
                <span 
                  className={`text-xs font-medium truncate ${note.completed ? 'line-through' : ''}`}
                >
                  {note.title}
                </span>
              </div>
              {note.content && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {note.content}
                </p>
              )}
            </div>

            {note.priority !== 'normal' && (
              <span 
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                style={{ backgroundColor: priorityColor }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
