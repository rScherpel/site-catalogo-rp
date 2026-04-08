import { supabase } from '../lib/supabaseClient'
import type {
  AdminAccessRankingItem,
  AdminCategoryPayload,
  AdminDashboardData,
  AdminEstablishmentFormState,
  AdminEstablishmentHourInput,
  AdminEstablishmentListItem,
  AdminEstablishmentRecord,
  AdminEstablishmentUpsertPayload,
  AdminLookupData,
} from '../types/admin'
import type { Category, Establishment } from '../types/catalog'
import {
  buildCategoryPayload,
  mapHoursFormStateToRows,
  normalizePhone,
  normalizeWhatsapp,
  slugify,
} from '../utils/admin'
import { getMonthKey } from '../utils/access'

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado.')
  }

  return supabase
}

const REQUEST_TIMEOUT_MS = 12000

function withTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => {
        reject(new Error(`${label} demorou demais para responder.`))
      }, REQUEST_TIMEOUT_MS)
    }),
  ])
}

function cloneEstablishment(establishment: Establishment): Establishment {
  return {
    ...establishment,
    keywords: [...establishment.keywords],
  }
}

function mapCategory(category: Category | null): Category | null {
  if (!category) {
    return null
  }

  return {
    id: category.id,
    slug: category.slug,
    label: category.label,
    created_at: category.created_at,
  }
}

function mapEstablishmentListItem(
  establishment: Establishment,
  categoryLabel: string,
): AdminEstablishmentListItem {
  return {
    id: establishment.id,
    name: establishment.name,
    slug: establishment.slug,
    phone: establishment.phone,
    sponsored: establishment.sponsored,
    active: establishment.active,
    primary_category_id: establishment.primary_category_id,
    categoryLabel,
    keywords: [...establishment.keywords],
  }
}

function normalizeListSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function matchesAdminEstablishmentSearch(item: AdminEstablishmentListItem, searchTerm: string): boolean {
  const normalizedSearch = normalizeListSearch(searchTerm)

  if (!normalizedSearch) {
    return true
  }

  const haystack = normalizeListSearch([
    item.id,
    item.name,
    item.slug,
    item.categoryLabel,
    item.keywords.join(' '),
  ].join(' '))

  return haystack.includes(normalizedSearch)
}

export async function fetchAdminLookupData(): Promise<AdminLookupData> {
  const client = ensureSupabaseClient()
  const [categoriesResult, establishmentsResult, hoursResult, monthlyAccessesResult] = await withTimeout(
    Promise.all([
      client.from('categories').select('*').order('label', { ascending: true }),
      client.from('establishments').select('*').order('name', { ascending: true }),
      client.from('establishment_hours').select('*').order('weekday', { ascending: true }).order('interval_index', { ascending: true }),
      client.from('monthly_accesses').select('*').order('updated_at', { ascending: false }),
    ]),
    'Carregamento de dados administrativos',
  )

  if (categoriesResult.error) {
    throw categoriesResult.error
  }

  if (establishmentsResult.error) {
    throw establishmentsResult.error
  }

  if (hoursResult.error) {
    throw hoursResult.error
  }

  if (monthlyAccessesResult.error) {
    throw monthlyAccessesResult.error
  }

  return {
    categories: (categoriesResult.data ?? []).map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.label,
      created_at: category.created_at,
    })),
    establishments: (establishmentsResult.data ?? []).map((establishment) => cloneEstablishment({
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
    })),
    hours: (hoursResult.data ?? []).map((hour) => ({
      id: hour.id,
      establishment_id: hour.establishment_id,
      weekday: hour.weekday,
      interval_index: hour.interval_index,
      open_time: hour.open_time,
      close_time: hour.close_time,
    })),
    monthlyAccesses: (monthlyAccessesResult.data ?? []).map((monthlyAccess) => ({
      id: monthlyAccess.id,
      establishment_id: monthlyAccess.establishment_id,
      month_key: monthlyAccess.month_key,
      access_count: monthlyAccess.access_count,
      updated_at: monthlyAccess.updated_at,
    })),
  }
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const client = ensureSupabaseClient()
  const monthKey = getMonthKey()
  const [lookupData, currentMonthAccessesResult] = await withTimeout(
    Promise.all([
      fetchAdminLookupData(),
      client.from('monthly_accesses').select('*').eq('month_key', monthKey).order('access_count', { ascending: false }),
    ]),
    'Carregamento do dashboard administrativo',
  )

  if (currentMonthAccessesResult.error) {
    throw currentMonthAccessesResult.error
  }

  const categoryMap = new Map(lookupData.categories.map((category) => [category.id, category.label]))
  const establishmentMap = new Map(lookupData.establishments.map((establishment) => [establishment.id, establishment]))

  const topAccesses = (currentMonthAccessesResult.data ?? []).slice(0, 5).map((row) => {
    const establishment = establishmentMap.get(row.establishment_id)

    return {
      monthKey: row.month_key,
      establishmentId: row.establishment_id,
      establishmentName: establishment?.name ?? 'Estabelecimento removido',
      categoryLabel: establishment ? categoryMap.get(establishment.primary_category_id) ?? 'Sem categoria' : 'Sem categoria',
      accessCount: row.access_count,
    } satisfies AdminAccessRankingItem
  })

  return {
    totalEstablishments: lookupData.establishments.length,
    totalActiveEstablishments: lookupData.establishments.filter((item) => item.active).length,
    totalSponsoredEstablishments: lookupData.establishments.filter((item) => item.sponsored).length,
    totalCategories: lookupData.categories.length,
    topAccesses,
    monthKey,
  }
}

export async function fetchAdminEstablishments(searchTerm = ''): Promise<AdminEstablishmentListItem[]> {
  const lookupData = await fetchAdminLookupData()
  const categoryMap = new Map(lookupData.categories.map((category) => [category.id, category.label]))

  return lookupData.establishments
    .map((establishment) => mapEstablishmentListItem(establishment, categoryMap.get(establishment.primary_category_id) ?? 'Sem categoria'))
    .filter((item) => matchesAdminEstablishmentSearch(item, searchTerm))
}

export async function fetchAdminEstablishmentById(id: string): Promise<AdminEstablishmentRecord | null> {
  const lookupData = await fetchAdminLookupData()
  const establishment = lookupData.establishments.find((item) => item.id === id)

  if (!establishment) {
    return null
  }

  return {
    establishment: cloneEstablishment(establishment),
    category: mapCategory(lookupData.categories.find((category) => category.id === establishment.primary_category_id) ?? null),
    hours: lookupData.hours.filter((hour) => hour.establishment_id === id),
  }
}

export async function createEstablishment(payload: AdminEstablishmentUpsertPayload): Promise<Establishment> {
  const client = ensureSupabaseClient()
  const { data, error } = await client
    .from('establishments')
    .insert({
      name: payload.name,
      slug: payload.slug || slugify(payload.name),
      logo_url: payload.logo_url,
      phone: normalizePhone(payload.phone),
      whatsapp: payload.whatsapp ? normalizeWhatsapp(payload.whatsapp) : null,
      address: payload.address,
      maps_url: payload.maps_url,
      sponsored: payload.sponsored,
      primary_category_id: payload.primary_category_id,
      keywords: payload.keywords,
      active: payload.active,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logo_url: data.logo_url,
    phone: data.phone,
    whatsapp: data.whatsapp,
    address: data.address,
    maps_url: data.maps_url,
    sponsored: data.sponsored,
    primary_category_id: data.primary_category_id,
    keywords: data.keywords ?? [],
    active: data.active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function updateEstablishment(
  id: string,
  payload: AdminEstablishmentUpsertPayload,
): Promise<Establishment> {
  const client = ensureSupabaseClient()
  const { data, error } = await client
    .from('establishments')
    .update({
      name: payload.name,
      slug: payload.slug || slugify(payload.name),
      logo_url: payload.logo_url,
      phone: normalizePhone(payload.phone),
      whatsapp: payload.whatsapp ? normalizeWhatsapp(payload.whatsapp) : null,
      address: payload.address,
      maps_url: payload.maps_url,
      sponsored: payload.sponsored,
      active: payload.active,
      primary_category_id: payload.primary_category_id,
      keywords: payload.keywords,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logo_url: data.logo_url,
    phone: data.phone,
    whatsapp: data.whatsapp,
    address: data.address,
    maps_url: data.maps_url,
    sponsored: data.sponsored,
    primary_category_id: data.primary_category_id,
    keywords: data.keywords ?? [],
    active: data.active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function saveEstablishmentHours(
  establishmentId: string,
  hoursPayload: AdminEstablishmentHourInput[] | AdminEstablishmentFormState['hours'],
): Promise<void> {
  const client = ensureSupabaseClient()
  const rows = Array.isArray(hoursPayload) && hoursPayload.length > 0 && 'intervals' in hoursPayload[0]
    ? mapHoursFormStateToRows(hoursPayload as AdminEstablishmentFormState['hours'])
    : (hoursPayload as AdminEstablishmentHourInput[])

  const { error } = await client.rpc('replace_establishment_hours', {
    p_establishment_id: establishmentId,
    p_hours: rows,
  })

  if (error) {
    throw error
  }
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const client = ensureSupabaseClient()
  const { data, error } = await withTimeout(
    client.from('categories').select('*').order('label', { ascending: true }),
    'Carregamento de categorias administrativas',
  )

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

export async function createCategory(payload: AdminCategoryPayload): Promise<Category> {
  const client = ensureSupabaseClient()
  const { data, error } = await client
    .from('categories')
    .insert(buildCategoryPayload({ label: payload.label, slug: payload.slug }))
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    slug: data.slug,
    label: data.label,
    created_at: data.created_at,
  }
}

export async function updateCategory(id: string, payload: AdminCategoryPayload): Promise<Category> {
  const client = ensureSupabaseClient()
  const { data, error } = await client
    .from('categories')
    .update(buildCategoryPayload({ label: payload.label, slug: payload.slug }))
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    slug: data.slug,
    label: data.label,
    created_at: data.created_at,
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const client = ensureSupabaseClient()
  const { count, error: countError } = await client
    .from('establishments')
    .select('id', { count: 'exact', head: true })
    .eq('primary_category_id', id)

  if (countError) {
    throw countError
  }

  if ((count ?? 0) > 0) {
    throw new Error('Essa categoria está em uso por um ou mais estabelecimentos e não pode ser excluída.')
  }

  const { error } = await client.from('categories').delete().eq('id', id)

  if (error) {
    throw error
  }
}

export async function fetchMonthlyAccessRanking(monthKey = getMonthKey()): Promise<AdminAccessRankingItem[]> {
  const lookupData = await fetchAdminLookupData()
  const categoryMap = new Map(lookupData.categories.map((category) => [category.id, category.label]))
  const establishmentMap = new Map(lookupData.establishments.map((establishment) => [establishment.id, establishment]))

  return lookupData.monthlyAccesses
    .filter((monthlyAccess) => monthlyAccess.month_key === monthKey)
    .sort((left, right) => right.access_count - left.access_count)
    .map((row) => {
      const establishment = establishmentMap.get(row.establishment_id)

      return {
        monthKey: row.month_key,
        establishmentId: row.establishment_id,
        establishmentName: establishment?.name ?? 'Estabelecimento removido',
        categoryLabel: establishment ? categoryMap.get(establishment.primary_category_id) ?? 'Sem categoria' : 'Sem categoria',
        accessCount: row.access_count,
      }
    })
}
