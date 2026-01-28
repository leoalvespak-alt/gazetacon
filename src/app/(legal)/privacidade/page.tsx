import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Gazeta dos Concursos',
  description: 'Política de Privacidade da Gazeta dos Concursos.',
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-slate max-w-4xl mx-auto py-10 px-4 dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: Janeiro de 2026</p>

      <p>
        A Gazeta dos Concursos ("nós", "nosso") valoriza a sua privacidade e se compromete a proteger seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Esta política explica como coletamos e usamos suas informações.
      </p>

      <h2>1. Dados que Coletamos</h2>
      <p>Para oferecer nossos serviços, podemos coletar:</p>
      <ul>
        <li><strong>Dados de Cadastro:</strong> Nome, e-mail e foto de perfil (quando integrado via provedores de login como Google ou cadastro direto).</li>
        <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de navegador e páginas acessadas (para fins de segurança e auditoria do sistema).</li>
        <li><strong>Conteúdo do Usuário:</strong> Redações enviadas para correção e preferências de estudo salvas em nosso sistema.</li>
      </ul>

      <h2>2. Como Usamos seus Dados</h2>
      <p>Utilizamos suas informações para:</p>
      <ul>
        <li>Autenticar seu acesso à área restrita e ferramentas de estudo.</li>
        <li>Enviar alertas de editais e notícias relevantes (caso você opte por receber).</li>
        <li>Melhorar a experiência do usuário e corrigir bugs no sistema.</li>
      </ul>
      <p><strong>Nota:</strong> Não vendemos seus dados pessoais para terceiros.</p>

      <h2>3. Links de Afiliados e Terceiros</h2>
      <p>
        Nosso portal pode conter links para parceiros e programas de afiliados. Ao clicar nesses links, você será direcionado a sites externos que possuem suas próprias políticas de privacidade e cookies. Não nos responsabilizamos pelas práticas desses terceiros.
      </p>

      <h2>4. Armazenamento e Segurança</h2>
      <p>
        Seus dados são armazenados em servidores seguros (utilizamos infraestrutura moderna via Supabase). Adotamos medidas técnicas para proteger suas informações, mas lembramos que nenhum sistema é 100% inviolável.
      </p>

      <h2>5. Seus Direitos</h2>
      <p>
        Você tem o direito de solicitar o acesso, correção ou exclusão dos seus dados pessoais de nossa base a qualquer momento. Para isso, entre em contato conosco pelo canal oficial.
      </p>
    </div>
  );
}
