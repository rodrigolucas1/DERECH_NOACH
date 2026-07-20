export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-gray-600">
          Última atualização: Julho de 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-gray-600">
        <p>
          Esta Política de Privacidade descreve como o Portal Bnei Noach do
          Brasil coleta, utiliza e protege as informações dos seus usuários, em
          conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº
          13.709/2018).
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            1. Dados Coletados
          </h2>
          <p className="mb-3">
            Para utilizar nossos serviços, podemos solicitar os seguintes dados:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Cidade e estado de residência</li>
            <li>Dados de autenticação (quando aplicável)</li>
          </ul>
          <p className="mt-3">
            Também podemos coletar automaticamente informações técnicas como
            endereço IP, tipo de navegador e dados de navegação para fins de
            melhoria da plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            2. Uso dos Dados
          </h2>
          <p className="mb-3">
            Os dados coletados são utilizados exclusivamente para:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Viabilizar o funcionamento da plataforma e seus recursos</li>
            <li>Gerenciar seu cadastro e autenticação</li>
            <li>Conectar você a comunidades e eventos</li>
            <li>Enviar comunicações relacionadas à plataforma</li>
            <li>Melhorar a experiência de uso do Portal</li>
            <li>Garantir a segurança da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            3. Compartilhamento
          </h2>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com
            terceiros para fins comerciais. Seus dados podem ser compartilhados
            apenas nas seguintes situações:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-4">
            <li>
              Com lideranças de comunidades, quando você opta por participar de
              uma comunidade
            </li>
            <li>
              Por determinação legal ou ordem judicial
            </li>
            <li>
              Para proteger os direitos, a segurança ou a propriedade do Portal
              Bnei Noach e seus membros
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            4. Direitos do Usuário
          </h2>
          <p className="mb-3">
            Em conformidade com a LGPD, você tem direito a:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>
              <strong>Confirmação</strong> da existência de tratamento de dados
            </li>
            <li>
              <strong>Acesso</strong> aos seus dados pessoais
            </li>
            <li>
              <strong>Correção</strong> de dados incompletos ou desatualizados
            </li>
            <li>
              <strong>Anonimização, bloqueio ou eliminação</strong> de dados
              desnecessários
            </li>
            <li>
              <strong>Portabilidade</strong> dos dados a outro fornecedor
            </li>
            <li>
              <strong>Eliminação</strong> dos dados tratados com consentimento
            </li>
            <li>
              <strong>Informação</strong> sobre entidades com quem seus dados
              foram compartilhados
            </li>
            <li>
              <strong>Revogação do consentimento</strong>, a qualquer momento
            </li>
          </ul>
          <p className="mt-3">
            Para exercer esses direitos, entre em contato conosco pelo e-mail{" "}
            <strong>privacidade@bneinoach.org.br</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            5. Segurança
          </h2>
          <p>
            Adotamos medidas técnicas e administrativas adequadas para proteger
            seus dados pessoais contra acessos não autorizados, situações
            acidentais ou ilícitas de destruição, perda, alteração, comunicação
            ou qualquer forma de tratamento inadequado ou ilícito.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            6. Alterações nesta Política
          </h2>
          <p>
            Esta Política de Privacidade pode ser atualizada periodicamente.
            Recomendamos que os usuários revisem esta página regularmente para
            se manterem informados sobre como protegemos suas informações.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o
            tratamento dos seus dados pessoais, entre em contato com nosso
            Encarregado de Proteção de Dados:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-4">
            <li>
              <strong>E-mail:</strong> privacidade@bneinoach.org.br
            </li>
            <li>
              <strong>Comunidade:</strong> Portal Bnei Noach do Brasil
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
