import { describe, expect, it } from 'vitest'

import { amountInWords, amountInWordsArabic, amountInWordsEnglish } from './amount-in-words'

describe('amountInWords', () => {
  it('formats zero consistently in Arabic and English', () => {
    expect(amountInWordsArabic(0)).toBe('صفر شيكل فقط')
    expect(amountInWordsEnglish(0)).toBe('Zero shekels only')
  })

  it('handles whole-shekel values across hundreds and thousands', () => {
    expect(amountInWordsArabic(125)).toBe('مئة و خمسة و عشرون شيكل فقط')
    expect(amountInWordsEnglish(125)).toBe('one hundred twenty-five shekels only')
    expect(amountInWordsArabic(1000)).toBe('ألف شيكل فقط')
    expect(amountInWordsEnglish(1000)).toBe('one thousand shekels only')
    expect(amountInWordsArabic(2500)).toBe('ألفان و خمسمئة شيكل فقط')
    expect(amountInWordsEnglish(2500)).toBe('two thousand five hundred shekels only')
  })

  it('truncates decimal input rather than introducing fractional currency', () => {
    expect(amountInWords(125.99)).toEqual({
      ar: 'مئة و خمسة و عشرون شيكل فقط',
      en: 'one hundred twenty-five shekels only',
    })
  })

  it('does not produce negative amounts', () => {
    expect(amountInWords(-25)).toEqual({
      ar: 'صفر شيكل فقط',
      en: 'Zero shekels only',
    })
  })
})
