export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <div className="container px-4 md:px-6 py-12 md:py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <p className="lead text-lg text-muted-foreground">
            Sua privacidade é importante para nós. Esta política descreve como a Gazeta dos Concursos coleta, usa e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Dados que Coletamos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Dados de Navegação:</strong> Utilizamos cookies para monitorar o tráfego (via Google Analytics) e exibir anúncios personalizados (via Google AdSense).</li>
            <li><strong>Dados de Cadastro (Leads):</strong> Quando você assina nossa newsletter ou entra em nossos grupos VIP, coletamos:
                <ul className="list-circle pl-5 mt-1 text-muted-foreground">
                    <li>E-mail</li>
                    <li>Endereço IP (para registro de consentimento)</li>
                    <li>Nome e Telefone (opcionais, para grupos de WhatsApp)</li>
                </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Finalidade do Tratamento</h2>
          <p>Seus dados são utilizados exclusivamente para:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Enviar notícias urgentes sobre editais e datas de provas.</li>
            <li>Divulgar materiais gratuitos e ofertas de cursos preparatórios de parceiros selecionados.</li>
            <li>Melhorar a experiência de navegação e o conteúdo do site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Seus Direitos (LGPD)</h2>
          <p>
            Você tem total controle sobre seus dados. A qualquer momento, você pode:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li><strong>Descadastrar-se (Opt-out):</strong> Basta clicar no link &quot;unsubscribe&quot; no rodapé de nossos e-mails ou sair dos grupos de WhatsApp.</li>
            <li><strong>Solicitar Exclusão:</strong> Envie um e-mail para <strong>[INSERIR E-MAIL DE CONTATO]</strong> solicitando a remoção completa de seus registros.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Cookies e Tecnologias de Terceiros</h2>
          <p>
            Utilizamos o Google AdSense para veicular anúncios. O Google pode usar cookies para exibir anúncios com base em suas visitas anteriores. Você pode desativar a publicidade personalizada nas Configurações de Anúncios do Google.
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
