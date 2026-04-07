import type { CatalogStatusFilter } from '../../types/catalog'

interface StatusFilterProps {
  value: CatalogStatusFilter
  onChange: (status: CatalogStatusFilter) => void
}

const STATUS_OPTIONS: Array<{ value: CatalogStatusFilter; label: string }> = [
  { value: 'all', label: 'Todos os status' },
  { value: 'open', label: 'Abertos' },
  { value: 'unavailable', label: 'Não informado' },
  { value: 'closed', label: 'Fechados' },
]

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <label className="filter-field">
      <span className="filter-label">Status</span>
      <select
        className="filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value as CatalogStatusFilter)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
