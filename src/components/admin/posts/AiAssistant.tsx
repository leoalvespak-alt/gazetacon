"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Wand2, CheckCircle2, FileText, Type, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AiAssistantProps {
  currentContent: string
  currentTitle: string
  onUpdateContent: (content: string) => void
  onUpdateTitle: (title: string) => void
}

export function AiAssistant({ currentContent, currentTitle, onUpdateContent, onUpdateTitle }: AiAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [suggestionResult, setSuggestionResult] = useState("")
  const [titlesResult, setTitlesResult] = useState<string[]>([])
  const [revisionResult, setRevisionResult] = useState("")
  const [activeTab, setActiveTab] = useState("revision")

  const handleAiRequest = async (type: string) => {
    if (!currentContent && type !== 'title') {
      toast.error("O conteúdo está vazio para análise.")
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            type, 
            content: currentContent,
            title: currentTitle,
            prompt: "" // Optional prompt override
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (type === 'suggestions') {
        setSuggestionResult(data.result)
      } else if (type === 'title') {
        const titles = data.result.split('\n').filter((t: string) => t.trim().length > 0)
        setTitlesResult(titles)
      } else {
        setRevisionResult(data.result)
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro na IA: " + message)
    } finally {
      setLoading(false)
    }
  }

  const applyRevision = () => {
    onUpdateContent(revisionResult)
    toast.success("Revisão aplicada com sucesso!")
    setRevisionResult("")
  }

  const applyTitle = (title: string) => {
    onUpdateTitle(title.replace(/^\d+\.\s*/, '').replace(/"/g, ''))
    toast.success("Título atualizado!")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 w-full">
          <Sparkles className="w-4 h-4" />
          Assistente IA
          <span className="sr-only">Abrir Assistente IA</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
            Assistente de Escrita
          </SheetTitle>
          <SheetDescription>
            Utilize a inteligência artificial para melhorar seu conteúdo, corrigir erros e ter novas ideias.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="revision" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revision">Revisão</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="ideas">Ideias</TabsTrigger>
          </TabsList>

          <TabsContent value="revision" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleAiRequest('grammar')} disabled={loading} className="justify-start h-auto py-3">
                    <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" /> 
                    <div className="text-left">
                        <div className="font-semibold">Corrigir</div>
                        <div className="text-xs text-muted-foreground font-normal">Gramática e Ortografia</div>
                    </div>
                </Button>
                <Button variant="outline" onClick={() => handleAiRequest('improve')} disabled={loading} className="justify-start h-auto py-3">
                    <Wand2 className="mr-2 h-4 w-4 shrink-0" /> 
                    <div className="text-left">
                        <div className="font-semibold">Melhorar</div>
                        <div className="text-xs text-muted-foreground font-normal">Fluidez e estilo</div>
                    </div>
                </Button>
                <Button variant="outline" onClick={() => handleAiRequest('objective')} disabled={loading} className="justify-start h-auto py-3">
                    <FileText className="mr-2 h-4 w-4 shrink-0" /> 
                    <div className="text-left">
                        <div className="font-semibold">Objetivo</div>
                        <div className="text-xs text-muted-foreground font-normal">Mais direto</div>
                    </div>
                </Button>
                <Button variant="outline" onClick={() => handleAiRequest('longer')} disabled={loading} className="justify-start h-auto py-3">
                    <FileText className="mr-2 h-4 w-4 shrink-0" /> 
                    <div className="text-left">
                        <div className="font-semibold">Expandir</div>
                        <div className="text-xs text-muted-foreground font-normal">Mais detalhes</div>
                    </div>
                </Button>
            </div>
            
            {loading && activeTab === 'revision' && (
                <div className="flex flex-col items-center justify-center p-8 space-y-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Processando seu texto...</p>
                </div>
            )}

            {revisionResult && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/30 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Sugestão de Revisão:</h4>
                        <span className="text-xs text-muted-foreground">Verifique a formatação antes de aplicar</span>
                    </div>
                    <div className="prose dark:prose-invert text-sm max-h-[300px] overflow-y-auto border p-3 rounded bg-background shadow-inner" 
                         dangerouslySetInnerHTML={{ __html: revisionResult }} />
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={applyRevision} className="w-full">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Aplicar Alterações
                        </Button>
                        <Button variant="outline" onClick={() => setRevisionResult("")}>Descartar</Button>
                    </div>
                </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 py-4">
            <div className="p-4 border rounded-md bg-indigo-50 dark:bg-indigo-950/20 text-sm mb-4">
                <p>A IA irá analisar seu texto em busca de pontos de melhoria, SEO e clareza.</p>
            </div>
            <Button onClick={() => handleAiRequest('suggestions')} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                Analisar Conteúdo
            </Button>

            {suggestionResult && (
                <div className="prose dark:prose-invert text-sm bg-muted/30 p-4 rounded-md animate-in fade-in slide-in-from-bottom-2">
                     <div dangerouslySetInnerHTML={{ __html: suggestionResult }} />
                </div>
            )}
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4 py-4">
             <div className="space-y-2">
                 <h4 className="text-sm font-medium">Gerador de Títulos</h4>
                 <p className="text-xs text-muted-foreground">Gere ideias de títulos baseados no conteúdo do seu texto.</p>
                 <Button onClick={() => handleAiRequest('title')} disabled={loading} variant="secondary" className="w-full mt-2">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Type className="mr-2 h-4 w-4" />}
                    Gerar Títulos
                 </Button>
             </div>

             <div className="space-y-2 mt-4">
                 {titlesResult.map((title, i) => (
                     <div key={i} className="flex items-center gap-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer group transition-colors" onClick={() => applyTitle(title)}>
                         <span className="flex-1 text-sm font-medium">{title.replace(/^\d+\.\s*/, '').replace(/"/g, '')}</span>
                         <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-primary">
                             <CheckCircle2 className="h-4 w-4" />
                         </Button>
                     </div>
                 ))}
             </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
