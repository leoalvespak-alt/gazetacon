'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'

// Tipos para as automações de IA
export interface AIGenerationResult {
  success: boolean
  content?: string
  suggestions?: string[]
  error?: string
}

// Função auxiliar para chamar a API do Gemini
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada')
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    }
  )
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }
  
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  
  if (!text) {
    throw new Error('Resposta vazia do Gemini')
  }
  
  return text
}

// Gerar sugestões de título
export async function generateTitleSuggestions(topic: string, count: number = 5): Promise<AIGenerationResult> {
  try {
    const prompt = `Você é um especialista em SEO para blogs de concursos públicos no Brasil.
Gere ${count} sugestões de títulos otimizados para SEO sobre o tema: "${topic}"

Regras:
- Os títulos devem ter entre 40 e 60 caracteres
- Devem ser atrativos e chamar a atenção
- Devem incluir a palavra-chave principal
- Voltados para candidatos de concursos públicos
- Use números quando apropriado (ex: "5 dicas", "Guia completo")

Retorne APENAS os títulos, um por linha, sem numeração ou marcadores.`

    const result = await callGemini(prompt)
    const suggestions = result
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, count)
    
    return { success: true, suggestions }
  } catch (error) {
    console.error('Erro ao gerar títulos:', error)
    
    // Fallback com templates se a API falhar
    const templates = [
      `${topic}: Tudo o que você precisa saber`,
      `Guia Completo: ${topic} para Concurseiros`,
      `${topic} - Dicas essenciais para sua aprovação`,
      `Como dominar ${topic} em concursos públicos`,
      `${topic}: O que as bancas mais cobram`
    ]
    
    return { success: true, suggestions: templates.slice(0, count) }
  }
}

// Gerar meta description
export async function generateMetaDescription(title: string, content?: string): Promise<AIGenerationResult> {
  try {
    const prompt = `Você é um especialista em SEO para blogs de concursos públicos.
Gere uma meta description otimizada para o seguinte título de post: "${title}"
${content ? `\nContexto do conteúdo: ${content.slice(0, 500)}` : ''}

Regras:
- A meta description deve ter entre 120 e 155 caracteres
- Deve incluir a palavra-chave principal
- Deve ser persuasiva e incentivar o clique
- Voltada para candidatos de concursos públicos

Retorne APENAS a meta description, sem aspas ou explicações.`

    const result = await callGemini(prompt)
    const description = result.trim().slice(0, 160)
    
    return { success: true, content: description }
  } catch (error) {
    console.error('Erro ao gerar meta description:', error)
    
    // Fallback
    const fallback = `Confira nosso conteúdo completo sobre ${title}. Informações atualizadas para sua aprovação em concursos públicos.`
    return { success: true, content: fallback.slice(0, 160) }
  }
}

// Gerar tags/keywords
export async function generateKeywords(title: string, content?: string): Promise<AIGenerationResult> {
  try {
    const prompt = `Você é um especialista em SEO para blogs de concursos públicos.
Gere 8 a 10 tags/keywords relevantes para o seguinte conteúdo:
Título: "${title}"
${content ? `Conteúdo: ${content.slice(0, 500)}` : ''}

Regras:
- Tags devem ser relevantes para concursos públicos
- Inclua variações da palavra-chave principal
- Inclua termos relacionados que candidatos pesquisariam
- Máximo de 3 palavras por tag

Retorne APENAS as tags, separadas por vírgula, sem numeração.`

    const result = await callGemini(prompt)
    const keywords = result
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 10)
    
    return { success: true, suggestions: keywords }
  } catch (error) {
    console.error('Erro ao gerar keywords:', error)
    
    // Fallback - extrai palavras do título
    const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'para', 'com', 'que', 'e', 'é']
    const words = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
    
    return { success: true, suggestions: [...new Set([...words, 'concursos', 'edital', 'vagas'])].slice(0, 10) }
  }
}

// Gerar introdução/resumo automático
export async function generateIntroduction(title: string, mainPoints?: string): Promise<AIGenerationResult> {
  try {
    const prompt = `Você é um redator especializado em conteúdo para blogs de concursos públicos.
Escreva uma introdução envolvente para um post com o título: "${title}"
${mainPoints ? `\nPontos principais a abordar: ${mainPoints}` : ''}

Regras:
- A introdução deve ter 2-3 parágrafos
- Deve capturar a atenção do leitor imediatamente
- Deve explicar o que o leitor vai aprender
- Linguagem clara e acessível
- Tom informativo mas engajante

Retorne apenas a introdução, sem título ou marcações.`

    const result = await callGemini(prompt)
    return { success: true, content: result.trim() }
  } catch (error) {
    console.error('Erro ao gerar introdução:', error)
    return { success: false, error: 'Não foi possível gerar a introdução' }
  }
}

// Analisar SEO do conteúdo
export async function analyzeSEO(data: {
  title: string
  metaDescription?: string
  content: string
  focusKeyword?: string
}): Promise<{
  score: number
  checks: Array<{
    id: string
    label: string
    passed: boolean
    importance: 'high' | 'medium' | 'low'
    suggestion?: string
  }>
}> {
  const checks = []
  let score = 0
  
  // Verificar título
  if (data.title.length >= 30 && data.title.length <= 60) {
    checks.push({ id: 'title-length', label: 'Título tem tamanho ideal (30-60 caracteres)', passed: true, importance: 'high' as const })
    score += 15
  } else {
    checks.push({ 
      id: 'title-length', 
      label: 'Título fora do tamanho ideal', 
      passed: false, 
      importance: 'high' as const,
      suggestion: `O título tem ${data.title.length} caracteres. O ideal é entre 30 e 60.`
    })
  }
  
  // Verificar meta description
  if (data.metaDescription) {
    if (data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
      checks.push({ id: 'meta-length', label: 'Meta description tem tamanho ideal', passed: true, importance: 'high' as const })
      score += 15
    } else {
      checks.push({ 
        id: 'meta-length', 
        label: 'Meta description fora do tamanho ideal', 
        passed: false, 
        importance: 'high' as const,
        suggestion: `A meta description tem ${data.metaDescription.length} caracteres. O ideal é entre 120 e 160.`
      })
    }
  } else {
    checks.push({ 
      id: 'meta-missing', 
      label: 'Meta description está vazia', 
      passed: false, 
      importance: 'high' as const,
      suggestion: 'Adicione uma meta description para melhorar o SEO.'
    })
  }
  
  // Verificar tamanho do conteúdo
  const wordCount = data.content.split(/\s+/).length
  if (wordCount >= 300) {
    checks.push({ id: 'content-length', label: 'Conteúdo tem mais de 300 palavras', passed: true, importance: 'medium' as const })
    score += 20
  } else {
    checks.push({ 
      id: 'content-length', 
      label: 'Conteúdo muito curto', 
      passed: false, 
      importance: 'medium' as const,
      suggestion: `O conteúdo tem ${wordCount} palavras. Recomendamos pelo menos 300.`
    })
  }
  
  // Verificar headings
  const hasH2 = data.content.includes('##') || data.content.includes('<h2')
  if (hasH2) {
    checks.push({ id: 'has-headings', label: 'Conteúdo possui subtítulos', passed: true, importance: 'medium' as const })
    score += 15
  } else {
    checks.push({ 
      id: 'has-headings', 
      label: 'Conteúdo sem subtítulos', 
      passed: false, 
      importance: 'medium' as const,
      suggestion: 'Adicione subtítulos (H2) para melhorar a estrutura do conteúdo.'
    })
  }
  
  // Verificar links
  const hasLinks = data.content.includes('[') || data.content.includes('<a')
  if (hasLinks) {
    checks.push({ id: 'has-links', label: 'Conteúdo possui links', passed: true, importance: 'low' as const })
    score += 10
  } else {
    checks.push({ 
      id: 'has-links', 
      label: 'Conteúdo sem links', 
      passed: false, 
      importance: 'low' as const,
      suggestion: 'Adicione links internos e externos relevantes.'
    })
  }
  
  // Verificar imagens
  const hasImages = data.content.includes('![') || data.content.includes('<img')
  if (hasImages) {
    checks.push({ id: 'has-images', label: 'Conteúdo possui imagens', passed: true, importance: 'low' as const })
    score += 10
  } else {
    checks.push({ 
      id: 'has-images', 
      label: 'Conteúdo sem imagens', 
      passed: false, 
      importance: 'low' as const,
      suggestion: 'Adicione imagens para enriquecer o conteúdo.'
    })
  }
  
  // Keyword focus
  if (data.focusKeyword) {
    const keywordInTitle = data.title.toLowerCase().includes(data.focusKeyword.toLowerCase())
    if (keywordInTitle) {
      checks.push({ id: 'keyword-title', label: 'Palavra-chave presente no título', passed: true, importance: 'high' as const })
      score += 15
    } else {
      checks.push({ 
        id: 'keyword-title', 
        label: 'Palavra-chave ausente no título', 
        passed: false, 
        importance: 'high' as const,
        suggestion: `Inclua "${data.focusKeyword}" no título.`
      })
    }
  }
  
  return { score: Math.min(score, 100), checks }
}

// Salvar uso de IA para analytics
export async function logAIUsage(type: string, inputLength: number, outputLength: number) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  console.log(`AI Usage: ${type}, Input: ${inputLength}, Output: ${outputLength}, User: ${user.id}`)
}
