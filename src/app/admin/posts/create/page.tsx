"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser' // Use local client
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import Tiptap from '@/components/editor/TiptapEditor'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function CreatePostPage() {
   const router = useRouter()
   const [title, setTitle] = useState('')
   const [content, setContent] = useState('<p>Comece a escrever...</p>')
   const [slug, setSlug] = useState('')
   const [categoryId, setCategoryId] = useState('')
   const [imageUrl, setImageUrl] = useState('')
   const [published, setPublished] = useState(false)
   const [loading, setLoading] = useState(false)
   const [categories, setCategories] = useState<any[]>([])
   const [tags, setTags] = useState<string[]>([])
   const [tagInput, setTagInput] = useState('')
   const supabase = createClient()

   // Efeito para carregar categorias
   useEffect(() => {
     const fetchCats = async () => {
        const { data } = await supabase.from('categories').select('*')
        if (data) setCategories(data)
     }
     fetchCats()
   }, [])

   // Auto-gerar slug
   useEffect(() => {
      const generated = title.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      setSlug(generated)
   }, [title])

   const handleAddTag = (e: React.KeyboardEvent) => {
       if (e.key === 'Enter' && tagInput.trim()) {
           e.preventDefault()
           if (!tags.includes(tagInput.trim())) {
               setTags([...tags, tagInput.trim()])
           }
           setTagInput('')
       }
   }

   const handleRemoveTag = (tagToRemove: string) => {
       setTags(tags.filter(tag => tag !== tagToRemove))
   }

   const handleSave = async () => {
       if (!title || !categoryId) {
           toast.error("Preencha título e categoria.")
           return
       }

       setLoading(true)
       
       // Pegar ID do usuário (mock ou real se tiver auth)
       const { data: { user } } = await supabase.auth.getUser()
       
       const postData = {
           title,
           slug,
           content,
           category_id: categoryId,
           excerpt: content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
           cover_image_url: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80', // Default
           published,
           author_id: user?.id
       }

       const { error } = await supabase.from('posts').insert(postData)

       if (error) {
           toast.error("Erro ao salvar: " + error.message)
       } else {
           toast.success("Post salvo com sucesso!")
           router.push('/admin/posts')
       }
       setLoading(false)
   }

   return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4"/>
                    </Button>
                    <h1 className="text-2xl font-bold">Novo Post</h1>
                </div>
                <div className="flex gap-2 lg:hidden">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Salvar
                    </Button>
                </div>
            </div>
            
            <div className="space-y-2">
               <Label htmlFor="title" className="text-lg">Título do Artigo</Label>
               <Input 
                 id="title" 
                 placeholder="Ex: Como passar no concurso..." 
                 className="text-lg py-6" 
                 value={title}
                 onChange={e => setTitle(e.target.value)}
               />
            </div>
            
            <Card className="min-h-[500px]">
               <CardContent className="p-0 h-full">
                  <Tiptap content={content} onChange={setContent} />
               </CardContent>
            </Card>
         </div>
         
         <div className="space-y-6">
             <div className="hidden lg:flex flex-col gap-2">
                 <Button className="w-full" size="lg" onClick={handleSave} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                      {published ? 'Publicar Agora' : 'Salvar Rascunho'}
                 </Button>
             </div>
             
             <Card>
                <CardContent className="p-4 space-y-6">
                   <div className="flex items-center justify-between">
                       <Label htmlFor="published" className="flex flex-col gap-1">
                          <span>Publicado?</span>
                          <span className="font-normal text-xs text-muted-foreground">{published ? 'Visível no site' : 'Apenas admin'}</span>
                       </Label>
                       <Switch id="published" checked={published} onCheckedChange={setPublished} />
                   </div>

                    <div className="space-y-4">
                       <ImageUpload 
                         value={imageUrl} 
                         onChange={setImageUrl} 
                       />
                    </div>
                   
                   <div className="space-y-2">
                      <Label>Categoria</Label>
                       <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                       </select>
                   </div>
                   
                   <div className="space-y-2">
                       <Label>Slug</Label>
                       <Input value={slug} readOnly className="bg-muted text-muted-foreground" />
                   </div>

                   <div className="space-y-2">
                       <Label>Tags (Enter para adicionar)</Label>
                       <Input 
                         placeholder="Ex: estudo, edital..." 
                         value={tagInput}
                         onChange={e => setTagInput(e.target.value)}
                         onKeyDown={handleAddTag}
                       />
                       <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="gap-1 px-2">
                                 {tag}
                                 <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">×</button>
                              </Badge>
                          ))}
                       </div>
                   </div>

                </CardContent>
             </Card>
         </div>
      </div>
   )
}
