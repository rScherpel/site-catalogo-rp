import { mockCatalogData } from '../data/mockCatalog'
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient'
import type { Category, CatalogData, Establishment, EstablishmentHour, MonthlyAccess } from '../types/catalog'
import { getMonthKey } from '../utils/access'

const DEMO_STORAGE_PREFIX = 'site-catalogo-rp:demo-accesses'

function cloneCategory(category: Category): Category {
  return { ...category }
}

function cloneEstablishment(establishment: Establishment): Establishment {
  return {
    ...establishment,
    keywords: [...establishment.keywords],
  }
}

function cloneHour(hour: EstablishmentHour): EstablishmentHour {
  return { ...hour }
}

function cloneMonthlyAccess(monthlyAccess: MonthlyAccess): MonthlyAccess {
  return { ...monthlyAccess }
}

function readDemoStore(monthKey: string): Record<string, number> {
  if (typeof window === 'undefined') {
    return {}
  }

  const storageKey = `${DEMO_STORAGE_PREFIX}:${monthKey}`

  try {
    const raw = window.localStorage.getItem(storageKey)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as unknown

    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).flatMap(([establishmentId, count]) => {
        if (typeof count !== 'number' || Number.isNaN(count)) {
          return []
        }

        return [[establishmentId, count]]
      }),
    )
  } catch {
    return {}
  }
}

function writeDemoStore(monthKey: string, store: Record<string, number>): void {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = `${DEMO_STORAGE_PREFIX}:${monthKey}`
  window.localStorage.setItem(storageKey, JSON.stringify(store))
}

function getDemoBaseCount(monthKey: string, establishmentId: string): number {
  return (
    mockCatalogData.monthlyAccesses.find(
      (monthlyAccess) =>
        monthlyAccess.month_key === monthKey && monthlyAccess.establishment_id === establishmentId,
    )?.access_count ?? 0
  )
}

function buildDemoMonthlyAccesses(monthKey: string): MonthlyAccess[] {
  const baseRows = mockCatalogData.monthlyAccesses
    .filter((monthlyAccess) => monthlyAccess.month_key === monthKey)
    .map(cloneMonthlyAccess)
  const store = readDemoStore(monthKey)
  const rowsByEstablishment = new Map(baseRows.map((monthlyAccess) => [monthlyAccess.establishment_id, monthlyAccess]))

  for (const [establishmentId, increment] of Object.entries(store)) {
    const existingRow = rowsByEstablishment.get(establishmentId)

    if (existingRow) {
      existingRow.access_count += increment
      continue
    }

    rowsByEstablishment.set(establishmentId, {
      id: `demo-${establishmentId}-${monthKey}`,
      establishment_id: establishmentId,
      month_key: monthKey,
      access_count: increment,
      updated_at: new Date().toISOString(),
    })
  }

  return [...rowsByEstablishment.values()]
}

export async function fetchCategories(): Promise<Category[]> {
  if (!hasSupabaseConfig || !supabase) {
    return mockCatalogData.categories.map(cloneCategory)
  }

  const { data, error } = await supabase.from('categories').select('*').order('label', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((category) => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    created_at: category.created_at,
  }))
}

export async function fetchEstablishments(): Promise<Establishment[]> {
  if (!hasSupabaseConfig || !supabase) {
    return mockCatalogData.establishments.map(cloneEstablishment)
  }

  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((establishment) => ({
    id: establishment.id,
    slug: establishment.slug,
    name: establishment.name,
    logo_url: establishment.logo_url,
    phone: establishment.phone,
    whatsapp: establishment.whatsapp,
    address: establishment.address,
    maps_url: establishment.maps_url,
    sponsored: establishment.sponsored,
    primary_category_id: establishment.primary_category_id,
    keywords: establishment.keywords ?? [],
    active: establishment.active,
    created_at: establishment.created_at,
    updated_at: establishment.updated_at,
  }))
}

export async function fetchEstablishmentHours(): Promise<EstablishmentHour[]> {
  if (!hasSupabaseConfig || !supabase) {
    return mockCatalogData.hours.map(cloneHour)
  }

  const { data, error } = await supabase
    .from('establishment_hours')
    .select('*')
    .order('weekday', { ascending: true })
    .order('interval_index', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((hour) => ({
    id: hour.id,
    establishment_id: hour.establishment_id,
    weekday: hour.weekday,
    interval_index: hour.interval_index,
    open_time: hour.open_time,
    close_time: hour.close_time,
  }))
}

export async function fetchMonthlyAccesses(monthKey: string): Promise<MonthlyAccess[]> {
  if (!hasSupabaseConfig || !supabase) {
    return buildDemoMonthlyAccesses(monthKey)
  }

  const { data, error } = await supabase
    .from('monthly_accesses')
    .select('*')
    .eq('month_key', monthKey)
    .order('access_count', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((monthlyAccess) => ({
    id: monthlyAccess.id,
    establishment_id: monthlyAccess.establishment_id,
    month_key: monthlyAccess.month_key,
    access_count: monthlyAccess.access_count,
    updated_at: monthlyAccess.updated_at,
  }))
}

export async function fetchCatalogData(monthKey = getMonthKey()): Promise<CatalogData> {
  const [categories, establishments, hours, monthlyAccesses] = await Promise.all([
    fetchCategories(),
    fetchEstablishments(),
    fetchEstablishmentHours(),
    fetchMonthlyAccesses(monthKey),
  ])

  return {
    categories,
    establishments,
    hours,
    monthlyAccesses,
  }
}

export async function incrementMonthlyAccess(
  establishmentId: string,
  monthKey = getMonthKey(),
): Promise<number> {
  if (!hasSupabaseConfig || !supabase) {
    const store = readDemoStore(monthKey)
    store[establishmentId] = (store[establishmentId] ?? 0) + 1
    writeDemoStore(monthKey, store)

    return getDemoBaseCount(monthKey, establishmentId) + store[establishmentId]
  }

  const { data, error } = await supabase.rpc('increment_monthly_access', {
    p_establishment_id: establishmentId,
    p_month_key: monthKey,
  })

  if (error) {
    throw error
  }

  return typeof data === 'number' ? data : Number(data ?? 0)
}
