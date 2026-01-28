"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface SeoCheckResult {
  id: string
  label: string
  status: "pass" | "fail" | "warning"
  message?: string
}

interface SeoScoreProps {
  title: string
  metaTitle: string
  metaDescription: string
  content: string
  coverImage: string | null
  keyword?: string
}

export function SeoScore({ 
  title, 
  metaTitle, 
  metaDescription, 
  content, 
  coverImage,
  keyword 
}: SeoScoreProps) {
  
  // Extrair texto do HTML/Markdown
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_\[\]]/g, '') // Remove markdown
    .trim()
  
  const wordCount = plainText.split(/\s+/).filter(Boolean).length
  
  // Verificações de SEO
  const checks: SeoCheckResult[] = []
  
  // 1. Meta title definido e tamanho ideal
  if (!metaTitle) {
    checks.push({ id: "meta-title", label: "Meta título definido", status: "fail" })
  } else if (metaTitle.length < 30 || metaTitle.length > 60) {
    checks.push({ 
      id: "meta-title", 
      label: "Meta título definido", 
      status: "warning",
      message: `Tamanho: ${metaTitle.length}. Ideal: 30-60 caracteres`
    })
  } else {
    checks.push({ id: "meta-title", label: "Meta título definido", status: "pass" })
  }
  
  // 2. Meta description
  if (!metaDescription) {
    checks.push({ id: "meta-desc", label: "Meta descrição definida", status: "fail" })
  } else if (metaDescription.length < 70 || metaDescription.length > 160) {
    checks.push({ 
      id: "meta-desc", 
      label: "Meta descrição definida", 
      status: "warning",
      message: `Tamanho: ${metaDescription.length}. Ideal: 70-160 caracteres`
    })
  } else {
    checks.push({ id: "meta-desc", label: "Meta descrição definida", status: "pass" })
  }
  
  // 3. Imagem de capa
  if (coverImage) {
    checks.push({ id: "cover", label: "Imagem de capa definida", status: "pass" })
  } else {
    checks.push({ id: "cover", label: "Imagem de capa definida", status: "fail" })
  }
  
  // 4. Contagem de palavras (mínimo 300)
  if (wordCount >= 300) {
    checks.push({ 
      id: "words", 
      label: "Conteúdo com 300+ palavras", 
      status: "pass",
      message: `${wordCount} palavras`
    })
  } else {
    checks.push({ 
      id: "words", 
      label: "Conteúdo com 300+ palavras", 
      status: "warning",
      message: `Apenas ${wordCount} palavras`
    })
  }
  
  // 5. Possui headings (H2, H3)
  const hasHeadings = /<h[2-3]>/i.test(content) || /^##[^#]/m.test(content)
  checks.push({ 
    id: "headings", 
    label: "Possui subtítulos (H2/H3)", 
    status: hasHeadings ? "pass" : "warning" 
  })
  
  // 6. Possui links internos
  const hasInternalLinks = content.includes('href="/') || content.includes('href="https://gazetadosconcursos')
  checks.push({ 
    id: "internal-links", 
    label: "Possui links internos", 
    status: hasInternalLinks ? "pass" : "warning" 
  })
  
  // 7. Palavra-chave no título (se definida)
  if (keyword) {
    const keywordInTitle = title.toLowerCase().includes(keyword.toLowerCase())
    checks.push({ 
      id: "keyword-title", 
      label: `Palavra-chave "${keyword}" no título`, 
      status: keywordInTitle ? "pass" : "warning" 
    })
  }
  
  // Calcular pontuação
  const passCount = checks.filter(c => c.status === "pass").length
  const totalChecks = checks.length
  const score = Math.round((passCount / totalChecks) * 100)
  
  const getScoreColor = () => {
    if (score >= 80) return "bg-green-500"
    if (score >= 50) return "bg-amber-500"
    return "bg-red-500"
  }
  
  const getStatusIcon = (status: SeoCheckResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Score SEO</CardTitle>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreColor()}`}>
            {score}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={score} className="h-2" />
        
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.id} className="flex items-start gap-2 text-sm">
              {getStatusIcon(check.status)}
              <div>
                <span className={check.status === "pass" ? "text-foreground" : "text-muted-foreground"}>
                  {check.label}
                </span>
                {check.message && (
                  <p className="text-xs text-muted-foreground">{check.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
