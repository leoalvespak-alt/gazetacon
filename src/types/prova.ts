export interface Prova {
  id: string
  titulo: string
  concurso_id: string | null
  
  orgao: string
  banca: string | null
  ano: number
  cargo: string | null
  
  prova_url: string | null
  gabarito_url: string | null
  gabarito_comentado_url: string | null
  
  total_questoes: number
  assuntos_mais_cobrados: string[]
  
  downloads: number
  created_at: string
  uploaded_by: string | null
}

export interface ProvaFormData {
  titulo: string
  concurso_id?: string | null
  orgao: string
  banca?: string
  ano: number
  cargo?: string
  prova_url?: string
  gabarito_url?: string
  gabarito_comentado_url?: string
  total_questoes?: number
  assuntos_mais_cobrados?: string[]
}

export const ANOS_DISPONIVEIS = Array.from(
  { length: 25 }, 
  (_, i) => new Date().getFullYear() - i
)
