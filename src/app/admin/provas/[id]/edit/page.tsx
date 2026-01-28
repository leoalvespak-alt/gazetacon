"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ConcursoSelector } from "@/components/admin/posts/ConcursoSelector"
import { getProvaById, updateProva, deleteProva } from "../../actions"
import { ProvaFormData, ANOS_DISPONIVEIS } from "@/types/prova"
import { BANCAS_COMUNS } from "@/types/concurso"
import { toast } from "sonner"

export default function EditProvaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState<ProvaFormData>({
    titulo: "",
    orgao: "",
    banca: "",
    ano: new Date().getFullYear(),
    cargo: "",
    prova_url: "",
    gabarito_url: "",
    gabarito_comentado_url: "",
    total_questoes: 0,
    concurso_id: null
  })

  useEffect(() => {
    const loadProva = async () => {
      setLoading(true)
      const result = await getProvaById(id)
      
      if (result.error) {
        toast.error("Erro ao carregar prova")
        router.push("/admin/provas")
        return
      }
      
      if (result.data) {
        setFormData({
          titulo: result.data.titulo,
          orgao: result.data.orgao,
          banca: result.data.banca || "",
          ano: result.data.ano,
          cargo: result.data.cargo || "",
          prova_url: result.data.prova_url || "",
          gabarito_url: result.data.gabarito_url || "",
          gabarito_comentado_url: result.data.gabarito_comentado_url || "",
          total_questoes: result.data.total_questoes || 0,
          concurso_id: result.data.concurso_id
        })
      }
      
      setLoading(false)
    }
    
    loadProva()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo || !formData.orgao || !formData.ano) {
      toast.error("Preencha os campos obrigatórios")
      return
    }
    
    setSaving(true)
    
    const result = await updateProva(id, formData)
    
    if (result.error) {
      toast.error("Erro ao atualizar prova", { description: result.error })
    } else {
      toast.success("Prova atualizada com sucesso!")
      router.push("/admin/provas")
    }
    
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    
    const result = await deleteProva(id)
    
    if (result.error) {
      toast.error("Erro ao excluir prova", { description: result.error })
    } else {
      toast.success("Prova excluída com sucesso!")
      router.push("/admin/provas")
    }
    
    setDeleting(false)
    setDeleteDialogOpen(false)
  }

  const updateField = <K extends keyof ProvaFormData>(field: K, value: ProvaFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/provas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Prova</h1>
            <p className="text-muted-foreground truncate max-w-md">
              {formData.titulo}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identificação */}
            <Card>
              <CardHeader>
                <CardTitle>Identificação</CardTitle>
                <CardDescription>Informações básicas da prova</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Prova *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Prova de Analista Judiciário - Área Administrativa"
                    value={formData.titulo}
                    onChange={(e) => updateField("titulo", e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgao">Órgão *</Label>
                    <Input
                      id="orgao"
                      placeholder="Ex: TRT, TRF, INSS"
                      value={formData.orgao}
                      onChange={(e) => updateField("orgao", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="banca">Banca</Label>
                    <Select 
                      value={formData.banca || ""}
                      onValueChange={(v) => updateField("banca", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a banca" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANCAS_COMUNS.map((banca) => (
                          <SelectItem key={banca} value={banca}>{banca}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano *</Label>
                    <Select 
                      value={formData.ano.toString()}
                      onValueChange={(v) => updateField("ano", parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANOS_DISPONIVEIS.map((ano) => (
                          <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      placeholder="Ex: Analista Judiciário"
                      value={formData.cargo || ""}
                      onChange={(e) => updateField("cargo", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_questoes">Total de Questões</Label>
                  <Input
                    id="total_questoes"
                    type="number"
                    min={0}
                    value={formData.total_questoes || ""}
                    onChange={(e) => updateField("total_questoes", parseInt(e.target.value) || 0)}
                    placeholder="Ex: 120"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Arquivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Arquivos
                </CardTitle>
                <CardDescription>URLs dos arquivos PDF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prova_url">URL da Prova (PDF)</Label>
                  <Input
                    id="prova_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.prova_url || ""}
                    onChange={(e) => updateField("prova_url", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gabarito_url">URL do Gabarito (PDF)</Label>
                  <Input
                    id="gabarito_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.gabarito_url || ""}
                    onChange={(e) => updateField("gabarito_url", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gabarito_comentado_url">URL do Gabarito Comentado (opcional)</Label>
                  <Input
                    id="gabarito_comentado_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.gabarito_comentado_url || ""}
                    onChange={(e) => updateField("gabarito_comentado_url", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Prova
                </Button>
              </CardContent>
            </Card>

            {/* Vínculo com Concurso */}
            <Card>
              <CardHeader>
                <CardTitle>Vínculo</CardTitle>
                <CardDescription>Associe a um concurso existente</CardDescription>
              </CardHeader>
              <CardContent>
                <ConcursoSelector
                  value={formData.concurso_id || null}
                  onChange={(cId) => updateField("concurso_id", cId)}
                  label="Concurso Relacionado"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Prova</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta prova? Esta ação não pode ser desfeita.
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
