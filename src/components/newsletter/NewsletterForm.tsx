'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/actions/newsletter'
import { Bell, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NewsletterFormProps {
  variant?: 'sidebar' | 'footer' | 'inline'
  source?: string
  className?: string
}

export function NewsletterForm({ 
  variant = 'sidebar', 
  source = 'sidebar',
  className
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const result = await subscribeToNewsletter(email, source)
      
      if (result.success) {
        setSuccess(true)
        toast.success(result.message)
        setEmail('')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn(
        "rounded-xl border bg-primary/5 p-6 text-center animate-in fade-in zoom-in duration-300", 
        className
      )}>
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="font-bold text-lg mb-2">Inscrição Confirmada!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Você receberá nossos melhores artigos e novidades em primeira mão.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
          Cadastrar outro email
        </Button>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden", className)}>
        {/* Abstract decoration */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold leading-none">Notificações</h3>
            <p className="text-xs text-muted-foreground mt-1">Não perca nenhum edital</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Receba avisos sobre novos concursos, análises de editais e dicas de estudo diretamente no seu email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="email" 
              placeholder="seu@email.com" 
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Ativar Notificações"}
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          *Livre de spam. Cancele quando quiser.
        </p>
      </div>
    )
  }

  // Footer / Inline variant
  return (
    <div className={cn("rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 relative overflow-hidden isolate", className)}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4 backdrop-blur-sm">
            <Bell className="h-3 w-3" />
            <span>Fique atualizado</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            Receba as novidades da Gazeta
          </h3>
          <p className="text-primary-foreground/80 max-w-md">
            Entre para nossa lista VIP e receba análises exclusivas, resumos de editais e cronogramas de estudo.
          </p>
        </div>

        <div className="bg-card/5 backdrop-blur-sm rounded-xl p-1 md:p-2 border border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input 
              type="email" 
              placeholder="Digite seu melhor email..." 
              className="bg-card text-card-foreground border-transparent h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              variant="secondary" 
              size="lg" 
              className="h-12 px-8 font-bold whitespace-nowrap"
              disabled={loading}
            >
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Inscrever-se Grátis"}
            </Button>
          </form>
          <p className="text-xs text-primary-foreground/60 mt-3 px-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Mais de 5.000 concurseiros inscritos
          </p>
        </div>
      </div>
    </div>
  )
}
