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

function underThousandAr(value: number): string {
  if (value < 20) return ONES_AR[value]

  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const hundredsWords = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة']
  const parts: string[] = []

  if (hundreds) parts.push(hundredsWords[hundreds])
  if (remainder) {
    if (remainder < 20) parts.push(ONES_AR[remainder])
    else if (remainder % 10 === 0) parts.push(TENS_AR[remainder / 10])
    else parts.push(`${ONES_AR[remainder % 10]} و${TENS_AR[Math.floor(remainder / 10)]}`)
  }

  return parts.join(' و')
}

function underThousandEn(value: number): string {
  if (value < 20) return ONES_EN[value]

  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const parts: string[] = []

  if (hundreds) parts.push(`${ONES_EN[hundreds]} hundred`)
  if (remainder) {
    if (remainder < 20) parts.push(ONES_EN[remainder])
    else parts.push(remainder % 10 ? `${TENS_EN[Math.floor(remainder / 10)]}-${ONES_EN[remainder % 10]}` : TENS_EN[remainder / 10])
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
      if (scale === 0) groups.unshift(words)
      else if (group === 1) groups.unshift(SCALES_AR[scale].singular)
      else if (group === 2) groups.unshift(SCALES_AR[scale].dual)
      else if (group >= 3 && group <= 10) groups.unshift(`${words} ${SCALES_AR[scale].plural}`)
      else groups.unshift(`${words} ${SCALES_AR[scale].singular}`)
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
      groups.unshift(scale ? `${words} ${SCALES_EN[scale]}` : words)
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
