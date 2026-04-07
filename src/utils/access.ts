export function getMonthKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

export function shiftMonthKey(monthKey: string, offsetMonths: number): string {
  const [yearText, monthText] = monthKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText)

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return monthKey
  }

  const shifted = new Date(year, month - 1 + offsetMonths, 1)

  return getMonthKey(shifted)
}

export function getPreviousMonthKey(date = new Date()): string {
  return shiftMonthKey(getMonthKey(date), -1)
}

export function getMonthLabel(monthKey: string): string {
  const [yearText, monthText] = monthKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText)

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return monthKey
  }

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}
