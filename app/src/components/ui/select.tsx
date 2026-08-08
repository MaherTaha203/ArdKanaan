import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})

export { Select }