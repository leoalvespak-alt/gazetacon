"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { getConcursoById, updateConcurso, deleteConcurso } from "../../actions"
import { 
  ConcursoFormData, 
  ConcursoCargo,
  ConcursoArea, 
  ConcursoAbrangencia,
  Concurso,
  AREA_LABELS,
  ABRANGENCIA_LABELS,
  ESCOLARIDADE_LABELS,
  ESTADOS_BR,
  BANCAS_COMUNS,
  Escolaridade,
  STATUS_LABELS,
  ConcursoStatus
} from "@/types/concurso"
import { ConcursoStatusBadge } from "@/components/admin/ConcursoStatusBadge"
import { toast } from "sonner"

export default function EditConcursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [concurso, setConcurso] = useState<Concurso | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<ConcursoFormData>({
    titulo: "",
    orgao: "",
    banca: "",
    banca_ultimo_concurso: "",
    banca_definida: false,
    area: undefined,
    abrangencia: "nacional",
    estado: "",
    cidade: "",
    vagas_imediatas: 0,
    vagas_cr: 0,
    salario_min: undefined,
    salario_max: undefined,
    escolaridade: "",
    cargos: [],
    data_publicacao: "",
    data_inscricao_inicio: "",
    data_inscricao_fim: "",
    data_prova: "",
    data_resultado: "",
    edital_url: "",
    site_oficial: "",
    taxa_inscricao: undefined,
    status: "previsto",
    destaque: false
  })
  
  // Cargo being added
  const [novoCargo, setNovoCargo] = useState<ConcursoCargo>({
    nome: "",
    vagas: 0,
    salario: 0,
    escolaridade: ""
  })

  useEffect(() => {
    async function loadConcurso() {
      const result = await getConcursoById(id)
      
      if (result.error || !result.data) {
        toast.error("Concurso não encontrado")
        router.push("/admin/concursos")
        return
      }
      
      setConcurso(result.data)
      setFormData({
        titulo: result.data.titulo,
        orgao: result.data.orgao,
        banca: result.data.banca || "",
        banca_ultimo_concurso: result.data.banca_ultimo_concurso || "",
        banca_definida: result.data.banca_definida || false,
        area: result.data.area as ConcursoArea || undefined,
        abrangencia: result.data.abrangencia as ConcursoAbrangencia || "nacional",
        estado: result.data.estado || "",
        cidade: result.data.cidade || "",
        vagas_imediatas: result.data.vagas_imediatas || 0,
        vagas_cr: result.data.vagas_cr || 0,
        salario_min: result.data.salario_min || undefined,
        salario_max: result.data.salario_max || undefined,
        escolaridade: result.data.escolaridade || "",
        cargos: result.data.cargos || [],
        data_publicacao: result.data.data_publicacao || "",
        data_inscricao_inicio: result.data.data_inscricao_inicio || "",
        data_inscricao_fim: result.data.data_inscricao_fim || "",
        data_prova: result.data.data_prova || "",
        data_resultado: result.data.data_resultado || "",
        edital_url: result.data.edital_url || "",
        site_oficial: result.data.site_oficial || "",
        taxa_inscricao: result.data.taxa_inscricao || undefined,
        status: result.data.status as ConcursoStatus || "previsto",
        destaque: result.data.destaque || false
      })
      setLoading(false)
    }
    
    loadConcurso()
  }, [id, router])

  const handleChange = (field: keyof ConcursoFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddCargo = () => {
    if (!novoCargo.nome) {
      toast.error("Informe o nome do cargo")
      return
    }
    
    setFormData(prev => ({
      ...prev,
      cargos: [...(prev.cargos || []), novoCargo]
    }))
    
    setNovoCargo({ nome: "", vagas: 0, salario: 0, escolaridade: "" })
  }

  const handleRemoveCargo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cargos: (prev.cargos || []).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo || !formData.orgao) {
      toast.error("Preencha os campos obrigatórios: Título e Órgão")
      return
    }
    
    setSaving(true)
    
    const result = await updateConcurso(id, formData)
    
    if (result.error) {
      toast.error("Erro ao atualizar concurso", { description: result.error })
      setSaving(false)
      return
    }
    
    toast.success("Concurso atualizado com sucesso!")
    router.push("/admin/concursos")
  }

  const handleDelete = async () => {
    setDeleting(true)
    
    const result = await deleteConcurso(id)
    
    if (result.error) {
      toast.error("Erro ao excluir concurso", { description: result.error })
      setDeleting(false)
      return
    }
    
    toast.success("Concurso excluído com sucesso!")
    router.push("/admin/concursos")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
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
            <Link href="/admin/concursos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Editar Concurso</h1>
              {concurso && <ConcursoStatusBadge status={concurso.status} />}
            </div>
            <p className="text-muted-foreground">
              Atualize as informações do concurso
            </p>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
            <CardDescription>Informações básicas do concurso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">Título do Concurso *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Concurso INSS 2026 - Técnico do Seguro Social"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Situação do Concurso *</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status || "previsto"}
                  onChange={(e) => handleChange("status", e.target.value as ConcursoStatus)}
                  required
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgao">Órgão *</Label>
                <Input
                  id="orgao"
                  placeholder="Ex: INSS, Receita Federal, Polícia Federal"
                  value={formData.orgao}
                  onChange={(e) => handleChange("orgao", e.target.value)}
                  required
                />
              </div>
              
              {formData.status !== "sem_previsao" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="banca">Banca Organizadora</Label>
                    <select
                      id="banca"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.banca}
                      onChange={(e) => handleChange("banca", e.target.value)}
                    >
                      <option value="">Selecione a banca</option>
                      {BANCAS_COMUNS.map((banca) => (
                        <option key={banca} value={banca}>{banca}</option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.banca && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Switch
                        id="banca_definida"
                        checked={formData.banca_definida || false}
                        onCheckedChange={(checked) => handleChange("banca_definida", checked)}
                      />
                      <Label htmlFor="banca_definida" className="flex flex-col gap-0.5 cursor-pointer">
                        <span className="font-medium">Banca Oficialmente Definida</span>
                        <span className="text-xs text-muted-foreground">
                          Marque se a banca foi confirmada oficialmente pelo edital
                        </span>
                      </Label>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="banca_ultimo_concurso">
                      Banca do Último Concurso
                      <span className="ml-1 text-xs text-muted-foreground">(referência)</span>
                    </Label>
                    <select
                      id="banca_ultimo_concurso"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.banca_ultimo_concurso || ""}
                      onChange={(e) => handleChange("banca_ultimo_concurso", e.target.value)}
                    >
                      <option value="">Não informado</option>
                      {BANCAS_COMUNS.map((banca) => (
                        <option key={banca} value={banca}>{banca}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Útil quando a banca atual ainda não foi definida - serve como referência para os candidatos.
                    </p>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <select
                  id="area"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.area || ""}
                  onChange={(e) => handleChange("area", e.target.value as ConcursoArea)}
                >
                  <option value="">Selecione a área</option>
                  {Object.entries(AREA_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="escolaridade">Escolaridade Mínima</Label>
                <select
                  id="escolaridade"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.escolaridade || ""}
                  onChange={(e) => handleChange("escolaridade", e.target.value)}
                >
                  <option value="">Selecione a escolaridade</option>
                  {Object.entries(ESCOLARIDADE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="abrangencia">Abrangência</Label>
                <select
                  id="abrangencia"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.abrangencia || "nacional"}
                  onChange={(e) => handleChange("abrangencia", e.target.value as ConcursoAbrangencia)}
                >
                  {Object.entries(ABRANGENCIA_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {formData.abrangencia !== "nacional" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <select
                      id="estado"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.estado || ""}
                      onChange={(e) => handleChange("estado", e.target.value)}
                    >
                      <option value="">Selecione o estado</option>
                      {ESTADOS_BR.map((estado) => (
                        <option key={estado.value} value={estado.value}>{estado.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.abrangencia === "municipal" && (
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        placeholder="Nome da cidade"
                        value={formData.cidade || ""}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vagas e Remuneração */}
        {formData.status !== "sem_previsao" && (
          <Card>
            <CardHeader>
              <CardTitle>Vagas e Remuneração</CardTitle>
              <CardDescription>Quantidade de vagas e faixa salarial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="vagas_imediatas">Vagas Imediatas</Label>
                  <Input
                    id="vagas_imediatas"
                    type="number"
                    min="0"
                    value={formData.vagas_imediatas || ""}
                    onChange={(e) => handleChange("vagas_imediatas", Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vagas_cr">Vagas CR</Label>
                  <Input
                    id="vagas_cr"
                    type="number"
                    min="0"
                    value={formData.vagas_cr || ""}
                    onChange={(e) => handleChange("vagas_cr", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Cadastro de Reserva</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salario_min">Salário Mínimo (R$)</Label>
                  <Input
                    id="salario_min"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.salario_min || ""}
                    onChange={(e) => handleChange("salario_min", Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salario_max">Salário Máximo (R$)</Label>
                  <Input
                    id="salario_max"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.salario_max || ""}
                    onChange={(e) => handleChange("salario_max", Number(e.target.value))}
                  />
                </div>
              </div>
              
              {(formData.status === "edital_aberto" || formData.status === "inscricoes_abertas") && (
                <div className="space-y-2">
                  <Label htmlFor="taxa_inscricao">Taxa de Inscrição (R$)</Label>
                  <Input
                    id="taxa_inscricao"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    className="max-w-[200px]"
                    value={formData.taxa_inscricao || ""}
                    onChange={(e) => handleChange("taxa_inscricao", Number(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cargos */}
        <Card>
          <CardHeader>
            <CardTitle>Cargos</CardTitle>
            <CardDescription>Lista de cargos disponíveis no concurso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de cargos adicionados */}
            {formData.cargos && formData.cargos.length > 0 && (
              <div className="space-y-2">
                {formData.cargos.map((cargo, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{cargo.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {cargo.vagas} vagas • R$ {cargo.salario.toLocaleString("pt-BR")}
                        {cargo.escolaridade && ` • ${ESCOLARIDADE_LABELS[cargo.escolaridade as Escolaridade] || cargo.escolaridade}`}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCargo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Form para adicionar cargo */}
            <div className="grid gap-4 md:grid-cols-5 p-4 border rounded-lg">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome do Cargo</Label>
                <Input
                  placeholder="Ex: Analista Tributário"
                  value={novoCargo.nome}
                  onChange={(e) => setNovoCargo(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Vagas</Label>
                <Input
                  type="number"
                  min="0"
                  value={novoCargo.vagas || ""}
                  onChange={(e) => setNovoCargo(prev => ({ ...prev, vagas: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Salário (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={novoCargo.salario || ""}
                  onChange={(e) => setNovoCargo(prev => ({ ...prev, salario: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAddCargo} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        {!["sem_previsao", "rumor"].includes(formData.status || "") && (
          <Card>
            <CardHeader>
              <CardTitle>Datas Importantes</CardTitle>
              <CardDescription>Cronograma do concurso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="data_publicacao">Publicação</Label>
                  <Input
                    id="data_publicacao"
                    type="date"
                    value={formData.data_publicacao || ""}
                    onChange={(e) => handleChange("data_publicacao", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_inscricao_inicio">Início Inscrições</Label>
                  <Input
                    id="data_inscricao_inicio"
                    type="date"
                    value={formData.data_inscricao_inicio || ""}
                    onChange={(e) => handleChange("data_inscricao_inicio", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_inscricao_fim">Fim Inscrições</Label>
                  <Input
                    id="data_inscricao_fim"
                    type="date"
                    value={formData.data_inscricao_fim || ""}
                    onChange={(e) => handleChange("data_inscricao_fim", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_prova">Data da Prova</Label>
                  <Input
                    id="data_prova"
                    type="date"
                    value={formData.data_prova || ""}
                    onChange={(e) => handleChange("data_prova", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_resultado">Resultado</Label>
                  <Input
                    id="data_resultado"
                    type="date"
                    value={formData.data_resultado || ""}
                    onChange={(e) => handleChange("data_resultado", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links e Documentos</CardTitle>
            <CardDescription>URLs do edital e site oficial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edital_url">URL do Edital</Label>
                <Input
                  id="edital_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.edital_url || ""}
                  onChange={(e) => handleChange("edital_url", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_oficial">Site Oficial</Label>
                <Input
                  id="site_oficial"
                  type="url"
                  placeholder="https://..."
                  value={formData.site_oficial || ""}
                  onChange={(e) => handleChange("site_oficial", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opções */}
        <Card>
          <CardHeader>
            <CardTitle>Opções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Destacar na Home</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir este concurso em destaque na página inicial
                </p>
              </div>
              <Switch
                checked={formData.destaque}
                onCheckedChange={(checked) => handleChange("destaque", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/concursos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Concurso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o concurso &quot;{concurso?.titulo}&quot;?
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
