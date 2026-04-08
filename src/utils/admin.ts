import type {
  AdminCategoryFormState,
  AdminCategoryPayload,
  AdminEstablishmentFormState,
  AdminEstablishmentHourInput,
  AdminEstablishmentUpsertPayload,
  AdminHoursDayFormState,
  AdminHoursIntervalFormState,
} from '../types/admin'
import type { Establishment, EstablishmentHour, Weekday } from '../types/catalog'

const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizePhone(value: string): string {
  return value.replace(/\D+/g, '')
}

export function normalizeWhatsapp(value: string): string {
  return normalizePhone(value)
}

export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed.replace(/^\/+/, '')}`
}

export function normalizeImageUrl(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)\//i)
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`
  }

  const driveOpenMatch = trimmed.match(/[?&]id=([^&]+)/i)
  if (trimmed.includes('drive.google.com') && driveOpenMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`
  }

  return trimmed
}

export function parseKeywordsInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,\n;]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

export function serializeKeywordsInput(keywords: string[]): string {
  return keywords.join(', ')
}

function createEmptyIntervals(): AdminHoursIntervalFormState[] {
  return []
}

export function createEmptyHoursFormState(): AdminHoursDayFormState[] {
  return WEEKDAYS.map((weekday) => ({
    weekday,
    closed: false,
    intervals: createEmptyIntervals(),
  }))
}

function cloneInterval(interval: AdminHoursIntervalFormState): AdminHoursIntervalFormState {
  return {
    openTime: interval.openTime,
    closeTime: interval.closeTime,
  }
}

export function mapHoursRowsToFormState(
  hours: EstablishmentHour[],
  closedWeekdays: Weekday[] = [],
): AdminHoursDayFormState[] {
  const grouped = new Map<Weekday, EstablishmentHour[]>()
  const closedWeekdaySet = new Set(closedWeekdays)

  for (const hour of hours) {
    const nextHours = grouped.get(hour.weekday) ?? []
    nextHours.push(hour)
    grouped.set(hour.weekday, nextHours)
  }

  return WEEKDAYS.map((weekday) => {
    const dayHours = (grouped.get(weekday) ?? []).sort((left, right) => left.interval_index - right.interval_index)

    return {
      weekday,
      closed: closedWeekdaySet.has(weekday),
      intervals: closedWeekdaySet.has(weekday)
        ? []
        : dayHours.map((hour) => ({
            openTime: hour.open_time,
            closeTime: hour.close_time,
          })),
    }
  })
}

export function mapHoursFormStateToRows(
  hours: AdminHoursDayFormState[],
): AdminEstablishmentHourInput[] {
  return hours.flatMap((day) => {
    if (day.closed) {
      return []
    }

    return day.intervals
      .map((interval, intervalIndex) => ({
        weekday: day.weekday,
        interval_index: (intervalIndex + 1) as 1 | 2,
        open_time: interval.openTime,
        close_time: interval.closeTime,
      }))
      .filter((interval) => interval.open_time.trim() && interval.close_time.trim())
  })
}

export function setDayClosedState(
  hours: AdminHoursDayFormState[],
  weekday: Weekday,
  closed: boolean,
): AdminHoursDayFormState[] {
  return hours.map((day) => {
    if (day.weekday !== weekday) {
      return day
    }

    return {
      ...day,
      closed,
    }
  })
}

export function addFirstInterval(hours: AdminHoursDayFormState[], weekday: Weekday): AdminHoursDayFormState[] {
  return hours.map((day) => {
    if (day.weekday !== weekday) {
      return day
    }

    return {
      ...day,
      closed: false,
      intervals: [{ openTime: '', closeTime: '' }],
    }
  })
}

export function addSecondInterval(hours: AdminHoursDayFormState[], weekday: Weekday): AdminHoursDayFormState[] {
  return hours.map((day) => {
    if (day.weekday !== weekday) {
      return day
    }

    const intervals = [...day.intervals]

    if (intervals.length >= 2) {
      return day
    }

    intervals.push({ openTime: '', closeTime: '' })

    return {
      ...day,
      closed: false,
      intervals,
    }
  })
}

export function removeInterval(
  hours: AdminHoursDayFormState[],
  weekday: Weekday,
  intervalIndex: number,
): AdminHoursDayFormState[] {
  return hours.map((day) => {
    if (day.weekday !== weekday) {
      return day
    }

    return {
      ...day,
      intervals: day.intervals.filter((_, currentIndex) => currentIndex !== intervalIndex),
    }
  })
}

export function updateIntervalField(
  hours: AdminHoursDayFormState[],
  weekday: Weekday,
  intervalIndex: number,
  field: 'openTime' | 'closeTime',
  value: string,
): AdminHoursDayFormState[] {
  return hours.map((day) => {
    if (day.weekday !== weekday) {
      return day
    }

    return {
      ...day,
      closed: false,
      intervals: day.intervals.map((interval, currentIndex) =>
        currentIndex === intervalIndex ? { ...interval, [field]: value } : interval,
      ),
    }
  })
}

export function mapEstablishmentToFormState(
  establishment: Establishment | null,
  hours: EstablishmentHour[],
): AdminEstablishmentFormState {
  return {
    name: establishment?.name ?? '',
    slug: establishment?.slug ?? '',
    logo_url: establishment?.logo_url ?? '',
    phone: establishment?.phone ?? '',
    whatsapp: establishment?.whatsapp ?? '',
    instagram_url: establishment?.instagram_url ?? '',
    address: establishment?.virtual_store ? '' : establishment?.address ?? '',
    maps_url: establishment?.maps_url ?? '',
    virtual_store: establishment?.virtual_store ?? false,
    sponsored: establishment?.sponsored ?? false,
    active: establishment?.active ?? true,
    primary_category_id: establishment?.primary_category_id ?? '',
    keywordsInput: establishment ? serializeKeywordsInput(establishment.keywords) : '',
    hours: mapHoursRowsToFormState(hours, establishment?.closed_weekdays ?? []),
  }
}

export function createEmptyEstablishmentFormState(): AdminEstablishmentFormState {
  return mapEstablishmentToFormState(null, [])
}

export function buildEstablishmentPayload(
  values: AdminEstablishmentFormState,
): AdminEstablishmentUpsertPayload {
  const closedWeekdays = values.hours
    .filter((day) => day.closed)
    .map((day) => day.weekday)

  return {
    name: values.name.trim(),
    slug: values.slug.trim() || slugify(values.name),
    logo_url: values.logo_url.trim() ? normalizeImageUrl(values.logo_url) : null,
    phone: normalizePhone(values.phone),
    whatsapp: values.whatsapp.trim() ? normalizeWhatsapp(values.whatsapp) : null,
    instagram_url: values.instagram_url.trim() ? normalizeExternalUrl(values.instagram_url) : null,
    address: values.virtual_store ? 'Loja virtual' : values.address.trim(),
    maps_url: values.virtual_store ? null : values.maps_url.trim() || null,
    virtual_store: values.virtual_store,
    sponsored: values.sponsored,
    active: values.active,
    primary_category_id: values.primary_category_id,
    keywords: parseKeywordsInput(values.keywordsInput),
    closed_weekdays: closedWeekdays,
  }
}

export function buildCategoryPayload(values: AdminCategoryFormState): AdminCategoryPayload {
  return {
    label: values.label.trim(),
    slug: values.slug.trim() || slugify(values.label),
  }
}

export function createEmptyCategoryFormState(): AdminCategoryFormState {
  return {
    label: '',
    slug: '',
  }
}

export function mapCategoryToFormState(category: { label: string; slug: string } | null): AdminCategoryFormState {
  return {
    label: category?.label ?? '',
    slug: category?.slug ?? '',
  }
}

export function cloneHoursState(hours: AdminHoursDayFormState[]): AdminHoursDayFormState[] {
  return hours.map((day) => ({
    weekday: day.weekday,
    closed: day.closed,
    intervals: day.intervals.map(cloneInterval),
  }))
}
