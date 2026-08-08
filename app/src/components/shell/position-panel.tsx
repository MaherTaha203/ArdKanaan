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
    <div className="relative overflow-hidden rounded-lg bg-olive px-6 py-6 text-[#f1efe6] sm:px-8 sm:py-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 start-[-10%] h-[90%] w-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(173,126,39,0.28), transparent 62%)',
        }}
      />
      <div className="relative">
        <div className="text-xs tracking-[0.16em] text-[#bcc4b2]">{label}</div>
        <Money
          value={net}
          currencyClassName="text-[#c9d0c0]"
          className="mt-1 block text-[clamp(2.4rem,6vw,3.6rem)] leading-none tracking-tight text-[#f7f4ea]"
        />
        <div className="mt-1 text-[12.5px] text-[#c9d0c0]">{context}</div>

        <div className="mt-6">
          <div className="flex h-3.5 overflow-hidden rounded-sm bg-white/12">
            <div className="h-full bg-gold" style={{ width: `${inPercent}%` }} />
            <div className="h-full" style={{ width: `${outPercent}%`, background: '#c98b64' }} />
          </div>
          <div className="mt-2 flex justify-between text-[12px]">
            <span className="text-[#cfd6c6]">
              وارد <b className="figure text-[#e7c877]">{formatNumber(totalIn)}</b>
            </span>
            <span className="text-[#cfd6c6]">
              صادر <b className="figure text-[#e0b199]">{formatNumber(totalOut)}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
