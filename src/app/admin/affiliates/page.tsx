"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, ExternalLink, Copy, Trash2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AffiliateLink {
  id: string
  name: string
  slug: string
  destination_url: string
  clicks: number
  active: boolean
  created_at: string
}

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [url, setUrl] = useState("")
  const [active, setActive] = useState(true)

  const supabase = createClient()

  const fetchLinks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("affiliate_links")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (data) setLinks(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleSubmit = async () => {
    if (!name || !slug || !url) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    const payload = {
      name,
      slug,
      destination_url: url,
      active
    }

    if (editingLink) {
      const { error } = await supabase
        .from("affiliate_links")
        .update(payload)
        .eq("id", editingLink.id)
      
      if (error) toast.error("Erro ao atualizar")
      else {
        toast.success("Link atualizado!")
        setIsOpen(false)
        fetchLinks()
      }
    } else {
      const { error } = await supabase
        .from("affiliate_links")
        .insert(payload)
      
      if (error) {
        if (error.code === '23505') toast.error("Slug já existe")
        else toast.error("Erro ao criar")
      } else {
        toast.success("Link criado!")
        setIsOpen(false)
        fetchLinks()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este link?")) return
    
    const { error } = await supabase.from("affiliate_links").delete().eq("id", id)
    if (error) toast.error("Erro ao apagar")
    else {
      toast.success("Link removido")
      fetchLinks()
    }
  }

  const openNew = () => {
    setEditingLink(null)
    setName("")
    setSlug("")
    setUrl("")
    setActive(true)
    setIsOpen(true)
  }

  const openEdit = (link: AffiliateLink) => {
    setEditingLink(link)
    setName(link.name)
    setSlug(link.slug)
    setUrl(link.destination_url)
    setActive(link.active)
    setIsOpen(true)
  }

  const copyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/go/${slug}`
    navigator.clipboard.writeText(fullUrl)
    toast.success("Link copiado!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Afiliados & Deirecionamentos</h1>
          <p className="text-muted-foreground">Gerencie seus links de afiliados e parcerias.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Link
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug / URL</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center h-24">Carregando...</TableCell>
               </TableRow>
            ) : links.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhum link cadastrado.</TableCell>
               </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted px-1 rounded">/go/{link.slug}</span>
                        <button onClick={() => copyLink(link.slug)} title="Copiar">
                          <Copy className="h-3 w-3 hover:text-foreground" />
                        </button>
                      </div>
                      <a href={link.destination_url} target="_blank" className="text-xs truncate max-w-[200px] hover:underline flex items-center gap-1">
                        {link.destination_url}
                        <ExternalLink className="h-2 w-2" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{link.clicks}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.active ? "default" : "outline"}>
                      {link.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(link)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(link.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para Criar/Editar */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? "Editar Link" : "Novo Link de Afiliado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Interno</Label>
              <Input 
                placeholder="Ex: Campanha Estratégia" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL curta)</Label>
              <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground whitespace-nowrap">/go/</span>
                 <Input 
                   placeholder="ex-estrategia" 
                   value={slug} 
                   onChange={e => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))} 
                 />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL de Destino</Label>
              <Input 
                placeholder="https://..." 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active-mode">Link Ativo?</Label>
              <Switch id="active-mode" checked={active} onCheckedChange={setActive} />
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              {editingLink ? "Salvar Alterações" : "Criar Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
