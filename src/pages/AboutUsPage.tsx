import { Link } from 'react-router-dom'

export function AboutUsPage() {
  return (
    <main className="static-page">
      <section className="static-page__card">
        <p className="static-page__eyebrow">Sobre Nós</p>
        <h1>Sobre Nós</h1>

        <div className="static-page__content">
          <p>
            Somos um catálogo local criado para facilitar a descoberta de estabelecimentos da cidade em um único lugar.
          </p>
          <p>
            Nosso foco é ajudar moradores e visitantes a encontrar contatos, horários e caminhos rápidos para falar com os
            estabelecimentos.
          </p>
          <p>
            Trabalhamos com informações públicas e buscamos manter a navegação simples, rápida e objetiva.
          </p>
        </div>

        <div className="static-page__actions">
          <Link className="action-button action-button--primary" to="/">
            Voltar ao catálogo
          </Link>
          <Link className="action-button action-button--secondary" to="/contatos">
            Ir para Contatos
          </Link>
        </div>
      </section>
    </main>
  )
}