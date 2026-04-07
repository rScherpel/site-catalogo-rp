import type { CatalogSortBy } from '../../types/catalog'

interface SortSelectorProps {
  value: CatalogSortBy
  onChange: (sortBy: CatalogSortBy) => void
}

const SORT_OPTIONS: Array<{ value: CatalogSortBy; label: string }> = [
  { value: 'name', label: 'Nome' },
  { value: 'monthly_accesses', label: 'Mais acessados no mês' },
]

export function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <label className="filter-field">
      <span className="filter-label">Ordenar por</span>
      <select
        className="filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value as CatalogSortBy)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
