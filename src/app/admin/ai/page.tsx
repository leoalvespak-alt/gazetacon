"use client"

import { useState } from "react"
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check,
  RefreshCw,
  Wand2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { 
  generateTitleSuggestions, 
  generateMetaDescription, 
  generateKeywords,
  analyzeSEO 
} from "./actions"
import { toast } from "sonner"

export default function AIToolsPage() {
  const [titleTopic, setTitleTopic] = useState("")
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [loadingTitles, setLoadingTitles] = useState(false)
  
  const [seoTitle, setSeoTitle] = useState("")
  const [seoContent, setSeoContent] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [seoScore, setSeoScore] = useState<number | null>(null)
  const [seoChecks, setSeoChecks] = useState<Array<{
    id: string
    label: string
    passed: boolean
    importance: 'high' | 'medium' | 'low'
    suggestion?: string
  }>>([])
  const [loadingSeo, setLoadingSeo] = useState(false)
  
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerateTitles = async () => {
    if (!titleTopic.trim()) {
      toast.error("Digite um tópico para gerar títulos")
      return
    }
    
    setLoadingTitles(true)
    const result = await generateTitleSuggestions(titleTopic)
    
    if (result.success && result.suggestions) {
      setTitleSuggestions(result.suggestions)
    } else {
      toast.error("Erro ao gerar títulos")
    }
    
    setLoadingTitles(false)
  }

  const handleGenerateMeta = async () => {
    if (!seoTitle.trim()) {
      toast.error("Digite um título para gerar a meta description")
      return
    }
    
    setLoadingSeo(true)
    const result = await generateMetaDescription(seoTitle, seoContent)
    
    if (result.success && result.content) {
      setMetaDescription(result.content)
      toast.success("Meta description gerada!")
    }
    
    setLoadingSeo(false)
  }

  const handleGenerateKeywords = async () => {
    if (!seoTitle.trim()) {
      toast.error("Digite um título para gerar keywords")
      return
    }
    
    setLoadingSeo(true)
    const result = await generateKeywords(seoTitle, seoContent)
    
    if (result.success && result.suggestions) {
      setKeywords(result.suggestions)
      toast.success("Keywords geradas!")
    }
    
    setLoadingSeo(false)
  }

  const handleAnalyzeSeo = async () => {
    if (!seoTitle.trim() || !seoContent.trim()) {
      toast.error("Preencha o título e conteúdo para analisar")
      return
    }
    
    setLoadingSeo(true)
    const result = await analyzeSEO({
      title: seoTitle,
      metaDescription,
      content: seoContent
    })
    
    setSeoScore(result.score)
    setSeoChecks(result.checks)
    setLoadingSeo(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("Copiado!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-amber-500" />
          Assistente de IA
        </h1>
        <p className="text-muted-foreground">
          Ferramentas de inteligência artificial para otimizar seu conteúdo
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gerador de Títulos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Gerador de Títulos
            </CardTitle>
            <CardDescription>
              Gere sugestões de títulos otimizados para SEO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico ou assunto</Label>
              <div className="flex gap-2">
                <Input
                  id="topic"
                  placeholder="Ex: Concurso INSS 2024"
                  value={titleTopic}
                  onChange={(e) => setTitleTopic(e.target.value)}
                />
                <Button onClick={handleGenerateTitles} disabled={loadingTitles}>
                  {loadingTitles ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {titleSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Sugestões</Label>
                <div className="space-y-2">
                  {titleSuggestions.map((title, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">{title}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(title, `title-${i}`)}
                      >
                        {copiedId === `title-${i}` ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analisador SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Otimizador SEO
            </CardTitle>
            <CardDescription>
              Analise e otimize o SEO do seu conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title">Título do post</Label>
              <Input
                id="seo-title"
                placeholder="Digite o título..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo-meta">Meta Description</Label>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={handleGenerateMeta}>
                  Gerar automaticamente
                </Button>
              </div>
              <Textarea
                id="seo-meta"
                placeholder="Digite ou gere a meta description..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">{metaDescription.length}/160</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seo-content">Conteúdo (resumo ou início)</Label>
              <Textarea
                id="seo-content"
                placeholder="Cole parte do conteúdo para análise..."
                value={seoContent}
                onChange={(e) => setSeoContent(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAnalyzeSeo} disabled={loadingSeo} className="flex-1">
                {loadingSeo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analisar SEO
              </Button>
              <Button variant="outline" onClick={handleGenerateKeywords} disabled={loadingSeo}>
                Gerar Tags
              </Button>
            </div>
            
            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="space-y-2">
                <Label>Keywords sugeridas</Label>
                <div className="flex flex-wrap gap-1">
                  {keywords.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => copyToClipboard(keyword, `kw-${i}`)}
                    >
                      {keyword}
                      {copiedId === `kw-${i}` && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* SEO Score */}
            {seoScore !== null && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label>Pontuação SEO</Label>
                  <span className={`text-2xl font-bold ${
                    seoScore >= 80 ? 'text-green-600' :
                    seoScore >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {seoScore}/100
                  </span>
                </div>
                
                <div className="space-y-2">
                  {seoChecks.map((check) => (
                    <div 
                      key={check.id}
                      className={`flex items-start gap-2 text-sm p-2 rounded ${
                        check.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {check.passed ? (
                        <Check className="h-4 w-4 mt-0.5 shrink-0" />
                      ) : (
                        <span className="h-4 w-4 mt-0.5 shrink-0">✗</span>
                      )}
                      <div>
                        <p className="font-medium">{check.label}</p>
                        {check.suggestion && (
                          <p className="text-xs opacity-80">{check.suggestion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
