// =============================================
// Tipos para Concursos
// =============================================

export type ConcursoStatus = 
  | 'previsto' 
  | 'rumor'
  | 'autorizado'
  | 'comissao_formada'
  | 'banca_definida'
  | 'edital_aberto'
  | 'suspenso'
  | 'sem_previsao'
  | 'inscricoes_abertas' 
  | 'inscricoes_encerradas' 
  | 'em_andamento' 
  | 'encerrado'

export type ConcursoArea = 
  | 'fiscal' 
  | 'policial' 
  | 'juridica' 
  | 'administrativa' 
  | 'saude' 
  | 'educacao' 
  | 'bancaria' 
  | 'ti'
  | 'outra'

export type ConcursoAbrangencia = 'nacional' | 'estadual' | 'municipal'

export type Escolaridade = 'fundamental' | 'medio' | 'tecnico' | 'superior' | 'especifico'

export interface ConcursoCargo {
  nome: string
  vagas: number
  salario: number
  escolaridade?: string
}

export interface Concurso {
  id: string
  titulo: string
  slug: string
  orgao: string
  banca: string | null
  banca_ultimo_concurso: string | null
  banca_definida: boolean
  
  vagas_total: number
  vagas_imediatas: number
  vagas_cr: number
  salario_min: number | null
  salario_max: number | null
  
  escolaridade: string | null
  cargos: ConcursoCargo[]
  
  data_publicacao: string | null
  data_inscricao_inicio: string | null
  data_inscricao_fim: string | null
  data_prova: string | null
  data_resultado: string | null
  
  status: ConcursoStatus
  
  edital_url: string | null
  site_oficial: string | null
  taxa_inscricao: number | null
  
  estado: string | null
  cidade: string | null
  abrangencia: ConcursoAbrangencia
  
  area: ConcursoArea | null
  
  destaque: boolean
  visualizacoes: number
  created_at: string
  updated_at: string
  author_id: string | null
}

export interface ConcursoFormData {
  titulo: string
  orgao: string
  banca?: string
  banca_ultimo_concurso?: string
  banca_definida?: boolean
  area?: ConcursoArea
  abrangencia?: ConcursoAbrangencia
  estado?: string
  cidade?: string
  
  vagas_total?: number
  vagas_imediatas?: number
  vagas_cr?: number
  salario_min?: number
  salario_max?: number
  escolaridade?: string
  cargos?: ConcursoCargo[]
  
  data_publicacao?: string
  data_inscricao_inicio?: string
  data_inscricao_fim?: string
  data_prova?: string
  data_resultado?: string
  
  status?: ConcursoStatus
  edital_url?: string
  site_oficial?: string
  taxa_inscricao?: number
  
  destaque?: boolean
}

// Helpers
export const STATUS_LABELS: Record<ConcursoStatus, string> = {
  sem_previsao: 'Sem Previsão',
  rumor: 'Rumor',
  previsto: 'Previsto',
  autorizado: 'Autorizado',
  comissao_formada: 'Comissão Formada',
  banca_definida: 'Banca Definida',
  edital_aberto: 'Edital Aberto',
  inscricoes_abertas: 'Inscrições Abertas',
  inscricoes_encerradas: 'Inscrições Encerradas',
  em_andamento: 'Em Andamento',
  suspenso: 'Suspenso',
  encerrado: 'Encerrado'
}

export const STATUS_COLORS: Record<ConcursoStatus, string> = {
  sem_previsao: 'bg-slate-100 text-slate-800',
  rumor: 'bg-purple-100 text-purple-800',
  previsto: 'bg-gray-100 text-gray-800',
  autorizado: 'bg-blue-100 text-blue-800',
  comissao_formada: 'bg-cyan-100 text-cyan-800',
  banca_definida: 'bg-indigo-100 text-indigo-800',
  edital_aberto: 'bg-emerald-100 text-emerald-800',
  inscricoes_abertas: 'bg-green-100 text-green-800',
  inscricoes_encerradas: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  suspenso: 'bg-red-100 text-red-800',
  encerrado: 'bg-slate-200 text-slate-900'
}

export const AREA_LABELS: Record<ConcursoArea, string> = {
  fiscal: 'Área Fiscal',
  policial: 'Área Policial',
  juridica: 'Área Jurídica',
  administrativa: 'Área Administrativa',
  saude: 'Área da Saúde',
  educacao: 'Área da Educação',
  bancaria: 'Área Bancária',
  ti: 'Tecnologia da Informação',
  outra: 'Outras Áreas'
}

export const ABRANGENCIA_LABELS: Record<ConcursoAbrangencia, string> = {
  nacional: 'Nacional',
  estadual: 'Estadual',
  municipal: 'Municipal'
}

export const ESCOLARIDADE_LABELS: Record<Escolaridade, string> = {
  fundamental: 'Ensino Fundamental',
  medio: 'Ensino Médio',
  tecnico: 'Ensino Técnico',
  superior: 'Ensino Superior',
  especifico: 'Formação Específica'
}

export const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
]

export const BANCAS_COMUNS = [
  'CESPE/CEBRASPE',
  'FCC',
  'FGV',
  'VUNESP',
  'IBFC',
  'IDECAN',
  'IADES',
  'QUADRIX',
  'AOCP',
  'FUNDATEC',
  'Instituto Consulplan',
  'FUNCAB',
  'Cesgranrio',
  'ESAF',
  'Outra'
]
