import type { CatalogSortBy } from '../../types/catalog'

export type CatalogFilterOption = 'all' | 'open' | CatalogSortBy

interface FilterSelectorProps {
  value: CatalogFilterOption
  onChange: (value: CatalogFilterOption) => void
}

const FILTER_OPTIONS: Array<{ value: CatalogFilterOption; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Apenas abertos' },
  { value: 'name', label: 'Ordem alfabética' },
  { value: 'monthly_accesses', label: 'Mais acessados no mês' },
]

export function FilterSelector({ value, onChange }: FilterSelectorProps) {
  return (
    <label className="filter-field">
      <span className="filter-label">Filtrar por</span>
      <select
        className="filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value as CatalogFilterOption)}
      >
        {FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
