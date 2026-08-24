// Presentation-only text helpers. These never touch financial values — they
// normalize display/search text so Arabic matching ignores diacritics and
// letter-form variants (alef/ya/ta-marbuta), which users rarely type consistently.

// Harakat/annotation marks (U+064B–U+065F) plus superscript alef (U+0670). Written
// with explicit escapes and split into two disjoint pieces on purpose: a single
// U+064B–U+0670 range would also swallow Arabic-Indic digits (U+0660–U+0669) and
// punctuation, silently corrupting name search.
const TASHKEEL = /[\u064B-\u065F\u0670]/g
const ALEF_VARIANTS = /[آأإٱ]/g // آ أ إ ٱ → ا (U+0627)
const ALEF_MAKSURA = /ى/g // ى → ي (U+064A)
const TA_MARBUTA = /ة/g // ة → ه (U+0647)
const TATWEEL = /ـ/g // ـ (kashida)

/** Normalize Arabic text for lenient, diacritic-insensitive search matching. */
export function normalizeArabic(value: string): string {
  return value
    .normalize('NFKD')
    .replace(TASHKEEL, '')
    .replace(TATWEEL, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(ALEF_MAKSURA, 'ي')
    .replace(TA_MARBUTA, 'ه')
    .trim()
    .toLowerCase()
}
