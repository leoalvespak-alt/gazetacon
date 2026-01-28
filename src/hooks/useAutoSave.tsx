"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseAutoSaveOptions {
  onSave: (data: unknown) => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

interface UseAutoSaveReturn {
  status: "idle" | "saving" | "saved" | "error"
  lastSaved: Date | null
  error: string | null
  triggerSave: () => void
}

export function useAutoSave<T>(
  data: T, 
  options: UseAutoSaveOptions
): UseAutoSaveReturn {
  const { onSave, debounceMs = 3000, enabled = true } = options
  
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string>(JSON.stringify(data))
  const isMountedRef = useRef(true)

  const save = useCallback(async () => {
    if (!enabled) return
    
    try {
      setStatus("saving")
      setError(null)
      
      await onSave(data)
      
      if (isMountedRef.current) {
        setStatus("saved")
        setLastSaved(new Date())
        
        // Salvar no localStorage como backup
        try {
          localStorage.setItem('autosave_backup', JSON.stringify({
            data,
            timestamp: new Date().toISOString()
          }))
        } catch {
          // Ignorar erro de localStorage
        }
        
        // Voltar para idle após 2 segundos
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus("idle")
          }
        }, 2000)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setStatus("error")
        setError(err instanceof Error ? err.message : "Erro ao salvar")
      }
    }
  }, [data, onSave, enabled])

  // Debounce save quando data muda
  useEffect(() => {
    if (!enabled) return
    
    const currentData = JSON.stringify(data)
    
    // Só salvar se houve mudança
    if (currentData === previousDataRef.current) return
    
    previousDataRef.current = currentData
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Criar novo timeout
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, debounceMs, enabled, save])

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const triggerSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    save()
  }, [save])

  return {
    status,
    lastSaved,
    error,
    triggerSave
  }
}

// Componente visual do status de salvamento
interface AutoSaveStatusProps {
  status: "idle" | "saving" | "saved" | "error"
  lastSaved: Date | null
  error: string | null
}

export function AutoSaveStatus({ status, lastSaved, error }: AutoSaveStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Salvando..."
      case "saved":
        return "Salvo"
      case "error":
        return error || "Erro ao salvar"
      default:
        if (lastSaved) {
          return `Último salvamento: ${lastSaved.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`
        }
        return ""
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "saving":
        return "text-blue-500"
      case "saved":
        return "text-green-500"
      case "error":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (status === "idle" && !lastSaved) return null

  return (
    <span className={`text-xs ${getStatusColor()}`}>
      {status === "saving" && (
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-1" />
      )}
      {status === "saved" && (
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
      )}
      {status === "error" && (
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
      )}
      {getStatusText()}
    </span>
  )
}
