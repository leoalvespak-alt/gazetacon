"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Trophy, Calendar, MapPin, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { createClient } from "@/lib/supabase-browser"
import { Concurso, STATUS_LABELS, ConcursoStatus } from "@/types/concurso"
import { ConcursoStatusBadge } from "@/components/admin/ConcursoStatusBadge"

interface ConcursoSelectorProps {
  value: string | null
  onChange: (concursoId: string | null) => void
  label?: string
}

export function ConcursoSelector({ value, onChange, label = "Vincular a Concurso" }: ConcursoSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [concursos, setConcursos] = useState<Concurso[]>([])
  const [selectedConcurso, setSelectedConcurso] = useState<Concurso | null>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  // Buscar concurso selecionado
  useEffect(() => {
    if (value) {
      const fetchConcurso = async () => {
        const { data } = await supabase
          .from('concursos')
          .select('*')
          .eq('id', value)
          .single()
        
        if (data) {
          setSelectedConcurso(data as Concurso)
        }
      }
      fetchConcurso()
    } else {
      setSelectedConcurso(null)
    }
  }, [value, supabase])

  // Buscar concursos ao digitar
  const searchConcursos = useCallback(async (searchTerm: string) => {
    setLoading(true)
    
    let query = supabase
      .from('concursos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (searchTerm) {
      query = query.or(`titulo.ilike.%${searchTerm}%,orgao.ilike.%${searchTerm}%`)
    }
    
    const { data } = await query
    setConcursos((data || []) as Concurso[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (open) {
      searchConcursos(search)
    }
  }, [open, search, searchConcursos])

  const handleSelect = (concurso: Concurso) => {
    onChange(concurso.id)
    setSelectedConcurso(concurso)
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSelectedConcurso(null)
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {selectedConcurso ? (
        // Exibir concurso selecionado
        <Card>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-sm truncate">
                    {selectedConcurso.titulo}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{selectedConcurso.orgao}</span>
                  <ConcursoStatusBadge status={selectedConcurso.status as ConcursoStatus} />
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  {selectedConcurso.vagas_total > 0 && (
                    <span>{selectedConcurso.vagas_total} vagas</span>
                  )}
                  {selectedConcurso.salario_max && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(selectedConcurso.salario_max)}
                    </span>
                  )}
                  {selectedConcurso.data_inscricao_fim && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Até {new Date(selectedConcurso.data_inscricao_fim).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 flex-shrink-0"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Popover de busca
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-start text-muted-foreground"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar concurso...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Digite o título ou órgão..." 
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {loading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                ) : concursos.length === 0 ? (
                  <CommandEmpty>Nenhum concurso encontrado.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {concursos.map((concurso) => (
                      <CommandItem
                        key={concurso.id}
                        value={concurso.id}
                        onSelect={() => handleSelect(concurso)}
                        className="flex flex-col items-start gap-1 py-3"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium truncate flex-1">
                            {concurso.titulo}
                          </span>
                          <ConcursoStatusBadge status={concurso.status as ConcursoStatus} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                          <span>{concurso.orgao}</span>
                          {concurso.estado && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {concurso.estado}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
