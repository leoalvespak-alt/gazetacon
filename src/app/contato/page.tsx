
"use client";

import { useState } from "react";
import { Mail, Phone, Send } from "lucide-react"; // Assuming lucide-react is available, commonly used with shadcn/ui

export default function ContatoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Fale Conosco</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tem alguma dúvida, sugestão ou quer anunciar conosco? Entre em contato,
          nossa equipe está pronta para atender você.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Informações de Contato</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">E-mail</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    Para pautas e sugestões:
                  </p>
                  <a
                    href="mailto:redacao@gazetaconcursos.com.br"
                    className="text-primary hover:underline font-medium"
                  >
                    redacao@gazetaconcursos.com.br
                  </a>
                  <p className="text-sm text-muted-foreground mt-2 mb-1">
                    Para comercial e parcerias:
                  </p>
                  <a
                    href="mailto:comercial@gazetaconcursos.com.br"
                    className="text-primary hover:underline font-medium"
                  >
                    comercial@gazetaconcursos.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">WhatsApp</h4>
                  <p className="text-muted-foreground text-sm">
                    Atendimento exclusivo para assinantes.
                  </p>
                  <span className="block mt-1 font-medium">(11) 99999-9999</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-green-700">Mensagem Enviada!</h3>
              <p className="text-muted-foreground">
                Obrigado pelo contato. Responderemos em breve.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-primary hover:underline"
              >
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold">Envie uma mensagem</h3>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome
                </label>
                <input
                  id="name"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                {loading ? "Enviando..." : (
                  <>
                    <span>Enviar Mensagem</span>
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
