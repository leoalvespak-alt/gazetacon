"use client"

import React, { createContext, useContext, useState } from "react"
import { SiteSettings } from "@/app/admin/settings/actions"

interface SettingsContextType {
  settings: SiteSettings | null
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true
})

interface SettingsProviderProps {
  children: React.ReactNode
  initialSettings: SiteSettings | null
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
  const [settings] = useState<SiteSettings | null>(initialSettings)

  // Removido useEffect que causava lint error. 
  // O estado inicial é definido pelo useState(initialSettings).
  // Se precisar de atualização via prop, recomendo usar key={JSON.stringify(settings)} no componente pai.

  return (
    <SettingsContext.Provider value={{ settings, isLoading: !settings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
