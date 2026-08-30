import { type ReactNode, type Ref } from 'react'

const EMBLEM_SRC = `${import.meta.env.BASE_URL}brand/emblem.jpg`

type PrintDocumentProps = {
  /** Ref to the printable root — react-to-print prints this node. */
  ref?: Ref<HTMLDivElement>
  /** The document's own title, e.g. "بيان الطالب" or "سند قبض". */
  docTitle: string
  /** Right-side meta lines (date, number, name…). */
  meta?: ReactNode
  children: ReactNode
}

/**
 * The center's A4 print template — a clean, professional letterhead: the emblem
 * and name on one side, the document title and meta on the other, over a single
 * hairline rule. No watermark, no frieze, no marketing footer. Purely
 * presentational; it renders voucher-derived data passed in as children.
 */
export function PrintDocument({ ref, docTitle, meta, children }: PrintDocumentProps) {
  return (
    <div ref={ref} className="print-sheet">
      {/* Letterhead */}
      <header className="flex items-start justify-between gap-6 border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <img
            src={EMBLEM_SRC}
            alt="شعار أرض كنعان"
            className="h-[60px] w-[60px] flex-none rounded-lg object-cover ring-1 ring-[#e7ddcf]"
          />
          <div className="editorial text-[22px] leading-tight text-[#0f172a]">أرض كنعان</div>
        </div>
        <div className="text-end">
          <div className="text-[15px] font-bold text-[#0f172a]">{docTitle}</div>
          {meta ? <div className="mt-1 space-y-0.5 text-[12px] text-[#475569]">{meta}</div> : null}
        </div>
      </header>

      {/* Document body */}
      <main className="mt-6">{children}</main>
    </div>
  )
}
