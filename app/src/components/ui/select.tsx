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
        'flex h-11 w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-olive focus:ring-[3px] focus:ring-olive-weak',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})

export { Select }
