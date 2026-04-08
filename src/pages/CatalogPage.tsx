import { useState } from 'react'
import { CategoryFilter } from '../components/catalog/CategoryFilter'
import { CatalogHeader } from '../components/catalog/CatalogHeader'
import { EmptyState } from '../components/catalog/EmptyState'
import { EstablishmentCard } from '../components/catalog/EstablishmentCard'
import { LoadingState } from '../components/catalog/LoadingState'
import { SearchBar } from '../components/catalog/SearchBar'
import { SortSelector } from '../components/catalog/SortSelector'
import { StatusFilter } from '../components/catalog/StatusFilter'
import { useCatalogData } from '../hooks/useCatalogData'
import type { CatalogFilters } from '../types/catalog'
import { getMonthLabel } from '../utils/access'
import { filterEstablishments, sortEstablishments } from '../utils/catalog'

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [categorySlug, setCategorySlug] = useState<'all' | string>('all')
  const [status, setStatus] = useState<CatalogFilters['status']>('all')
  const [sortBy, setSortBy] = useState<CatalogFilters['sortBy']>('name')

  const { catalogData, entries, loading, error, refresh, trackAccess, monthKey } = useCatalogData()
  const databaseStatusLabel = loading ? 'Verificando banco' : error ? 'Banco offline' : 'Banco online'

  const now = new Date()
  const filters: CatalogFilters = {
    search,
    categorySlug,
    status,
    sortBy,
  }

  const filteredEntries = filterEstablishments(entries, filters, now)
  const visibleEntries = sortEstablishments(filteredEntries, filters, now)

  const categoryCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.category.slug] = (counts[entry.category.slug] ?? 0) + 1
    return counts
  }, {})

  const handleResetFilters = (): void => {
    setSearch('')
    setCategorySlug('all')
    setStatus('all')
    setSortBy('name')
  }

  const hasActiveFilters = Boolean(search.trim()) || categorySlug !== 'all' || status !== 'all' || sortBy !== 'name'

  return (
    <div className="catalog-page">
      <main className="catalog-shell">
        <CatalogHeader
          visibleCount={visibleEntries.length}
          totalCount={entries.length}
          monthKey={monthKey}
        />

        <section className="catalog-toolbar" aria-label="Busca e filtros do catálogo">
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} />

          <CategoryFilter
            categories={catalogData?.categories ?? []}
            activeSlug={categorySlug}
            countsBySlug={categoryCounts}
            totalCount={entries.length}
            onChange={setCategorySlug}
          />

          <div className="filters-row">
            <StatusFilter value={status} onChange={setStatus} />
            <SortSelector value={sortBy} onChange={setSortBy} />
          </div>

          {hasActiveFilters ? (
            <button type="button" className="catalog-toolbar__reset action-button action-button--secondary" onClick={handleResetFilters}>
              Limpar filtros
            </button>
          ) : null}
        </section>

        <section className="catalog-results" aria-label="Resultados do catálogo">
          <p className="catalog-results__summary">
            {visibleEntries.length} resultados encontrados em {getMonthLabel(monthKey)}
          </p>

          {loading ? (
            <LoadingState cardsCount={6} />
          ) : error ? (
            <EmptyState
              tone="error"
              title="Não foi possível carregar o catálogo"
              description={error}
              actionLabel="Tentar novamente"
              onAction={() => void refresh()}
            />
          ) : visibleEntries.length === 0 ? (
            <EmptyState
              title="Nenhum estabelecimento encontrado"
              description="Altere a busca ou limpe os filtros para voltar a ver resultados."
              actionLabel="Limpar filtros"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="catalog-grid catalog-grid--cards">
              {visibleEntries.map((establishment) => (
                <EstablishmentCard
                  key={establishment.id}
                  establishment={establishment}
                  onTrackAccess={trackAccess}
                  now={now}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="catalog-footer" aria-label="Status do banco de dados">
          <span className={error ? 'catalog-footer__status catalog-footer__status--offline' : 'catalog-footer__status catalog-footer__status--online'}>
            {databaseStatusLabel}
          </span>
        </footer>
      </main>
    </div>
  )
}
