"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase' // Note: We might need a browser client specific file if middleware uses cookies
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MoreHorizontal, Loader2, Trash } from "lucide-react"
import { toast } from "sonner"

// Using any for simplicity in this iteration, ideally define types
interface Category {
  id: string
  name: string
  slug: string
  color: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6") // Default blue
  const [submitting, setSubmitting] = useState(false)

  // Local Supabase Client (assuming lib/supabase.ts is client-safe)
  // Local Supabase Client imported directly

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
    
    if (error) {
       console.error("Erro ao buscar categorias:", error)
       toast.error("Erro ao carregar categorias.")
    } else {
       setCategories(data || [])
    }
    setLoading(false)
  }

  const handleCreateCategory = async () => {
      if (!newCategoryName) return
      setSubmitting(true)

      const slug = newCategoryName.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")

      const { error } = await supabase.from('categories').insert({
          name: newCategoryName,
          slug: slug,
          color: newCategoryColor
      })

      if (error) {
          toast.error("Erro ao criar categoria: " + error.message)
      } else {
          toast.success("Categoria criada com sucesso!")
          setNewCategoryName("")
          setIsDialogOpen(false)
          fetchCategories()
      }
      setSubmitting(false)
  }

  const handleDeleteCategory = async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

      const { error } = await supabase.from('categories').delete().eq('id', id)
       if (error) {
          toast.error("Erro ao excluir categoria.")
      } else {
          toast.success("Categoria excluída.")
          fetchCategories()
      }
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
           <h1 className="text-2xl font-bold">Categorias</h1>
           
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4"/>
                    Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Adicionar Categoria</DialogTitle>
                    <DialogDescription>Crie uma nova categoria para organizar seus posts.</DialogDescription>
                 </DialogHeader>
                 
                 <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                       <Label htmlFor="name">Nome</Label>
                       <Input id="name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ex: Dicas de Estudo" />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="color">Cor da Etiqueta</Label>
                        <div className="flex gap-2 items-center">
                            <Input 
                                id="color" 
                                type="color" 
                                className="w-12 h-10 p-1 cursor-pointer"
                                value={newCategoryColor} 
                                onChange={(e) => setNewCategoryColor(e.target.value)} 
                            />
                            <span className="text-sm text-muted-foreground">{newCategoryColor}</span>
                        </div>
                    </div>
                 </div>
                 
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateCategory} disabled={submitting}>
                       {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Salvar
                    </Button>
                 </DialogFooter>
              </DialogContent>
           </Dialog>
       </div>
       
       <div className="rounded-md border bg-card">
          <Table>
             <TableHeader>
                <TableRow>
                   <TableHead>Cor</TableHead>
                   <TableHead>Nome</TableHead>
                   <TableHead>Slug</TableHead>
                   <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">
                            Carregando...
                        </TableCell>
                    </TableRow>
                ) : categories.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                            Nenhuma categoria encontrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    categories.map((cat) => (
                        <TableRow key={cat.id}>
                            <TableCell>
                                <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: cat.color }}></div>
                            </TableCell>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                                    <Trash className="h-4 w-4 text-destructive"/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
             </TableBody>
          </Table>
       </div>
    </div>
  )
}
