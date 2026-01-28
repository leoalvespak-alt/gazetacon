"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { 
  Settings, 
  Globe, 
  Share2, 
  Palette,
  BarChart3,
  Save,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { getSettings, saveSettings, SiteSettings } from "./actions"
import { toast } from "sonner"

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      const data = await getSettings()
      setSettings(data)
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    
    setSaving(true)
    const result = await saveSettings(settings)
    
    if (result.error) {
      toast.error("Erro ao salvar", { description: result.error })
    } else {
      toast.success("Configurações salvas com sucesso!")
    }
    
    setSaving(false)
  }

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do site
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
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

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="mr-2 h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="mr-2 h-4 w-4" />
            Redes Sociais
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <BarChart3 className="mr-2 h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Site</CardTitle>
                <CardDescription>Dados básicos do seu site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">URL do Site</Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descrição do Site</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
                <CardDescription>Configurações de exibição de conteúdo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="postsPerPage">Posts por página</Label>
                  <Input
                    id="postsPerPage"
                    type="number"
                    min={1}
                    max={50}
                    value={settings.postsPerPage}
                    onChange={(e) => updateSetting('postsPerPage', parseInt(e.target.value) || 12)}
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar comentários</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir comentários nos posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableComments}
                    onCheckedChange={(checked) => updateSetting('enableComments', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir formulário de inscrição
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNewsletter}
                    onCheckedChange={(checked) => updateSetting('enableNewsletter', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar anúncios</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir espaços publicitários
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAds}
                    onCheckedChange={(checked) => updateSetting('enableAds', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email</CardTitle>
                <CardDescription>Configurações de email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contato</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contato@exemplo.com"
                      value={settings.contactEmail || ''}
                      onChange={(e) => updateSetting('contactEmail', e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newsletterFromEmail">Email da Newsletter</Label>
                    <Input
                      id="newsletterFromEmail"
                      type="email"
                      placeholder="newsletter@exemplo.com"
                      value={settings.newsletterFromEmail || ''}
                      onChange={(e) => updateSetting('newsletterFromEmail', e.target.value || null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Padrão</CardTitle>
              <CardDescription>Configurações padrão de SEO para páginas sem meta tags específicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMetaTitle">Meta Title Padrão</Label>
                <Input
                  id="defaultMetaTitle"
                  value={settings.defaultMetaTitle}
                  onChange={(e) => updateSetting('defaultMetaTitle', e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{settings.defaultMetaTitle.length}/60 caracteres</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultMetaDescription">Meta Description Padrão</Label>
                <Textarea
                  id="defaultMetaDescription"
                  value={settings.defaultMetaDescription}
                  onChange={(e) => updateSetting('defaultMetaDescription', e.target.value)}
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{settings.defaultMetaDescription.length}/160 caracteres</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redes Sociais */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>Links para perfis nas redes sociais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={settings.facebookUrl || ''}
                    onChange={(e) => updateSetting('facebookUrl', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={settings.instagramUrl || ''}
                    onChange={(e) => updateSetting('instagramUrl', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter/X</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={settings.twitterUrl || ''}
                    onChange={(e) => updateSetting('twitterUrl', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={settings.youtubeUrl || ''}
                    onChange={(e) => updateSetting('youtubeUrl', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/..."
                    value={settings.linkedinUrl || ''}
                    onChange={(e) => updateSetting('linkedinUrl', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegramUrl">Telegram</Label>
                  <Input
                    id="telegramUrl"
                    type="url"
                    placeholder="https://t.me/..."
                    value={settings.telegramUrl || ''}
                    onChange={(e) => updateSetting('telegramUrl', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value || null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Cores e Tema</CardTitle>
              <CardDescription>Personalize a aparência do site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Modo Escuro</Label>
                <Select 
                  value={settings.darkMode} 
                  onValueChange={(v: 'auto' | 'light' | 'dark') => updateSetting('darkMode', v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático (sistema)</SelectItem>
                    <SelectItem value="light">Sempre claro</SelectItem>
                    <SelectItem value="dark">Sempre escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics & Tag Manager</CardTitle>
              <CardDescription>Configurações de rastreamento e análise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => updateSetting('googleAnalyticsId', e.target.value || null)}
                />
                <p className="text-xs text-muted-foreground">
                  O ID do seu Google Analytics 4. Exemplo: G-ABC123DEF4
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManagerId"
                  placeholder="GTM-XXXXXXX"
                  value={settings.googleTagManagerId || ''}
                  onChange={(e) => updateSetting('googleTagManagerId', e.target.value || null)}
                />
                <p className="text-xs text-muted-foreground">
                  O ID do seu container GTM. Exemplo: GTM-ABC123D
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
