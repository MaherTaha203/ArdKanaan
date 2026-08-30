// Voucher identifier helpers.
//
// A voucher number is an IDENTIFIER, not an amount. It must render as bare Latin
// digits — never Arabic-Indic digits, never thousands separators, and never a
// letter prefix (no "ق104" / "ص27"). When the type must be shown, it is a
// separate word: "سند قبض — رقم 104".

export type VoucherType = 'receipt' | 'payment'

/** Bare Latin voucher number, e.g. 1040 -> "1040" (no grouping, no prefix). */
export function formatVoucherNo(voucherNumber: number | string): string {
  return String(Math.trunc(Number(voucherNumber)))
}

export function voucherTypeLabel(type: VoucherType): string {
  return type === 'receipt' ? 'سند قبض' : 'سند صرف'
}

/** e.g. "سند قبض — رقم 104". */
export function voucherLabel(type: VoucherType, voucherNumber: number | string): string {
  return `${voucherTypeLabel(type)} — رقم ${formatVoucherNo(voucherNumber)}`
}
