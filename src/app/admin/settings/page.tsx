"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock save
    setTimeout(() => {
      setLoading(false)
      toast.success("Configurações salvas com sucesso!")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações gerais do site e SEO.
        </p>
      </div>

      <form onSubmit={handleSave}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Site</CardTitle>
            <CardDescription>
              Dados visíveis em todo o site e motores de busca.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Nome do Blog</Label>
              <Input id="siteName" defaultValue="Gazeta dos Concursos" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (Meta Description)</Label>
              <Textarea 
                id="description" 
                defaultValue="Dicas, Notícias e Editais de Concursos Públicos para sua aprovação." 
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email de Contato</Label>
              <Input id="contactEmail" type="email" defaultValue="contato@gazetaconcursos.com.br" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>
              Links para rodapé e compartilhamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="@seuinstagram" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input id="youtube" placeholder="Canal URL" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input id="twitter" placeholder="@handle" />
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
      </form>
    </div>
  )
}
