"use client"

import { useState, useEffect } from "react"
import { 
  Facebook, 
  Linkedin, 
  Twitter, 
  Link as LinkIcon, 
  Check,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

interface ShareButtonsProps {
  title: string
  url?: string
}

export function ShareButtons({ title, url: propUrl }: ShareButtonsProps) {
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(propUrl || window.location.href)
    }
  }, [propUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copiado para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao copiar link")
    }
  }

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      color: "hover:text-green-600 hover:bg-green-50",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:text-blue-700 hover:bg-blue-50",
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:text-black hover:bg-gray-50",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:text-blue-600 hover:bg-blue-50",
    },
  ]

  if (!url) return null

  return (
    <div className="flex items-center gap-2 py-4 border-t border-b my-6 bg-muted/20 px-4 rounded-lg">
      <span className="text-sm font-bold text-muted-foreground mr-auto flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Compartilhe:
      </span>
      
      <div className="flex items-center gap-1">
        <TooltipProvider>
            {shareLinks.map((link) => (
            <Tooltip key={link.name}>
                <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-full transition-colors ${link.color}`}
                    asChild
                >
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <link.icon className="h-4 w-4" />
                    <span className="sr-only">Compartilhar no {link.name}</span>
                    </a>
                </Button>
                </TooltipTrigger>
                <TooltipContent>{link.name}</TooltipContent>
            </Tooltip>
            ))}

            <div className="w-px h-4 bg-border mx-1" />

            <Tooltip>
            <TooltipTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-muted"
                onClick={handleCopy}
                >
                {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                ) : (
                    <LinkIcon className="h-4 w-4" />
                )}
                <span className="sr-only">Copiar Link</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>Copiar Link</TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
