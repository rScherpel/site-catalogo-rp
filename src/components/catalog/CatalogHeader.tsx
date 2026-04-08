import { getMonthLabel } from '../../utils/access'

interface CatalogHeaderProps {
  monthKey: string
}

export function CatalogHeader({ monthKey }: CatalogHeaderProps) {
  return (
    <header className="catalog-hero">
      <div className="catalog-hero__eyebrow">O CATÁLOGO DA SUA CIDADE</div>

      <div className="catalog-hero__copy">
        <h1 className="catalog-hero__title">Encontre tudo o que precisa em Rio Paranaíba</h1>
        <p className="catalog-hero__subtitle">
          Restaurantes, lojas, serviços e muito mais. Explore o que nossa cidade tem a oferecer e apoie o comércio local.
        </p>
      </div>

      <div className="catalog-hero__meta">
        <span className="catalog-chip">{getMonthLabel(monthKey)}</span>
      </div>
    </header>
  )
}
