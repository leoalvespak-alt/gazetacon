"use client"
import Link from "next/link"
import { Search, Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import * as React from "react"

import { useSettings } from "@/components/providers/settings-provider"
import Image from "next/image"

export function Header() {
  const { setTheme, theme } = useTheme()
  const { settings } = useSettings()

  const navItems = [
    { label: "Notícias", href: "/category/noticias" },
    { label: "Dicas de Estudo", href: "/category/dicas" },
    { label: "Por Área", href: "/category/areas" },
    { label: "Editais & Provas", href: "/category/editais" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center gap-4">
        {/* Logo / Left side */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {settings?.logoUrl || true ? ( // Force use of logo.svg as default if desired, or just fallback
               <div className="relative w-32 h-10 brightness-0 invert">
                 <Image 
                   src={settings?.logoUrl || "/logo.svg"} 
                   alt={settings?.siteName || "Gazeta dos Concursos"} 
                   fill 
                   className="object-contain object-left" 
                   priority 
                 />
               </div>
            ) : (
                <span className="font-black text-xl sm:inline-block tracking-tighter uppercase">
                  {settings?.siteName || "Gazeta dos Concursos"}
                </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation / Center */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold uppercase tracking-tight">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-all hover:text-secondary text-primary-foreground/90 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
        
        {/* Actions / Right side */}
        <div className="flex flex-1 items-center justify-end space-x-4">
           {/* Mobile Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="mr-2 px-0 text-primary-foreground hover:bg-white/10 focus-visible:ring-0 md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-primary text-primary-foreground border-none">
               <nav className="flex flex-col space-y-6 mt-10">
                 {navItems.map(item => (
                   <Link 
                     key={item.href} 
                     href={item.href} 
                     className="text-xl font-black uppercase tracking-tighter hover:text-secondary transition-colors"
                   >
                     {item.label}
                   </Link>
                 ))}
               </nav>
            </SheetContent>
          </Sheet>
          
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
