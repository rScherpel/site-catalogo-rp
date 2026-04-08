import { supabase, hasSupabaseConfig } from '../lib/supabaseClient'
import type { Category, CatalogData, Establishment, EstablishmentHour, MonthlyAccess } from '../types/catalog'
import { getMonthKey } from '../utils/access'

const REQUEST_TIMEOUT_MS = 12000

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => {
        reject(new Error(`${label} demorou demais para responder.`))
      }, REQUEST_TIMEOUT_MS)
    }),
  ])
}

export async function fetchCategories(): Promise<Category[]> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await withTimeout(
    supabase.from('categories').select('*').order('label', { ascending: true }),
    'Carregamento de categorias',
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

export async function fetchEstablishments(): Promise<Establishment[]> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await withTimeout(
    supabase
      .from('establishments')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true }),
    'Carregamento de estabelecimentos',
  )

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
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await withTimeout(
    supabase
      .from('establishment_hours')
      .select('*')
      .order('weekday', { ascending: true })
      .order('interval_index', { ascending: true }),
    'Carregamento de horários',
  )

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
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await withTimeout(
    supabase
      .from('monthly_accesses')
      .select('*')
      .eq('month_key', monthKey)
      .order('access_count', { ascending: false }),
    'Carregamento de acessos mensais',
  )

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
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await withTimeout(
    supabase.rpc('increment_monthly_access', {
      p_establishment_id: establishmentId,
      p_month_key: monthKey,
    }),
    'Registro de acesso mensal',
  )

  if (error) {
    throw error
  }

  return typeof data === 'number' ? data : Number(data ?? 0)
}
