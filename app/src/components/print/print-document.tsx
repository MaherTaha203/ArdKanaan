import { type ReactNode, type Ref } from 'react'

import { getCenterSettings } from '@/lib/center-settings'

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
 * The center's A4 print template — a clean, professional letterhead.
 * Center identity is presentation-only configuration; financial values are passed in.
 */
export function PrintDocument({ ref, docTitle, meta, children }: PrintDocumentProps) {
  const center = getCenterSettings()

  return (
    <div ref={ref} className="print-sheet">
      <header className="flex items-start justify-between gap-6 border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <img
            src={EMBLEM_SRC}
            alt={`شعار ${center.name}`}
            className="h-[60px] w-[60px] flex-none rounded-lg object-cover ring-1 ring-[#e7ddcf]"
          />
          <div className="min-w-0">
            <div className="editorial text-[22px] leading-tight text-[#0f172a]">{center.name}</div>
            {center.responsibleName ? (
              <div className="mt-1 text-[11px] text-[#475569]">{center.responsibleName}</div>
            ) : null}
            {center.phone || center.address ? (
              <div className="mt-0.5 text-[10px] text-[#64748b]">
                {[center.phone, center.address].filter(Boolean).join(' · ')}
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-end">
          <div className="text-[15px] font-bold text-[#0f172a]">{docTitle}</div>
          {meta ? <div className="mt-1 space-y-0.5 text-[12px] text-[#475569]">{meta}</div> : null}
        </div>
      </header>

      <main className="mt-6">{children}</main>
    </div>
  )
}
