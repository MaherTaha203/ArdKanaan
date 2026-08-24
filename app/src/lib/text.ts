// Presentation-only text helpers. These never touch financial values — they
// normalize display/search text so Arabic matching ignores diacritics and
// letter-form variants (alef/ya/ta-marbuta), which users rarely type consistently.

const TASHKEEL = /[ً-ٰٟ]/g // harakat + superscript alef
const ALEF_VARIANTS = /[آأإٱ]/g // آ أ إ ٱ → ا
const TATWEEL = /ـ/g // ـ

/** Normalize Arabic text for lenient, diacritic-insensitive search matching. */
export function normalizeArabic(value: string): string {
  return value
    .normalize('NFKD')
    .replace(TASHKEEL, '')
    .replace(TATWEEL, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(/ى/g, 'ي') // ى → ي
    .replace(/ة/g, 'ه') // ة → ه
    .trim()
    .toLowerCase()
}
