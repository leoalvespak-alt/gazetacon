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
      <div className="container mx-auto px-4 md:px-6 flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {settings?.logoUrl ? (
               <div className="relative w-32 h-8">
                 <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-contain object-left" priority />
               </div>
            ) : (
                <span className="hidden font-bold sm:inline-block">
                  {settings?.siteName || "Gazeta dos Concursos"}
                </span>
            )}
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile Menu & Actions */}
        <div className="flex flex-1 items-center justify-between md:justify-end">
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
          
          <div className="flex items-center space-x-2 w-full justify-end">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <span className="sr-only">Admin</span>
                  {/* Lock icon or similar */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </Link>
             </Button>
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
      </div>
    </header>
  )
}
