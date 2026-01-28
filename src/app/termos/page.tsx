export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <div className="container px-4 md:px-6 py-12 md:py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Isenção de Responsabilidade (Disclaimer)</h2>
          <div className="bg-muted p-4 rounded-lg border border-primary/20">
            <p className="font-medium text-foreground">
              A Gazeta dos Concursos é um portal de caráter estritamente informativo.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Embora nos esforcemos para manter as informações atualizadas, <strong>não nos responsabilizamos</strong> por:
            </p>
            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
              <li>Alterações de datas, locais ou conteúdos programáticos por parte das bancas organizadoras.</li>
              <li>Erros de interpretação dos editais por parte dos candidatos.</li>
              <li>Cancelamento ou suspensão de concursos.</li>
            </ul>
            <p className="mt-4 text-sm font-bold text-foreground">
              O candidato tem a obrigação de conferir todas as informações diretamente no Diário Oficial e no site da banca organizadora do certame.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Uso do Conteúdo</h2>
          <p>
            Todo o conteúdo publicado neste site (textos, imagens, logotipos) é de propriedade da Gazeta dos Concursos ou de seus parceiros, protegido pela Lei de Direitos Autorais.
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li><strong>É permitido:</strong> Compartilhar links para nossas notícias nas redes sociais.</li>
            <li><strong>É proibido:</strong> Copiar o texto na íntegra para outros blogs ou sites sem autorização prévia por escrito. Citações breves são permitidas desde que acompanhadas do link original (backlink).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Regras para Comentários</h2>
          <p>
            Fomentamos o debate saudável, mas reservamo-nos o direito de remover comentários que contenham:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Discurso de ódio, racismo, homofobia ou qualquer forma de discriminação.</li>
            <li>Spam, correntes ou links maliciosos.</li>
            <li>Ataques pessoais a outros leitores ou à equipe editorial.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Monetização e Afiliados</h2>
          <p>
            Este blog mantém-se através de publicidade. Podemos exibir anúncios (Google AdSense) e usar links de afiliados. Isso significa que, se você comprar um curso ou material através de nossos links, podemos receber uma pequena comissão sem custo adicional para você. Isso não influencia nossa independência editorial.
          </p>
        </section>

        <section>
            <p className="text-sm text-muted-foreground mt-12 border-t pt-4">
                Última atualização: {new Date().toLocaleDateString()}
            </p>
        </section>
      </div>
    </div>
  )
}
