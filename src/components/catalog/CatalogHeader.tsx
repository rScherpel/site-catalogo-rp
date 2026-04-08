import { getMonthLabel } from '../../utils/access'

interface CatalogHeaderProps {
  visibleCount: number
  totalCount: number
  monthKey: string
}

export function CatalogHeader({ visibleCount, totalCount, monthKey }: CatalogHeaderProps) {
  return (
    <header className="catalog-hero">
      <div className="catalog-hero__eyebrow">Catálogo local da cidade</div>

      <div className="catalog-hero__copy">
        <h1 className="catalog-hero__title">Estabelecimentos rápidos, diretos e prontos para ação.</h1>
        <p className="catalog-hero__subtitle">
          A busca sempre prioriza relevância. Patrocinados lideram apenas quando não há texto de busca, e cada
          card permite abrir WhatsApp, Maps ou ligar sem sair da navegação.
        </p>
      </div>

      <div className="catalog-hero__meta">
        <span className="catalog-chip catalog-chip--accent">{visibleCount} resultados</span>
        <span className="catalog-chip">{totalCount} ativos</span>
        <span className="catalog-chip">{getMonthLabel(monthKey)}</span>
      </div>
    </header>
  )
}
