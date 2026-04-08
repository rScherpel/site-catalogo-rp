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
    intervals: createEmptyIntervals(),
  }))
}

function cloneInterval(interval: AdminHoursIntervalFormState): AdminHoursIntervalFormState {
  return {
    openTime: interval.openTime,
    closeTime: interval.closeTime,
  }
}

export function mapHoursRowsToFormState(hours: EstablishmentHour[]): AdminHoursDayFormState[] {
  const grouped = new Map<Weekday, EstablishmentHour[]>()

  for (const hour of hours) {
    const nextHours = grouped.get(hour.weekday) ?? []
    nextHours.push(hour)
    grouped.set(hour.weekday, nextHours)
  }

  return WEEKDAYS.map((weekday) => {
    const dayHours = (grouped.get(weekday) ?? []).sort((left, right) => left.interval_index - right.interval_index)

    return {
      weekday,
      intervals: dayHours.map((hour) => ({
        openTime: hour.open_time,
        closeTime: hour.close_time,
      })),
    }
  })
}

export function mapHoursFormStateToRows(
  hours: AdminHoursDayFormState[],
): AdminEstablishmentHourInput[] {
  return hours.flatMap((day) =>
    day.intervals
      .map((interval, intervalIndex) => ({
        weekday: day.weekday,
        interval_index: (intervalIndex + 1) as 1 | 2,
        open_time: interval.openTime,
        close_time: interval.closeTime,
      }))
      .filter((interval) => interval.open_time.trim() && interval.close_time.trim()),
  )
}

export function addFirstInterval(hours: AdminHoursDayFormState[], weekday: Weekday): AdminHoursDayFormState[] {
  return hours.map((day) => {
    if (day.weekday !== weekday) {
      return day
    }

    return {
      ...day,
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
    address: establishment?.address ?? '',
    maps_url: establishment?.maps_url ?? '',
    sponsored: establishment?.sponsored ?? false,
    active: establishment?.active ?? true,
    primary_category_id: establishment?.primary_category_id ?? '',
    keywordsInput: establishment ? serializeKeywordsInput(establishment.keywords) : '',
    hours: mapHoursRowsToFormState(hours),
  }
}

export function createEmptyEstablishmentFormState(): AdminEstablishmentFormState {
  return mapEstablishmentToFormState(null, [])
}

export function buildEstablishmentPayload(
  values: AdminEstablishmentFormState,
): AdminEstablishmentUpsertPayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || slugify(values.name),
    logo_url: values.logo_url.trim() || null,
    phone: normalizePhone(values.phone),
    whatsapp: values.whatsapp.trim() ? normalizeWhatsapp(values.whatsapp) : null,
    address: values.address.trim(),
    maps_url: values.maps_url.trim() || null,
    sponsored: values.sponsored,
    active: values.active,
    primary_category_id: values.primary_category_id,
    keywords: parseKeywordsInput(values.keywordsInput),
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
    intervals: day.intervals.map(cloneInterval),
  }))
}
