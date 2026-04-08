import type {
  CatalogData,
  CatalogEntry,
  CatalogFilters,
  EstablishmentHour,
  MonthlyAccess,
  Category,
} from '../types/catalog'
import { getEstablishmentStatus, getStatusPriority, sortHoursByDayAndInterval } from './time'

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function buildSearchFields(entry: CatalogEntry): string[] {
  return [entry.name, entry.category.label, entry.category.slug, entry.keywords.join(' ')]
    .map((field) => normalizeText(field))
    .filter(Boolean)
}

export function getSearchScore(entry: CatalogEntry, search: string): number {
  const normalizedSearch = normalizeText(search)

  if (!normalizedSearch) {
    return 0
  }

  const searchTerms = normalizedSearch.split(' ').filter(Boolean)
  const [nameText, categoryLabelText, categorySlugText, keywordText] = buildSearchFields(entry)

  let score = 0

  if (nameText === normalizedSearch) {
    score += 180
  } else if (nameText.startsWith(normalizedSearch)) {
    score += 120
  } else if (nameText.includes(normalizedSearch)) {
    score += 80
  }

  if (categoryLabelText === normalizedSearch || categorySlugText === normalizedSearch) {
    score += 70
  } else if (categoryLabelText.includes(normalizedSearch) || categorySlugText.includes(normalizedSearch)) {
    score += 40
  }

  for (const term of searchTerms) {
    if (nameText.includes(term)) {
      score += term === nameText ? 30 : 18
    }

    if (categoryLabelText.includes(term) || categorySlugText.includes(term)) {
      score += 8
    }

    if (keywordText.includes(term)) {
      score += 10
    }
  }

  const matchesAllTerms = searchTerms.every(
    (term) =>
      nameText.includes(term) ||
      categoryLabelText.includes(term) ||
      categorySlugText.includes(term) ||
      keywordText.includes(term),
  )

  if (matchesAllTerms) {
    score += 35
  }

  return score
}

export function matchesSearch(entry: CatalogEntry, search: string): boolean {
  return getSearchScore(entry, search) > 0
}

function buildHourMap(hours: EstablishmentHour[]): Map<string, EstablishmentHour[]> {
  const hourMap = new Map<string, EstablishmentHour[]>()

  for (const hour of hours) {
    const next = hourMap.get(hour.establishment_id) ?? []
    next.push(hour)
    hourMap.set(hour.establishment_id, next)
  }

  return hourMap
}

function buildMonthlyAccessMap(monthlyAccesses: MonthlyAccess[], monthKey: string): Map<string, number> {
  const accessMap = new Map<string, number>()

  for (const monthlyAccess of monthlyAccesses) {
    if (monthlyAccess.month_key === monthKey) {
      accessMap.set(monthlyAccess.establishment_id, monthlyAccess.access_count)
    }
  }

  return accessMap
}

function buildCategoryMap(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((category) => [category.id, category]))
}

export function buildCatalogEntries(data: CatalogData, monthKey: string): CatalogEntry[] {
  const categoryMap = buildCategoryMap(data.categories)
  const hourMap = buildHourMap(data.hours)
  const accessMap = buildMonthlyAccessMap(data.monthlyAccesses, monthKey)

  return data.establishments
    .filter((establishment) => establishment.active)
    .map((establishment) => {
      const category = categoryMap.get(establishment.primary_category_id)

      if (!category) {
        return null
      }

      const hours = sortHoursByDayAndInterval(hourMap.get(establishment.id) ?? [])

      return {
        ...establishment,
        category,
        hours,
        monthlyAccessCount: accessMap.get(establishment.id) ?? 0,
      }
    })
    .filter((entry): entry is CatalogEntry => entry !== null)
}

export function filterEstablishments(
  entries: CatalogEntry[],
  filters: CatalogFilters,
  now = new Date(),
): CatalogEntry[] {
  const search = filters.search.trim()

  return entries.filter((entry) => {
    if (filters.categorySlug !== 'all' && entry.category.slug !== filters.categorySlug) {
      return false
    }

    const status = getEstablishmentStatus(entry.hours, entry.closed_weekdays, now)

    if (filters.status !== 'all' && status !== filters.status) {
      return false
    }

    if (search && !matchesSearch(entry, search)) {
      return false
    }

    return true
  })
}

export function sortEstablishments(
  entries: CatalogEntry[],
  filters: CatalogFilters,
  now = new Date(),
): CatalogEntry[] {
  const search = filters.search.trim()
  const searchScoreMap = search
    ? new Map(entries.map((entry) => [entry.id, getSearchScore(entry, search)]))
    : null
  const statusMap = new Map(entries.map((entry) => [entry.id, getEstablishmentStatus(entry.hours, entry.closed_weekdays, now)]))

  return [...entries].sort((left, right) => {
    if (search && searchScoreMap) {
      const relevanceDifference = (searchScoreMap.get(right.id) ?? 0) - (searchScoreMap.get(left.id) ?? 0)

      if (relevanceDifference !== 0) {
        return relevanceDifference
      }

      const statusDifference =
        getStatusPriority(statusMap.get(left.id) ?? 'unavailable') -
        getStatusPriority(statusMap.get(right.id) ?? 'unavailable')

      if (statusDifference !== 0) {
        return statusDifference
      }
    } else {
      const sponsoredDifference = Number(right.sponsored) - Number(left.sponsored)

      if (sponsoredDifference !== 0) {
        return sponsoredDifference
      }

      const statusDifference =
        getStatusPriority(statusMap.get(left.id) ?? 'unavailable') -
        getStatusPriority(statusMap.get(right.id) ?? 'unavailable')

      if (statusDifference !== 0) {
        return statusDifference
      }
    }

    if (filters.sortBy === 'monthly_accesses') {
      const accessDifference = right.monthlyAccessCount - left.monthlyAccessCount

      if (accessDifference !== 0) {
        return accessDifference
      }
    } else {
      const nameDifference = left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' })

      if (nameDifference !== 0) {
        return nameDifference
      }
    }

    if (search && searchScoreMap) {
      const sponsoredDifference = Number(right.sponsored) - Number(left.sponsored)

      if (sponsoredDifference !== 0) {
        return sponsoredDifference
      }
    }

    return left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' })
  })
}
