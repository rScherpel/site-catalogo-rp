import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <main className="static-page">
      <section className="static-page__card">
        <p className="static-page__eyebrow">Políticas de privacidade</p>
        <h1>Políticas de privacidade</h1>

        <div className="static-page__content">
          <p>
            Este catálogo reúne informações públicas de estabelecimentos que já aparecem em fontes abertas, como Google,
            Google Maps, perfis públicos e imagens disponibilizadas publicamente na internet.
          </p>

          <p>
            Os dados e imagens exibidos nesta plataforma não são coletados de forma privada. O objetivo do serviço é apenas
            organizar e facilitar o acesso a conteúdos que já estão disponíveis publicamente.
          </p>

          <p>
            A retirada de um estabelecimento do catálogo pode ser solicitada exclusivamente pelo próprio estabelecimento ou
            por um representante autorizado. Para isso, use a página de <Link className="static-page__inline-link" to="/contato">contato</Link> informando os
            dados do estabelecimento e o motivo da solicitação.
          </p>

          <p>
            Após o pedido, a equipe poderá avaliar a exclusão do cadastro do estabelecimento da plataforma. Essa solicitação
            se aplica somente ao estabelecimento em questão; não garante remoção de conteúdos que continuem públicos em outras
            fontes da internet.
          </p>

          <p>
            Se houver atualização de informações públicas no Google ou em outras fontes abertas, o catálogo poderá refletir
            essas alterações com o tempo.
          </p>
        </div>

        <div className="static-page__actions">
          <Link className="action-button action-button--primary" to="/contato">
            Falar com a equipe
          </Link>
          <Link className="action-button action-button--secondary" to="/">
            Voltar ao catálogo
          </Link>
        </div>
      </section>
    </main>
  )
}