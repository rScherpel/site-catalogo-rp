import type { Category } from '../../types/catalog'

interface CategoryFilterProps {
  categories: Category[]
  activeSlug: string | 'all'
  countsBySlug: Record<string, number>
  totalCount: number
  onChange: (categorySlug: string | 'all') => void
}

export function CategoryFilter({
  categories,
  activeSlug,
  countsBySlug,
  totalCount,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="category-filter" aria-label="Filtro por categoria">
      <button
        type="button"
        className={activeSlug === 'all' ? 'category-filter__button category-filter__button--active' : 'category-filter__button'}
        onClick={() => onChange('all')}
        aria-pressed={activeSlug === 'all'}
      >
        <span>Todas</span>
        <span className="category-filter__count">{totalCount}</span>
      </button>

      {categories.map((category) => {
        const isActive = activeSlug === category.slug

        return (
          <button
            key={category.id}
            type="button"
            className={isActive ? 'category-filter__button category-filter__button--active' : 'category-filter__button'}
            onClick={() => onChange(category.slug)}
            aria-pressed={isActive}
          >
            <span>{category.label}</span>
            <span className="category-filter__count">{countsBySlug[category.slug] ?? 0}</span>
          </button>
        )
      })}
    </div>
  )
}
