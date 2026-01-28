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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-14 items-center gap-4">
        {/* Logo / Left side */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {settings?.logoUrl ? (
               <div className="relative w-32 h-8">
                 <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-contain object-left" priority />
               </div>
            ) : (
                <span className="font-bold sm:inline-block">
                  {settings?.siteName || "Gazeta dos Concursos"}
                </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation / Center */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-all hover:text-primary text-foreground/70 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
        
        {/* Actions / Right side */}
        <div className="flex flex-1 items-center justify-end space-x-2">
           {/* Mobile Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
               <nav className="flex flex-col space-y-4">
                 {navItems.map(item => (
                   <Link key={item.href} href={item.href} className="text-sm font-medium">
                     {item.label}
                   </Link>
                 ))}
               </nav>
            </SheetContent>
          </Sheet>
          
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
