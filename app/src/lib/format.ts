// Owner Decision: every numeric value shown to users must always render with Western digits (0-9),
// regardless of the Arabic RTL interface. Route every displayed number/date through these helpers.
const WESTERN_DIGITS_NUMBERING_SYSTEM = 'latn'

export function formatNumber(value: number | string) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '—'
  }

  return new Intl.NumberFormat('ar-EG', {
    numberingSystem: WESTERN_DIGITS_NUMBERING_SYSTEM,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function formatDate(value: string) {
  const parsedDate = new Date(`${value}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ar-EG', {
    numberingSystem: WESTERN_DIGITS_NUMBERING_SYSTEM,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate)
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}