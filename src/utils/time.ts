import type { EstablishmentHour, EstablishmentStatus, Weekday } from '../types/catalog'

const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
}

const STATUS_PRIORITY: Record<EstablishmentStatus, number> = {
  open: 0,
  unavailable: 1,
  closed: 2,
}

export function getCurrentWeekday(now = new Date()): Weekday {
  return now.getDay() as Weekday
}

export function getCurrentTimeString(now = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

function timeStringToMinutes(value: string): number {
  const [hoursText = '0', minutesText = '0'] = value.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  return hours * 60 + minutes
}

export function sortHoursByDayAndInterval(hours: EstablishmentHour[]): EstablishmentHour[] {
  return [...hours].sort((left, right) => {
    if (left.weekday !== right.weekday) {
      return left.weekday - right.weekday
    }

    if (left.interval_index !== right.interval_index) {
      return left.interval_index - right.interval_index
    }

    if (left.open_time !== right.open_time) {
      return left.open_time.localeCompare(right.open_time)
    }

    return left.close_time.localeCompare(right.close_time)
  })
}

export function hasAnyHoursConfigured(hours: EstablishmentHour[]): boolean {
  return hours.length > 0
}

export function getEstablishmentStatus(
  hours: EstablishmentHour[],
  now = new Date(),
): EstablishmentStatus {
  const today = getCurrentWeekday(now)
  const todaysHours = hours.filter((hour) => hour.weekday === today)

  if (todaysHours.length === 0) {
    return 'unavailable'
  }

  const currentMinutes = timeStringToMinutes(getCurrentTimeString(now))

  const isOpenNow = todaysHours.some(({ open_time: openTime, close_time: closeTime }) => {
    const openMinutes = timeStringToMinutes(openTime)
    const closeMinutes = timeStringToMinutes(closeTime)

    if (closeMinutes <= openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes < closeMinutes
    }

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes
  })

  return isOpenNow ? 'open' : 'closed'
}

function getDayRangeLabel(startDay: Weekday, endDay: Weekday): string {
  if (startDay === endDay) {
    return WEEKDAY_LABELS[startDay]
  }

  return `${WEEKDAY_LABELS[startDay]}-${WEEKDAY_LABELS[endDay]}`
}

function formatIntervalList(hours: EstablishmentHour[]): string {
  return hours.map(({ open_time: openTime, close_time: closeTime }) => `${openTime}-${closeTime}`).join(' / ')
}

export function formatHoursForDisplay(hours: EstablishmentHour[]): string {
  if (!hours.length) {
    return 'Não informado'
  }

  const groupedByWeekday = new Map<Weekday, EstablishmentHour[]>()

  for (const hour of sortHoursByDayAndInterval(hours)) {
    const dayHours = groupedByWeekday.get(hour.weekday) ?? []
    dayHours.push(hour)
    groupedByWeekday.set(hour.weekday, dayHours)
  }

  const segments: string[] = []

  let currentStartDay: Weekday | null = null
  let currentEndDay: Weekday | null = null
  let currentSignature: string | null = null

  for (let weekday = 0 as Weekday; weekday <= 6; weekday += 1 as Weekday) {
    const dayHours = groupedByWeekday.get(weekday) ?? []
    const signature = dayHours.length ? formatIntervalList(dayHours) : 'não informado'

    if (currentSignature === null) {
      currentStartDay = weekday
      currentEndDay = weekday
      currentSignature = signature
      continue
    }

    if (signature === currentSignature) {
      currentEndDay = weekday
      continue
    }

    if (currentStartDay !== null && currentEndDay !== null && currentSignature !== null) {
      segments.push(`${getDayRangeLabel(currentStartDay, currentEndDay)} ${currentSignature}`)
    }

    currentStartDay = weekday
    currentEndDay = weekday
    currentSignature = signature
  }

  if (currentStartDay !== null && currentEndDay !== null && currentSignature !== null) {
    segments.push(`${getDayRangeLabel(currentStartDay, currentEndDay)} ${currentSignature}`)
  }

  return segments.join(' · ')
}

export function getStatusPriority(status: EstablishmentStatus): number {
  return STATUS_PRIORITY[status]
}
