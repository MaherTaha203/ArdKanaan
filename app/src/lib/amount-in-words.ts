const ONES_AR = [
  'صفر',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
]

const TENS_AR = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']

const SCALES_AR: { singular: string; dual: string; plural: string }[] = [
  { singular: '', dual: '', plural: '' },
  { singular: 'ألف', dual: 'ألفان', plural: 'آلاف' },
  { singular: 'مليون', dual: 'مليونان', plural: 'ملايين' },
]

const ONES_EN = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

const SCALES_EN = ['', 'thousand', 'million']

function requiredAt<T>(values: readonly T[], index: number, label: string): T {
  const value = values[index]
  if (value === undefined) {
    throw new RangeError(`${label} index ${index} is out of range`)
  }
  return value
}

function underThousandAr(value: number): string {
  if (value < 20) return requiredAt(ONES_AR, value, 'Arabic ones')

  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const hundredsWords = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة']
  const parts: string[] = []

  if (hundreds) parts.push(requiredAt(hundredsWords, hundreds, 'Arabic hundreds'))
  if (remainder) {
    if (remainder < 20) parts.push(requiredAt(ONES_AR, remainder, 'Arabic ones'))
    else if (remainder % 10 === 0) parts.push(requiredAt(TENS_AR, remainder / 10, 'Arabic tens'))
    else parts.push(`${requiredAt(ONES_AR, remainder % 10, 'Arabic ones')} و${requiredAt(TENS_AR, Math.floor(remainder / 10), 'Arabic tens')}`)
  }

  return parts.join(' و')
}

function underThousandEn(value: number): string {
  if (value < 20) return requiredAt(ONES_EN, value, 'English ones')

  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const parts: string[] = []

  if (hundreds) parts.push(`${requiredAt(ONES_EN, hundreds, 'English ones')} hundred`)
  if (remainder) {
    if (remainder < 20) parts.push(requiredAt(ONES_EN, remainder, 'English ones'))
    else {
      const tens = requiredAt(TENS_EN, Math.floor(remainder / 10), 'English tens')
      if (remainder % 10) {
        parts.push(`${tens}-${requiredAt(ONES_EN, remainder % 10, 'English ones')}`)
      } else {
        parts.push(tens)
      }
    }
  }

  return parts.join(' ')
}

// A voucher's amount is sealed with this idiom ("only, no more") so nothing can be
// appended after the figure in words.
const AR_CLOSING = 'فقط لا غير'

// The currency noun after a number follows Arabic tamyiz (specifier) rules, driven
// by the last two digits of the amount:
//   • 3–10  → plural           ("خمسة شيكلات")
//   • 11–99 → accusative singular ("خمسة وعشرون شيكلًا")
//   • a hundred/thousand tail (…00) → genitive singular ("مئة شيكل")
// The pure values 1 and 2 read the noun before the number and are handled by the caller.
function shekelNoun(value: number): string {
  const lastTwo = value % 100
  if (lastTwo >= 3 && lastTwo <= 10) return 'شيكلات'
  if (lastTwo >= 11 && lastTwo <= 99) return 'شيكلًا'
  return 'شيكل'
}

export function amountInWordsArabic(amount: number): string {
  const value = Math.max(0, Math.trunc(amount))
  if (value === 0) return `صفر شيكل ${AR_CLOSING}`
  if (value === 1) return `شيكل واحد ${AR_CLOSING}`
  if (value === 2) return `شيكلان ${AR_CLOSING}`

  const groups: string[] = []
  let remaining = value
  let scale = 0

  while (remaining > 0) {
    const group = remaining % 1000
    if (group) {
      const words = underThousandAr(group)
      const scaleInfo = requiredAt(SCALES_AR, scale, 'Arabic scale')
      if (scale === 0) groups.unshift(words)
      else if (group === 1) groups.unshift(scaleInfo.singular)
      else if (group === 2) groups.unshift(scaleInfo.dual)
      else if (group >= 3 && group <= 10) groups.unshift(`${words} ${scaleInfo.plural}`)
      else groups.unshift(`${words} ${scaleInfo.singular}`)
    }
    remaining = Math.floor(remaining / 1000)
    scale += 1
  }

  return `${groups.join(' و')} ${shekelNoun(value)} ${AR_CLOSING}`
}

export function amountInWordsEnglish(amount: number): string {
  const value = Math.max(0, Math.trunc(amount))
  if (value === 0) return 'Zero shekels only'
  if (value === 1) return 'one shekel only'

  const groups: string[] = []
  let remaining = value
  let scale = 0

  while (remaining > 0) {
    const group = remaining % 1000
    if (group) {
      const words = underThousandEn(group)
      if (scale === 0) groups.unshift(words)
      else groups.unshift(`${words} ${requiredAt(SCALES_EN, scale, 'English scale')}`)
    }
    remaining = Math.floor(remaining / 1000)
    scale += 1
  }

  return `${groups.join(' ')} shekels only`
}

export function amountInWords(amount: number): { ar: string; en: string } {
  return {
    ar: amountInWordsArabic(amount),
    en: amountInWordsEnglish(amount),
  }
}
