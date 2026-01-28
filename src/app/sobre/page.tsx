import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem Somos | Gazeta dos Concursos",
  description:
    "O fim do ruído na sua preparação. Conheça a Gazeta dos Concursos, um ecossistema Clean & No-Ads focado na sua aprovação.",
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-6 py-16 md:py-24 max-w-3xl">
      <article className="prose prose-stone dark:prose-invert prose-lg md:prose-xl mx-auto leading-relaxed">
        
        {/* Header Minimalista */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl mb-4">
            O fim do ruído na sua <span className="text-primary italic">preparação</span>.
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Intro */}
        <p className="font-medium text-2xl text-muted-foreground leading-relaxed mb-10">
          A <strong className="text-foreground">Gazeta dos Concursos</strong> não é apenas mais um portal de notícias. É uma resposta direta à frustração de milhares de estudantes: a dificuldade de encontrar informação confiável em meio a um mar de anúncios, pop-ups e sensacionalismo.
        </p>

        <p className="text-xl">
          Nós decidimos fazer o caminho inverso.
        </p>

        <p>
          Enquanto o mercado luta por cliques, nós lutamos pela sua <strong>concentração</strong>. Somos um ecossistema de preparação de alto nível, desenhado para quem entende que tempo é o ativo mais valioso de um concurseiro.
        </p>

        <div className="my-16 border-l-4 border-primary pl-6 py-2 italic text-2xl font-serif text-muted-foreground">
          "Leia, planeje, estude. Sem distrações."
        </div>

        {/* O Que Nos Define */}
        <h2 className="text-3xl font-bold tracking-tight mt-16 mb-8 text-foreground">O Que Nos Define</h2>

        <div className="space-y-12">
          {/* Item 1 */}
          <div className="group">
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-3">
              <span className="text-primary/40 group-hover:text-primary/80">01.</span> Zero Anúncios, Foco Total
            </h3>
            <p className="mt-4 text-lg">
              Você não verá banners piscando, vídeos automáticos ou poluição visual em nossas páginas. Nossa interface é limpa, rápida e respeita o seu momento de estudo. Acreditamos que a leitura de um edital ou a resolução de uma prova exige <strong>paz mental</strong>.
            </p>
          </div>

          {/* Item 2 */}
          <div className="group">
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-3">
              <span className="text-primary/40 group-hover:text-primary/80">02.</span> Curadoria de Elite (Fiscal & Policial)
            </h3>
            <p className="mt-4 text-lg">
              Não atiramos para todos os lados. Nosso foco central são as carreiras de Estado (Polícia, Fisco, Controle e Jurídico). Não vamos desperdiçar sua atenção com concursos irrelevantes apenas para gerar volume. <strong>Se está na Gazeta, é relevante.</strong>
            </p>
          </div>

          {/* Item 3 */}
          <div className="group">
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-3">
              <span className="text-primary/40 group-hover:text-primary/80">03.</span> Informação sem Filtro (Nem Hype)
            </h3>
            <p className="mt-4 text-lg">
              Nosso sistema de rastreamento de concursos separa claramente o que é Rumor, Autorizado ou Edital Publicado. Se não temos certeza, nós dizemos. Não criamos falsas expectativas para vender cursos. Nossa linha editorial é pautada na <strong>verdade técnica</strong> e na análise fria dos dados.
            </p>
          </div>

          {/* Item 4 */}
          <div className="group">
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-3">
              <span className="text-primary/40 group-hover:text-primary/80">04.</span> Tecnologia a Favor da Aprovação
            </h3>
            <p className="mt-4 text-lg">
              Somos movidos por dados. Oferecemos um repositório organizado de provas passadas, editais verticalizados e ferramentas de estudo ativo. Tudo acessível em poucos cliques, sem burocracia.
            </p>
          </div>
        </div>

        {/* Missão */}
        <div className="mt-20 bg-muted/30 p-8 md:p-12 rounded-2xl border border-border/50 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground mb-6 text-sm">Nossa Missão</h2>
          <p className="text-2xl md:text-3xl font-bold leading-relaxed text-foreground">
            Ser o parceiro estratégico do concurseiro profissional. Fornecer a clareza necessária para que você tome as melhores decisões sobre sua carreira e sua preparação.
          </p>
        </div>

        {/* Assinatura */}
        <div className="mt-24 text-center border-t pt-10">
           <p className="font-serif italic text-2xl text-foreground">Equipe Editorial</p>
           <p className="text-sm font-bold uppercase tracking-widest text-primary mt-2">Gazeta dos Concursos</p>
        </div>

      </article>
    </div>
  );
}
