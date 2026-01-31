"use client"

import { useState, useEffect } from "react"
import { 
  Facebook, 
  Linkedin, 
  Twitter, 
  Link as LinkIcon, 
  Check,
  MessageCircle,
  Instagram
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

type ShareLink = {
  name: string
  icon: React.ElementType
  href: string
  color: string
  onClick?: () => void
}

export function ShareButtons({ title, url: propUrl }: ShareButtonsProps) {
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = propUrl || window.location.href
      if (currentUrl !== url) {
        setUrl(currentUrl)
      }
    }
  }, [propUrl, url])

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

  const shareLinks: ShareLink[] = [
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
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      // On mobile, this tries to open story camera. On desktop, it's a placeholder.
      // We handle the click to copy link first.
      onClick: () => {
        navigator.clipboard.writeText(url).then(() => {
           toast.success("Link copiado! Coloque nos stories.")
        })
        // Attempt to open Instagram Stories Camera (mobile)
        // This URL scheme works on some devices if app is installed
        window.location.href = "instagram://story-camera"
        
        // Fallback or additional guidance could be added here
        // e.g. if we could detect desktop, we might open instagram.com
        setTimeout(() => {
           // If the app didn't open (e.g. desktop), redirect to instagram web
           // logic to detect if it opened is complex, so we might just let it be.
           if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
              window.open("https://instagram.com", "_blank")
           }
        }, 500)
      },
      color: "hover:text-pink-600 hover:bg-pink-50",
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
{shareLinks.map((link) => {
              const LinkIcon = link.icon
              return (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-full transition-colors ${link.color}`}
                      onClick={(e) => {
                        if (link.onClick) {
                          e.preventDefault()
                          link.onClick()
                        }
                      }}
                      asChild={!link.onClick}
                    >
                      {link.onClick ? (
                        <div className="cursor-pointer">
                          <LinkIcon className="h-4 w-4" />
                          <span className="sr-only">Compartilhar no {link.name}</span>
                        </div>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-4 w-4" />
                          <span className="sr-only">Compartilhar no {link.name}</span>
                        </a>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{link.name}</TooltipContent>
                </Tooltip>
              )
            })}

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
