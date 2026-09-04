import { cn } from '@/lib/utils'

/**
 * A neutral loading placeholder. Presentation only; aria-hidden so assistive
 * tech announces the surrounding "loading" status text, not the shimmer.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded bg-highlight', className)} />
}

/** A stack of row-shaped skeletons for list/table loading states. */
export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-3 py-2" role="status" aria-label="جارٍ التحميل">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className={cn('h-10 w-full', className)} />
      ))}
    </div>
  )
}
