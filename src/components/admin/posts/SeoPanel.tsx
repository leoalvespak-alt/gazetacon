"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface SeoData {
  metaTitle: string
  metaDescription: string
  slug: string
  canonicalUrl?: string
}

interface SeoPanelProps {
  data: SeoData
  onChange: (data: SeoData) => void
  baseUrl?: string
}

export function SeoPanel({ data, onChange, baseUrl = "https://gazetadosconcursos.com.br" }: SeoPanelProps) {
  const [titleLength, setTitleLength] = useState(0)
  const [descLength, setDescLength] = useState(0)

  useEffect(() => {
    setTitleLength(data.metaTitle?.length || 0)
    setDescLength(data.metaDescription?.length || 0)
  }, [data.metaTitle, data.metaDescription])

  const getTitleStatus = () => {
    if (titleLength === 0) return "empty"
    if (titleLength < 30) return "short"
    if (titleLength > 60) return "long"
    return "ok"
  }

  const getDescStatus = () => {
    if (descLength === 0) return "empty"
    if (descLength < 70) return "short"
    if (descLength > 160) return "long"
    return "ok"
  }

  const slugPreview = data.slug 
    ? `${baseUrl}/blog/${data.slug.toLowerCase().replace(/\s+/g, '-')}` 
    : `${baseUrl}/blog/...`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">SEO & Meta Tags</CardTitle>
        <CardDescription>Otimize para mecanismos de busca</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meta Title */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="meta-title">Meta Título</Label>
            <Badge 
              variant={getTitleStatus() === "ok" ? "default" : "secondary"}
              className={
                getTitleStatus() === "ok" ? "bg-green-500" :
                getTitleStatus() === "long" ? "bg-amber-500" :
                "bg-muted"
              }
            >
              {titleLength}/60
            </Badge>
          </div>
          <Input
            id="meta-title"
            placeholder="Título para os mecanismos de busca"
            value={data.metaTitle}
            onChange={(e) => onChange({ ...data, metaTitle: e.target.value })}
            maxLength={70}
          />
          {getTitleStatus() === "short" && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Título muito curto. Recomendado: 30-60 caracteres
            </p>
          )}
          {getTitleStatus() === "long" && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Título pode ser cortado nos resultados
            </p>
          )}
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="meta-desc">Meta Descrição</Label>
            <Badge 
              variant={getDescStatus() === "ok" ? "default" : "secondary"}
              className={
                getDescStatus() === "ok" ? "bg-green-500" :
                getDescStatus() === "long" ? "bg-amber-500" :
                "bg-muted"
              }
            >
              {descLength}/160
            </Badge>
          </div>
          <Textarea
            id="meta-desc"
            placeholder="Descrição resumida que aparecerá nos resultados de busca"
            value={data.metaDescription}
            onChange={(e) => onChange({ ...data, metaDescription: e.target.value })}
            maxLength={170}
            rows={3}
          />
          {getDescStatus() === "short" && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Descrição muito curta. Recomendado: 70-160 caracteres
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">URL Amigável (Slug)</Label>
          <Input
            id="slug"
            placeholder="url-do-post"
            value={data.slug}
            onChange={(e) => onChange({ 
              ...data, 
              slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
            })}
          />
          <p className="text-xs text-muted-foreground font-mono truncate">
            Preview: {slugPreview}
          </p>
        </div>

        {/* Canonical URL */}
        <div className="space-y-2">
          <Label htmlFor="canonical">URL Canônica (opcional)</Label>
          <Input
            id="canonical"
            type="url"
            placeholder="https://..."
            value={data.canonicalUrl || ""}
            onChange={(e) => onChange({ ...data, canonicalUrl: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Use para conteúdo republicado de outra fonte
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
