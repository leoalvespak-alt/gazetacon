"use client"

import { useState, useEffect } from "react"
import { 
  X, FileText, Link as LinkIcon, Target, Clock, Users, 
  Tag, MessageSquare, Plus, Trash2, ExternalLink, Send, BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  EditorialPauta, 
  PautaComment,
  createPauta, 
  updatePauta, 
  deletePauta,
  getPautaComments,
  addPautaComment,
  deletePautaComment,
  getCategories,
  getAdminUsers,
  getConcursosList
} from "../actions"

const PAUTA_STATUS = {
  idea: { label: 'Ideia', color: '#94a3b8', icon: '💡' },
  approved: { label: 'Aprovada', color: '#22c55e', icon: '✅' },
  in_progress: { label: 'Em Andamento', color: '#3b82f6', icon: '🔨' },
  review: { label: 'Em Revisão', color: '#f59e0b', icon: '👀' },
  scheduled: { label: 'Agendada', color: '#8b5cf6', icon: '📅' },
  published: { label: 'Publicada', color: '#10b981', icon: '🚀' },
  archived: { label: 'Arquivada', color: '#6b7280', icon: '📦' }
}

const CONTENT_TYPES = [
  { value: 'artigo', label: 'Artigo', icon: '📝' },
  { value: 'noticia', label: 'Notícia', icon: '📰' },
  { value: 'tutorial', label: 'Tutorial', icon: '📚' },
  { value: 'lista', label: 'Lista', icon: '📋' },
  { value: 'analise', label: 'Análise', icon: '🔍' },
  { value: 'guia', label: 'Guia Completo', icon: '🗺️' }
]

interface PautaModalProps {
  isOpen: boolean
  onClose: () => void
  existingPauta?: EditorialPauta | null
  selectedDate?: Date | null
  onSuccess: () => void
}

export function PautaModal({ isOpen, onClose, existingPauta, selectedDate, onSuccess }: PautaModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')
  const [comments, setComments] = useState<PautaComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [concursos, setConcursos] = useState<{ id: string; titulo: string; orgao: string }[]>([])
  
  const [formData, setFormData] = useState({
    title: existingPauta?.title || '',
    briefing: existingPauta?.briefing || '',
    keywords: existingPauta?.keywords || [] as string[],
    target_audience: existingPauta?.target_audience || '',
    content_type: existingPauta?.content_type || 'artigo',
    reference_links: existingPauta?.reference_links || [] as string[],
    inspiration_notes: existingPauta?.inspiration_notes || '',
    category_id: existingPauta?.category_id || '',
    concurso_id: existingPauta?.concurso_id || '',
    target_date: existingPauta?.target_date || selectedDate?.toISOString().split('T')[0] || '',
    status: existingPauta?.status || 'idea' as EditorialPauta['status'],
    assigned_to: existingPauta?.assigned_to || '',
    estimated_time_hours: existingPauta?.estimated_time_hours || undefined as number | undefined,
    word_count_target: existingPauta?.word_count_target || undefined as number | undefined,
  })

  const [newKeyword, setNewKeyword] = useState('')
  const [newLink, setNewLink] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (existingPauta) {
        loadComments()
      }
    }
  }, [isOpen, existingPauta])

  const loadInitialData = async () => {
    const [cats, usrs, concs] = await Promise.all([
      getCategories(),
      getAdminUsers(),
      getConcursosList()
    ])
    setCategories(cats)
    setUsers(usrs)
    setConcursos(concs)
  }

  const loadComments = async () => {
    if (existingPauta) {
      const data = await getPautaComments(existingPauta.id)
      setComments(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        category_id: formData.category_id || undefined,
        concurso_id: formData.concurso_id || undefined,
        assigned_to: formData.assigned_to || undefined,
        target_date: formData.target_date || undefined
      }

      if (existingPauta) {
        const result = await updatePauta(existingPauta.id, dataToSend)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Pauta atualizada!')
          onSuccess()
          onClose()
        }
      } else {
        const result = await createPauta(dataToSend)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Pauta criada!')
          onSuccess()
          onClose()
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingPauta) return
    
    if (!confirm('Tem certeza que deseja excluir esta pauta?')) return

    setLoading(true)
    try {
      const result = await deletePauta(existingPauta.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Pauta excluída!')
        onSuccess()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] })
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) })
  }

  const handleAddLink = () => {
    if (newLink.trim() && !formData.reference_links.includes(newLink.trim())) {
      setFormData({ ...formData, reference_links: [...formData.reference_links, newLink.trim()] })
      setNewLink('')
    }
  }

  const handleRemoveLink = (link: string) => {
    setFormData({ ...formData, reference_links: formData.reference_links.filter(l => l !== link) })
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || !existingPauta) return

    setLoading(true)
    try {
      const result = await addPautaComment(existingPauta.id, newComment.trim())
      if (result.error) {
        toast.error(result.error)
      } else {
        setNewComment('')
        loadComments()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setLoading(true)
    try {
      const result = await deletePautaComment(commentId)
      if (result.error) {
        toast.error(result.error)
      } else {
        loadComments()
      }
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = PAUTA_STATUS[formData.status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {existingPauta ? 'Editar Pauta' : 'Nova Pauta Editorial'}
            <Badge 
              variant="secondary" 
              className="ml-auto"
              style={{ 
                backgroundColor: `${statusConfig.color}20`,
                color: statusConfig.color
              }}
            >
              {statusConfig.icon} {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {existingPauta && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'details' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-1" />
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'comments' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Comentários
              {comments.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {comments.length}
                </Badge>
              )}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-4 p-1">
              {/* Título e Status */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title">Título da Pauta *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Guia completo para o concurso do INSS 2024"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as EditorialPauta['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAUTA_STATUS).map(([key, { label, icon }]) => (
                        <SelectItem key={key} value={key}>
                          {icon} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Briefing */}
              <div className="space-y-2">
                <Label htmlFor="briefing">Briefing / Descrição</Label>
                <Textarea
                  id="briefing"
                  value={formData.briefing}
                  onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
                  placeholder="Descreva o que deve ser abordado, pontos importantes, estrutura sugerida..."
                  rows={4}
                />
              </div>

              {/* Tipo de Conteúdo e Categoria */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Conteúdo</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(v) => setFormData({ ...formData, content_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(({ value, label, icon }) => (
                        <SelectItem key={value} value={value}>
                          {icon} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: cat.color }} 
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Concurso Relacionado e Responsável */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Concurso Relacionado</Label>
                  <Select
                    value={formData.concurso_id}
                    onValueChange={(v) => setFormData({ ...formData, concurso_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {concursos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.titulo} - {c.orgao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Atribuir a..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            {user.name || user.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data Alvo e Estimativas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_date">Data Alvo</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Tempo Estimado (h)</Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    min="0"
                    value={formData.estimated_time_hours || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estimated_time_hours: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Ex: 4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="word_count">Meta de Palavras</Label>
                  <Input
                    id="word_count"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.word_count_target || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      word_count_target: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Ex: 1500"
                  />
                </div>
              </div>

              {/* Público-alvo */}
              <div className="space-y-2">
                <Label htmlFor="target_audience">
                  <Target className="h-4 w-4 inline mr-1" />
                  Público-alvo
                </Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="Ex: Candidatos iniciantes que vão prestar concurso para área fiscal"
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>
                  <Tag className="h-4 w-4 inline mr-1" />
                  Palavras-chave SEO
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Adicionar palavra-chave..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={handleAddKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.keywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="gap-1">
                        {kw}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Links de Referência */}
              <div className="space-y-2">
                <Label>
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  Links de Referência
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={handleAddLink}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.reference_links.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.reference_links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1">
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="truncate flex-1 text-primary hover:underline"
                        >
                          {link}
                        </a>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLink(link)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas de Inspiração */}
              <div className="space-y-2">
                <Label htmlFor="inspiration">Notas de Inspiração</Label>
                <Textarea
                  id="inspiration"
                  value={formData.inspiration_notes}
                  onChange={(e) => setFormData({ ...formData, inspiration_notes: e.target.value })}
                  placeholder="Anotações, ideias, pontos a explorar..."
                  rows={3}
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-4 border-t">
                {existingPauta ? (
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
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : existingPauta ? 'Atualizar' : 'Criar Pauta'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col h-full p-1">
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum comentário ainda</p>
                    <p className="text-sm">Seja o primeiro a comentar nesta pauta</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(comment.author?.name || comment.author?.email || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {comment.author?.name || comment.author?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New Comment Input */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendComment} 
                    disabled={loading || !newComment.trim()}
                    size="icon"
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Card de Pauta para exibição em lista
interface PautaCardProps {
  pauta: EditorialPauta
  onClick: () => void
}

export function PautaCard({ pauta, onClick }: PautaCardProps) {
  const statusConfig = PAUTA_STATUS[pauta.status]

  return (
    <div 
      onClick={onClick}
      className="p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-2">
        <Badge 
          variant="secondary"
          className="text-xs"
          style={{ 
            backgroundColor: `${statusConfig.color}20`,
            color: statusConfig.color
          }}
        >
          {statusConfig.icon}
        </Badge>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2">{pauta.title}</h4>
          {pauta.briefing && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {pauta.briefing}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {pauta.category && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: pauta.category.color, color: pauta.category.color }}
              >
                {pauta.category.name}
              </Badge>
            )}
            {pauta.target_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(pauta.target_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            )}
            {(pauta.comments_count ?? 0) > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {pauta.comments_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
