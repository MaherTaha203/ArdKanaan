import { describe, expect, it } from 'vitest'

import { amountInWords, amountInWordsArabic, amountInWordsEnglish } from './amount-in-words'

describe('amountInWords', () => {
  it('formats zero consistently in Arabic and English', () => {
    expect(amountInWordsArabic(0)).toBe('صفر شيكل فقط لا غير')
    expect(amountInWordsEnglish(0)).toBe('Zero shekels only')
  })

  it('applies Arabic tamyiz to the shekel noun by number class', () => {
    // 1 and 2 read the noun before the number.
    expect(amountInWordsArabic(1)).toBe('شيكل واحد فقط لا غير')
    expect(amountInWordsArabic(2)).toBe('شيكلان فقط لا غير')
    // 3–10 → plural.
    expect(amountInWordsArabic(5)).toBe('خمسة شيكلات فقط لا غير')
    // 11–99 → accusative singular.
    expect(amountInWordsArabic(11)).toBe('أحد عشر شيكلًا فقط لا غير')
    expect(amountInWordsArabic(25)).toBe('خمسة وعشرون شيكلًا فقط لا غير')
    // A hundred/thousand tail → genitive singular.
    expect(amountInWordsArabic(100)).toBe('مئة شيكل فقط لا غير')
  })

  it('handles whole-shekel values across hundreds and thousands', () => {
    expect(amountInWordsArabic(125)).toBe('مئة وخمسة وعشرون شيكلًا فقط لا غير')
    expect(amountInWordsEnglish(125)).toBe('one hundred twenty-five shekels only')
    expect(amountInWordsArabic(1000)).toBe('ألف شيكل فقط لا غير')
    expect(amountInWordsEnglish(1000)).toBe('one thousand shekels only')
    expect(amountInWordsArabic(2500)).toBe('ألفان وخمسمئة شيكل فقط لا غير')
    expect(amountInWordsEnglish(2500)).toBe('two thousand five hundred shekels only')
  })

  it('uses the singular in English for exactly one shekel', () => {
    expect(amountInWordsEnglish(1)).toBe('one shekel only')
  })

  it('truncates decimal input rather than introducing fractional currency', () => {
    expect(amountInWords(125.99)).toEqual({
      ar: 'مئة وخمسة وعشرون شيكلًا فقط لا غير',
      en: 'one hundred twenty-five shekels only',
    })
  })

  it('does not produce negative amounts', () => {
    expect(amountInWords(-25)).toEqual({
      ar: 'صفر شيكل فقط لا غير',
      en: 'Zero shekels only',
    })
  })
})
