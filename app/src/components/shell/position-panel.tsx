import { Money } from '@/components/ui/money'
import { formatNumber } from '@/lib/format'

type PositionPanelProps = {
  net: number
  totalIn: number
  totalOut: number
  label: string
  context: string
}

/**
 * The center's financial position — the single most prominent figure in the product.
 * Net is derived (in − out); the relationship bar shows the proportion of incoming to
 * outgoing movement. Nothing here is stored; it is recomputed from voucher-derived rows.
 */
export function PositionPanel({ net, totalIn, totalOut, label, context }: PositionPanelProps) {
  const total = totalIn + totalOut
  const inPercent = total > 0 ? (totalIn / total) * 100 : 0
  const outPercent = total > 0 ? (totalOut / total) * 100 : 0

  return (
    <div className="rounded-2xl border border-border bg-panel px-6 py-6 shadow-card sm:px-8 sm:py-7">
      <div className="text-[12px] font-bold tracking-wide text-olive">{label}</div>
      <Money
        value={net}
        currencyClassName="text-faint"
        className="mt-2 block text-[clamp(2.4rem,6vw,3.6rem)] font-semibold leading-none tracking-tight text-foreground"
      />
      <div className="mt-2 text-[13px] text-muted-foreground">{context}</div>

      <div className="mt-6">
        <div className="flex h-3 overflow-hidden rounded-full bg-highlight">
          <div className="h-full bg-gold" style={{ width: `${inPercent}%` }} />
          <div className="h-full bg-clay" style={{ width: `${outPercent}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-[13px]">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-gold" aria-hidden />
            وارد <b className="figure font-semibold text-gold">{formatNumber(totalIn)}</b>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-clay" aria-hidden />
            صادر <b className="figure font-semibold text-clay">{formatNumber(totalOut)}</b>
          </span>
        </div>
      </div>
    </div>
  )
}
