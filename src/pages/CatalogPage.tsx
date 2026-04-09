import { useState } from 'react'
import { CategoryFilter } from '../components/catalog/CategoryFilter'
import { CatalogHeader } from '../components/catalog/CatalogHeader'
import { EmptyState } from '../components/catalog/EmptyState'
import { EstablishmentCard } from '../components/catalog/EstablishmentCard'
import { LoadingState } from '../components/catalog/LoadingState'
import { SearchBar } from '../components/catalog/SearchBar'
import { FilterSelector, type CatalogFilterOption } from '../components/catalog/SortSelector'
import { useCatalogData } from '../hooks/useCatalogData'
import type { CatalogFilters } from '../types/catalog'
import { filterEstablishments, sortEstablishments } from '../utils/catalog'

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [categorySlug, setCategorySlug] = useState<'all' | string>('all')
  const [filterBy, setFilterBy] = useState<CatalogFilterOption>('all')

  const { catalogData, entries, loading, error, refresh, trackAccess, monthKey } = useCatalogData()
  const databaseStatusLabel = loading ? 'Verificando banco' : error ? 'Banco offline' : 'Banco online'

  const now = new Date()
  const status = filterBy === 'open' ? 'open' : 'all'
  const sortBy = filterBy === 'monthly_accesses' ? 'monthly_accesses' : 'name'
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

  const sortedCategories = [...(catalogData?.categories ?? [])].sort((left, right) => {
    const rightCount = categoryCounts[right.slug] ?? 0
    const leftCount = categoryCounts[left.slug] ?? 0

    if (rightCount !== leftCount) {
      return rightCount - leftCount
    }

    return left.label.localeCompare(right.label, 'pt-BR')
  })

  const handleResetFilters = (): void => {
    setSearch('')
    setCategorySlug('all')
    setFilterBy('all')
  }

  const hasActiveFilters = Boolean(search.trim()) || categorySlug !== 'all' || filterBy !== 'all'

  return (
    <div className="catalog-page">
      <main className="catalog-shell">
        <CatalogHeader
          monthKey={monthKey}
        />

        <section className="catalog-toolbar" aria-label="Busca e filtros do catálogo">
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} />

          <CategoryFilter
            categories={sortedCategories}
            activeSlug={categorySlug}
            countsBySlug={categoryCounts}
            totalCount={entries.length}
            onChange={setCategorySlug}
          />

          <div className="filters-row">
            <FilterSelector value={filterBy} onChange={setFilterBy} />
          </div>

          {hasActiveFilters ? (
            <button type="button" className="catalog-toolbar__reset action-button action-button--secondary" onClick={handleResetFilters}>
              Limpar filtros
            </button>
          ) : null}
        </section>

        <section className="catalog-results" aria-label="Resultados do catálogo">
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
