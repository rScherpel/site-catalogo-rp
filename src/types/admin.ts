import type { Session, User } from '@supabase/supabase-js'
import type { Category, Establishment, EstablishmentHour, MonthlyAccess, Weekday } from './catalog'

export type AdminRole = 'admin'

export interface AdminProfile {
  id: string
  email: string
  role: AdminRole
  created_at: string
}

export interface AdminAuthState {
  session: Session | null
  user: User | null
  profile: AdminProfile | null
  loading: boolean
}

export interface AdminAuthContextValue extends AdminAuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
  error: string | null
}

export interface AdminDashboardMetrics {
  totalEstablishments: number
  totalActiveEstablishments: number
  totalSponsoredEstablishments: number
  totalCategories: number
}

export interface AdminAccessRankingItem {
  monthKey: string
  establishmentId: string
  establishmentName: string
  categoryLabel: string
  accessCount: number
}

export interface AdminDashboardData extends AdminDashboardMetrics {
  topAccesses: AdminAccessRankingItem[]
  monthKey: string
}

export interface AdminEstablishmentListItem {
  id: string
  name: string
  slug: string
  phone: string
  sponsored: boolean
  active: boolean
  primary_category_id: string
  categoryLabel: string
  keywords: string[]
}

export interface AdminEstablishmentRecord {
  establishment: Establishment
  category: Category | null
  hours: EstablishmentHour[]
}

export interface AdminEstablishmentHourInput {
  weekday: Weekday
  interval_index: 1 | 2
  open_time: string
  close_time: string
}

export interface AdminHoursIntervalFormState {
  openTime: string
  closeTime: string
}

export interface AdminHoursDayFormState {
  weekday: Weekday
  closed: boolean
  intervals: AdminHoursIntervalFormState[]
}

export interface AdminEstablishmentFormState {
  name: string
  slug: string
  logo_url: string
  phone: string
  whatsapp: string
  address: string
  maps_url: string
  sponsored: boolean
  active: boolean
  primary_category_id: string
  keywordsInput: string
  hours: AdminHoursDayFormState[]
}

export interface AdminCategoryFormState {
  label: string
  slug: string
}

export interface AdminEstablishmentUpsertPayload {
  name: string
  slug: string
  logo_url: string | null
  phone: string
  whatsapp: string | null
  address: string
  maps_url: string | null
  sponsored: boolean
  active: boolean
  primary_category_id: string
  keywords: string[]
  closed_weekdays: Weekday[]
}

export interface AdminCategoryPayload {
  label: string
  slug: string
}

export interface AdminSummaryCardItem {
  label: string
  value: string | number
  tone?: 'brand' | 'accent' | 'success' | 'warning'
}

export interface AdminLookupData {
  categories: Category[]
  establishments: Establishment[]
  hours: EstablishmentHour[]
  monthlyAccesses: MonthlyAccess[]
}
