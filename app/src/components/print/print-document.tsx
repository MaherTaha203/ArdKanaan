import { type ReactNode, type Ref } from 'react'

import { EmblemMark } from '@/components/brand/emblem-mark'
import { FalconFrieze } from '@/components/brand/falcon-frieze'

const EMBLEM_SRC = `${import.meta.env.BASE_URL}brand/emblem.jpg`
const FRIEZE_INK = '#8a5a3c'

type PrintDocumentProps = {
  /** Ref to the printable root — react-to-print prints this node. */
  ref?: Ref<HTMLDivElement>
  /** The document's own title, e.g. "بيان الطالب" or "التقرير المالي". */
  docTitle: string
  /** Right-side meta lines (date, number, name…). */
  meta?: ReactNode
  children: ReactNode
}

/**
 * The center's branded A4 print template. Full colour emblem in the letterhead,
 * a falcon-and-rosette frieze divider, a faint emblem-mark watermark, and a
 * footer — a single, consistent identity across every printed output. Purely
 * presentational; it renders voucher-derived data passed in as children.
 */
export function PrintDocument({ ref, docTitle, meta, children }: PrintDocumentProps) {
  return (
    <div ref={ref} className="print-sheet">
      {/* Letterhead */}
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={EMBLEM_SRC}
            alt="شعار أرض كنعان"
            className="h-[74px] w-[74px] flex-none rounded-lg object-cover ring-1 ring-[#e7ddcf]"
          />
          <div>
            <div className="editorial text-[22px] leading-tight text-[#0f172a]">أرض كنعان</div>
            <div className="mt-0.5 text-[12px] text-[#64748b]">دفتر المركز المالي</div>
          </div>
        </div>
        <div className="text-end">
          <div className="text-[15px] font-bold text-[#0f172a]">{docTitle}</div>
          {meta ? <div className="mt-1 space-y-0.5 text-[12px] text-[#475569]">{meta}</div> : null}
        </div>
      </header>

      <FalconFrieze color={FRIEZE_INK} height={22} className="mt-4 opacity-90" />

      {/* Faint emblem watermark behind the content */}
      <div aria-hidden className="print-watermark">
        <EmblemMark className="h-[420px] w-[420px] text-[#0f172a]" />
      </div>

      {/* Document body */}
      <main className="relative mt-6">{children}</main>

      {/* Footer */}
      <footer className="mt-auto pt-6">
        <FalconFrieze color={FRIEZE_INK} height={16} className="opacity-70" />
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span className="inline-flex items-center gap-1.5">
            <EmblemMark className="h-4 w-4 text-[#8a5a3c]" />
            أرض كنعان — مستند مطبوع
          </span>
          <span>مركز تدريبيّ واحد · مشغّل واحد</span>
        </div>
      </footer>
    </div>
  )
}
