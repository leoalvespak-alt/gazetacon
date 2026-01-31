"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { AREA_LABELS } from '@/types/concurso'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { RichEditor } from '@/components/admin/posts/RichEditor'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SeoSnippetPreview } from '@/components/admin/posts/SeoSnippetPreview'
import { AiAssistant } from '@/components/admin/posts/AiAssistant'
import { ConcursoInfoPanel } from '@/components/admin/posts/ConcursoInfoPanel'

interface Category {
  id: string;
  name: string;
}

interface Concurso {
  id: string;
  titulo: string;
}

export default function CreatePostPage() {
   const router = useRouter()
   const [title, setTitle] = useState('')
   const [content, setContent] = useState('<p>Comece a escrever...</p>')
   const [slug, setSlug] = useState('')
   const [seoDescription, setSeoDescription] = useState('')
   const [categoryId, setCategoryId] = useState('')
   const [concursoId, setConcursoId] = useState('')
   const [imageUrl, setImageUrl] = useState('')
   const [authorName, setAuthorName] = useState('')
   const [readingTime, setReadingTime] = useState<number>(5)
   const [published, setPublished] = useState(false)
   const [loading, setLoading] = useState(false)
   const [categories, setCategories] = useState<Category[]>([])
   const [concursos, setConcursos] = useState<Concurso[]>([])
   const [tags, setTags] = useState<string[]>([])
   const [tagInput, setTagInput] = useState('')
   const [area, setArea] = useState('')
   const supabase = createClient()

   useEffect(() => {
     const fetchData = async () => {
        const { data: catData } = await supabase.from('categories').select('id, name')
        if (catData) setCategories(catData as Category[])

        const { data: concData } = await supabase.from('concursos').select('id, titulo').order('titulo')
        if (concData) setConcursos(concData as Concurso[])
     }
     fetchData()
   }, [supabase])

   useEffect(() => {
      const generated = title.toLowerCase()
        .replace(/ /g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w-]/g, "")
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
       
       try {
           const { data: { user }, error: userError } = await supabase.auth.getUser()
           
           if (userError || !user) {
               toast.error("Você precisa estar logado para salvar.")
               setLoading(false)
               return
           }
           
           const postData = {
               title,
               slug,
               content,
               category_id: categoryId,
               concurso_id: concursoId || null,
               excerpt: content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
               cover_image_url: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80',
               published,
               seo_title: title,
               seo_description: seoDescription,
               author_id: user.id,
               author_name: authorName,
               reading_time: readingTime,
               area: area || null,
           }

           const { error: insertError } = await supabase.from('posts').insert(postData)

           if (insertError) {
               toast.error("Erro ao salvar: " + insertError.message)
           } else {
               toast.success("Post salvo com sucesso!")
               router.push('/admin/posts')
           }
       } catch (err: unknown) {
           const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
           toast.error("Erro inesperado: " + errorMessage)
       } finally {
           setLoading(false)
       }
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
            
            <Tabs defaultValue="visual" className="w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Conteúdo do Artigo</p>
                <TabsList>
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                  <TabsTrigger value="html">Código HTML</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="visual" className="mt-0">
                <RichEditor 
                   content={content} 
                   onChange={setContent}
                   placeholder="Escreva seu artigo com o novo editor rico..."
                />
              </TabsContent>

              <TabsContent value="html" className="mt-0">
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="<div>Escreva seu HTML aqui...</div>"
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Otimização para Mecanismos de Busca (SEO)</h3>
                
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Meta Descrição</Label>
                            <Input 
                                value={seoDescription} 
                                onChange={e => setSeoDescription(e.target.value)} 
                                placeholder="Resumo atrativo para aparecer no Google (max 160 caracteres)"
                                maxLength={160}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {seoDescription.length}/160
                            </p>
                        </div>

                        <SeoSnippetPreview 
                            title={title} 
                            slug={slug} 
                            description={seoDescription} 
                        />
                    </CardContent>
                </Card>
            </div>
         </div>
         
         <div className="space-y-6">
             <div className="hidden lg:flex flex-col gap-2">
                 <Button className="w-full" size="lg" onClick={handleSave} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                      {published ? 'Publicar Agora' : 'Salvar Rascunho'}
                 </Button>
                 <AiAssistant 
                    currentContent={content} 
                    currentTitle={title} 
                    onUpdateContent={setContent} 
                    onUpdateTitle={setTitle}
                  />
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
                      <Label>Carreira / Área (Opcional)</Label>
                       <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                        >
                          <option value="">Nenhuma</option>
                          {Object.entries(AREA_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                          ))}
                       </select>
                   </div>

                   <div className="space-y-2">
                      <Label>Concurso Relacionado (Opcional)</Label>
                       <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            value={concursoId}
                            onChange={(e) => setConcursoId(e.target.value)}
                        >
                          <option value="">Nenhum</option>
                          {concursos.map(conc => (
                              <option key={conc.id} value={conc.id}>{conc.titulo}</option>
                          ))}
                       </select>
                   </div>

                   {/* Painel de informações do concurso */}
                   <ConcursoInfoPanel 
                     concursoId={concursoId || null}
                     onInsertContent={(text) => {
                       // Insere texto no conteúdo atual
                       setContent(prev => prev.replace('</p>', ` ${text}</p>`))
                     }}
                     onInsertLink={(text, url) => {
                       // Insere link no conteúdo atual
                       const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
                       setContent(prev => prev.replace('</p>', ` ${linkHtml}</p>`))
                     }}
                   />
                   
                   <div className="space-y-2">
                       <Label>Slug</Label>
                       <Input value={slug} readOnly className="bg-muted text-muted-foreground" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                           <Label>Autor (Exibição)</Label>
                           <Input 
                               value={authorName} 
                               onChange={e => setAuthorName(e.target.value)} 
                               placeholder="Nome do autor"
                           />
                       </div>
                       <div className="space-y-2">
                           <Label>Tempo (min)</Label>
                           <Input 
                               type="number"
                               value={readingTime} 
                               onChange={e => setReadingTime(parseInt(e.target.value) || 0)} 
                           />
                       </div>
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
