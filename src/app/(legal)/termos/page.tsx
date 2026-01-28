import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Gazeta dos Concursos',
  description: 'Termos de Uso da Gazeta dos Concursos.',
};

export default function TermsPage() {
  return (
    <div className="prose prose-slate max-w-4xl mx-auto py-10 px-4 dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: Janeiro de 2026</p>

      <p>
        Bem-vindo à Gazeta dos Concursos. Ao acessar nosso site e utilizar nossas ferramentas, você concorda com os termos abaixo.
      </p>

      <h2>1. Natureza do Serviço</h2>
      <p>A Gazeta dos Concursos é um portal informativo e educativo.</p>
      <ul>
        <li><strong>Status de Concursos:</strong> Nossas informações sobre "Status" (Rumor, Autorizado, Edital) são baseadas em apuração jornalística e publicações oficiais. Embora nos esforcemos pela precisão máxima, não garantimos que datas ou editais não sofram alterações pelos órgãos oficiais.</li>
        <li><strong>Não somos Organizadores:</strong> Não temos vínculo com bancas examinadoras (como Cebraspe, FGV, IDECAN). Sempre confira o Diário Oficial ou o site da banca.</li>
      </ul>

      <h2>2. Repositório de Provas e Materiais</h2>
      <p>O acervo de provas antigas disponibilizado tem fim estritamente educacional.</p>
      <p>
        É proibido ao usuário fazer upload de materiais protegidos por direitos autorais de terceiros (como apostilas de cursinhos preparatórios piratas) em nossas ferramentas de comunidade ou redação.
      </p>

      <h2>3. Ferramentas de Estudo e IA</h2>
      <p>
        Nossa ferramenta de correção de redação pode utilizar Inteligência Artificial para auxílio na análise. O feedback fornecido é educativo e não garante nota idêntica em uma banca real.
      </p>
      <p>
        O uso de ferramentas automatizadas (bots/crawlers) para extração massiva de dados do nosso site é proibido sem autorização prévia.
      </p>

      <h2>4. Isenção de Responsabilidade</h2>
      <p>A Gazeta dos Concursos não se responsabiliza por:</p>
      <ul>
        <li>Aprovações ou reprovações em concursos públicos.</li>
        <li>Instabilidade técnica em sites de terceiros ou bancas organizadoras.</li>
        <li>Compras realizadas através de links de afiliados indicados no site.</li>
      </ul>

      <h2>5. Alterações nos Termos</h2>
      <p>
        Reservamo-nos o direito de alterar estes termos a qualquer momento. O uso contínuo do serviço após as alterações implica na aceitação dos novos termos.
      </p>
    </div>
  );
}
