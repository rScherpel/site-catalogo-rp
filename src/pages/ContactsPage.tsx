import { Link } from 'react-router-dom'

export function ContactsPage() {
  return (
    <main className="static-page">
      <section className="static-page__card">
        <p className="static-page__eyebrow">Contatos</p>
        <h1>Contatos</h1>

        <div className="static-page__content">
          <p>
            Em breve, esta página vai concentrar os canais oficiais de contato do projeto para solicitações, parcerias e
            pedidos de remoção de estabelecimentos.
          </p>
          <p>
            Enquanto isso, mantenha este espaço reservado para publicar email, WhatsApp e demais meios de atendimento.
          </p>
        </div>

        <div className="static-page__actions">
          <Link className="action-button action-button--primary" to="/">
            Voltar ao catálogo
          </Link>
          <Link className="action-button action-button--secondary" to="/politicas-de-privacidade">
            Ver políticas de privacidade
          </Link>
        </div>
      </section>
    </main>
  )
}