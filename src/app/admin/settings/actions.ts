'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logoUrl: string | null
  faviconUrl: string | null
  
  // SEO
  defaultMetaTitle: string
  defaultMetaDescription: string
  googleAnalyticsId: string | null
  googleTagManagerId: string | null
  
  // Social
  facebookUrl: string | null
  instagramUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null
  telegramUrl: string | null
  whatsappNumber: string | null
  
  // Conteúdo
  postsPerPage: number
  enableComments: boolean
  enableNewsletter: boolean
  enableAds: boolean
  
  // Email
  contactEmail: string | null
  newsletterFromEmail: string | null
  
  // Aparência
  primaryColor: string
  accentColor: string
  darkMode: 'auto' | 'light' | 'dark'
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Gazeta dos Concursos',
  siteDescription: 'O portal de concursos públicos mais completo do Brasil',
  siteUrl: 'https://gazetadosconcursos.com.br',
  logoUrl: null,
  faviconUrl: null,
  
  defaultMetaTitle: 'Gazeta dos Concursos - Concursos Públicos',
  defaultMetaDescription: 'Acompanhe os principais concursos públicos do Brasil. Vagas, datas, provas e muito mais.',
  googleAnalyticsId: null,
  googleTagManagerId: null,
  
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  youtubeUrl: null,
  linkedinUrl: null,
  telegramUrl: null,
  whatsappNumber: null,
  
  postsPerPage: 12,
  enableComments: false,
  enableNewsletter: true,
  enableAds: false,
  
  contactEmail: null,
  newsletterFromEmail: null,
  
  primaryColor: '#2563eb',
  accentColor: '#f59e0b',
  darkMode: 'auto'
}

// Buscar configurações
export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase
    .from('admin_settings')
    .select('key, value')
  
  if (!data || data.length === 0) {
    return DEFAULT_SETTINGS
  }
  
  // Converter array de {key, value} para objeto
  const settingsMap: Record<string, string> = {}
  data.forEach((item: { key: string; value: string }) => {
    settingsMap[item.key] = item.value
  })
  
  return {
    siteName: settingsMap.siteName || DEFAULT_SETTINGS.siteName,
    siteDescription: settingsMap.siteDescription || DEFAULT_SETTINGS.siteDescription,
    siteUrl: settingsMap.siteUrl || DEFAULT_SETTINGS.siteUrl,
    logoUrl: settingsMap.logoUrl || null,
    faviconUrl: settingsMap.faviconUrl || null,
    
    defaultMetaTitle: settingsMap.defaultMetaTitle || DEFAULT_SETTINGS.defaultMetaTitle,
    defaultMetaDescription: settingsMap.defaultMetaDescription || DEFAULT_SETTINGS.defaultMetaDescription,
    googleAnalyticsId: settingsMap.googleAnalyticsId || null,
    googleTagManagerId: settingsMap.googleTagManagerId || null,
    
    facebookUrl: settingsMap.facebookUrl || null,
    instagramUrl: settingsMap.instagramUrl || null,
    twitterUrl: settingsMap.twitterUrl || null,
    youtubeUrl: settingsMap.youtubeUrl || null,
    linkedinUrl: settingsMap.linkedinUrl || null,
    telegramUrl: settingsMap.telegramUrl || null,
    whatsappNumber: settingsMap.whatsappNumber || null,
    
    postsPerPage: parseInt(settingsMap.postsPerPage) || DEFAULT_SETTINGS.postsPerPage,
    enableComments: settingsMap.enableComments === 'true',
    enableNewsletter: settingsMap.enableNewsletter !== 'false',
    enableAds: settingsMap.enableAds === 'true',
    
    contactEmail: settingsMap.contactEmail || null,
    newsletterFromEmail: settingsMap.newsletterFromEmail || null,
    
    primaryColor: settingsMap.primaryColor || DEFAULT_SETTINGS.primaryColor,
    accentColor: settingsMap.accentColor || DEFAULT_SETTINGS.accentColor,
    darkMode: (settingsMap.darkMode as SiteSettings['darkMode']) || 'auto'
  }
}

// Salvar configurações
export async function saveSettings(settings: Partial<SiteSettings>) {
  const supabase = await createServerSupabaseClient()
  
  // Converter objeto para array de {key, value}
  const entries = Object.entries(settings).map(([key, value]) => ({
    key,
    value: typeof value === 'boolean' ? value.toString() : (value?.toString() || '')
  }))
  
  // Upsert cada configuração
  for (const entry of entries) {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key: entry.key, value: entry.value }, { onConflict: 'key' })
    
    if (error) {
      return { error: error.message }
    }
  }
  
  revalidatePath('/admin/settings')
  revalidatePath('/')
  
  return { success: true }
}

// Salvar configuração individual
export async function saveSetting(key: string, value: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('admin_settings')
    .upsert({ key, value }, { onConflict: 'key' })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/settings')
  return { success: true }
}
