"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { getBancas, createBanca } from "@/app/admin/concursos/actions"

interface BancaSelectorProps {
  value: string | null | undefined
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function BancaSelector({
  value,
  onChange,
  placeholder = "Selecione a banca...",
  disabled = false
}: BancaSelectorProps) {
  const [open, setOpen] = useState(false)
  const [bancas, setBancas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    loadBancas()
  }, [])

  async function loadBancas() {
    setLoading(true)
    const { data, error } = await getBancas()
    if (data) {
      setBancas(data)
    } else {
      console.error("Erro ao carregar bancas:", error)
    }
    setLoading(false)
  }

  async function handleCreate(nome: string) {
    if (!nome) return

    setCreating(true)
    try {
        const { data, error } = await createBanca(nome)
        
        if (data) {
          setBancas(prev => {
              const exists = prev.some(b => b.toLowerCase() === data.toLowerCase())
              if (exists) return prev
              return [...prev, data].sort()
          })
          onChange(data)
          setOpen(false)
          setInputValue("")
          toast.success(`Banca "${data}" definida!`)
        } else {
          toast.error("Erro ao criar banca: " + error)
        }
    } catch (err) {
        console.error(err)
        toast.error("Erro inesperado ao criar banca")
    } finally {
        setCreating(false)
    }
  }

  const hasExactMatch = bancas.some(
    banca => banca.toLowerCase() === inputValue.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled || loading}
        >
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Pesquisar ou criar banca..." 
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                {!creating && inputValue && !hasExactMatch && (
                    <div className="p-2">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm"
                            onClick={() => handleCreate(inputValue)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar &quot;{inputValue}&quot;
                        </Button>
                    </div>
                )}
                {!inputValue && "Nenhuma banca encontrada."}
            </CommandEmpty>
            
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {bancas.map((banca) => (
                <CommandItem
                  key={banca}
                  value={banca}
                  onSelect={() => {
                    onChange(banca)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === banca ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {banca}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
