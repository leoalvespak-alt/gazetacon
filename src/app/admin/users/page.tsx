"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null // Often profiles don't store email if separate, but let's check
  role: string
  created_at: string
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      // Note: This fetches from 'profiles' table. Ensure RLS allows reading.
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        setProfiles(data as Profile[])
      }
      setLoading(false)
    }

    fetchUsers()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários e administradores do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
          <CardDescription>
            Lista de usuários registrados na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado (além de você?).
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback>
                        {profile.full_name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">
                        {profile.full_name || "Usuário sem nome"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cadastrado em {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.role === 'admin' ? "default" : "secondary"}>
                      {profile.role || 'user'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
