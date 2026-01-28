import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem Somos | Gazeta dos Concursos",
  description:
    "Conheça a missão, visão e valores da Gazeta dos Concursos, seu portal confiável para notícias e editais.",
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="space-y-12">
        {/* Header Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Quem Somos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A sua fonte mais rápida e confiável sobre o mundo dos concursos
            públicos no Brasil.
          </p>
        </section>

        {/* Mission Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-2xl p-8 shadow-sm border">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              Nossa Missão
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Democratizar o acesso à informação de qualidade sobre concursos
              públicos, empoderando candidatos com notícias verificadas,
              análises precisas e materiais que transformam vidas através da
              educação e do serviço público.
            </p>
          </div>
          <div className="h-48 md:h-full bg-secondary/30 rounded-xl flex items-center justify-center">
            {/* Placeholder for an image or illustration */}
            <span className="text-4xl">🎯</span>
          </div>
        </section>

        {/* Values Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Nossos Valores</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Agilidade",
                desc: "Notícias em tempo real para você não perder nenhum prazo.",
              },
              {
                icon: "🛡️",
                title: "Credibilidade",
                desc: "Checagem rigorosa dos fatos. Sem fake news, apenas a verdade.",
              },
              {
                icon: "🤝",
                title: "Compromisso",
                desc: "Estamos ao lado do concurseiro em cada etapa da jornada.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story/Team Section */}
        <section className="prose prose-slate dark:prose-invert max-w-none">
          <h3>Nossa História</h3>
          <p>
            A Gazeta dos Concursos nasceu da necessidade de um portal
            jornalístico sério e focado exclusivamente no nicho de concursos.
            Fundada por especialistas em educação e jornalismo, nosso objetivo é
            limpar o ruído da desinformação e entregar o que realmente importa
            para a sua aprovação.
          </p>
        </section>
      </div>
    </div>
  );
}
