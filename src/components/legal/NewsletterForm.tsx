"use client"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

export function NewsletterForm() {
    const [email, setEmail] = useState("")
    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !accepted) {
            toast.error("Por favor, preencha o e-mail e aceite os termos.")
            return
        }

        setLoading(true)

        try {
            // 1. Get IP (Optional/Best Effort via external service or just store blank for now since we are client side)
            // In a real app, you'd do this via a Next.js API route to get real IP.
            // For now, tracking valid consent timestamp is crucial.

            // 2. Insert into newsletter_consents
            const { error } = await supabase.from('newsletter_consents').insert({
                email,
                consent_type: 'newsletter_sub',
                accepted_terms_version: 'v1.0',
                // ip_address would go here if fetched
            })

            if (error) throw error

            setSuccess(true)
            toast.success("Inscrição realizada com sucesso!")
            setEmail("")
        } catch (error: any) {
            console.error(error)
            toast.error("Erro ao se inscrever. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="bg-primary/10 p-6 rounded-lg text-center border border-primary/20">
                <h3 className="text-xl font-bold text-primary mb-2">Obrigado por se inscrever!</h3>
                <p className="text-muted-foreground">Fique de olho na sua caixa de entrada para as melhores notícias.</p>
                <Button variant="link" onClick={() => setSuccess(false)} className="mt-2">
                    Cadastrar outro e-mail
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubscribe} className="space-y-4 max-w-md mx-auto">
            <div className="flex flex-col gap-2">
                <Input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    className="h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            
            <div className="flex items-start gap-2 py-2">
                <Checkbox 
                    id="terms" 
                    checked={accepted} 
                    onCheckedChange={(c) => setAccepted(c as boolean)}
                    className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Concordo com a <Link href="/privacidade" className="underline hover:text-primary">Política de Privacidade</Link> e aceito receber notícias e ofertas da Gazeta dos Concursos.
                </Label>
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                disabled={!accepted || loading}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Inscrever-se Agora
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
                Nós odiamos spam. Você pode cancelar a inscrição a qualquer momento.
            </p>
        </form>
    )
}
