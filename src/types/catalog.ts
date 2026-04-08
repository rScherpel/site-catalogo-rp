export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type EstablishmentStatus = 'open' | 'closed' | 'unavailable'

export type CatalogSortBy = 'name' | 'monthly_accesses'

export type CatalogStatusFilter = EstablishmentStatus | 'all'

export type CatalogCategoryFilter = string | 'all'

export interface Category {
  id: string
  slug: string
  label: string
  created_at: string
}

export interface Establishment {
  id: string
  slug: string
  name: string
  logo_url: string | null
  phone: string
  whatsapp: string | null
  address: string
  maps_url: string | null
  sponsored: boolean
  primary_category_id: string
  keywords: string[]
  active: boolean
  closed_weekdays: Weekday[]
  created_at: string
  updated_at: string
}

export interface EstablishmentHour {
  id: string
  establishment_id: string
  weekday: Weekday
  interval_index: 1 | 2
  open_time: string
  close_time: string
}

export interface MonthlyAccess {
  id: string
  establishment_id: string
  month_key: string
  access_count: number
  updated_at: string
}

export interface CatalogData {
  categories: Category[]
  establishments: Establishment[]
  hours: EstablishmentHour[]
  monthlyAccesses: MonthlyAccess[]
}

export interface CatalogEntry extends Establishment {
  category: Category
  hours: EstablishmentHour[]
  monthlyAccessCount: number
}

export interface CatalogFilters {
  search: string
  categorySlug: CatalogCategoryFilter
  status: CatalogStatusFilter
  sortBy: CatalogSortBy
}
