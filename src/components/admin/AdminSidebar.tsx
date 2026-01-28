"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  Tags, 
  Settings, 
  LogOut,
  Users,
  Trophy,
  FileCheck,
  CalendarDays,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useSettings } from "@/components/providers/settings-provider"
import Image from "next/image"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { settings } = useSettings()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/concursos", label: "Concursos", icon: Trophy },
    { href: "/admin/provas", label: "Provas", icon: FileCheck },
    { href: "/admin/calendar", label: "Calendário", icon: CalendarDays },
    { href: "/admin/ai", label: "Assistente IA", icon: Sparkles },
    { href: "/admin/categories", label: "Categorias", icon: Tags },
    { href: "/admin/users", label: "Usuários", icon: Users },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ]

  return (
    <aside className="hidden border-r bg-muted/40 md:block w-64 min-h-screen fixed inset-y-0 left-0 z-10">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-background">
          <Link href="/" className="flex items-center gap-2 font-semibold overflow-hidden">
            {settings?.faviconUrl ? (
               <div className="relative w-8 h-8 shrink-0">
                 <Image src={settings.faviconUrl} alt="Logo" fill className="object-contain" />
               </div>
            ) : null}
            <span className="truncate">{settings?.siteName || "Gazeta dos Concursos"}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2 bg-background">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            {links.map((link) => {
               const Icon = link.icon
               // Simple active check
               const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
               return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive 
                      ? "bg-muted text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 bg-background border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-destructive hover:text-destructive" 
                size="sm"
                onClick={handleLogout}
              >
                 <LogOut className="h-4 w-4"/>
                 Sair
              </Button>
        </div>
      </div>
    </aside>
  )
}
