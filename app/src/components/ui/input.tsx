import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/80 focus:border-accent focus:ring-4 focus:ring-accent/10',
        className,
      )}
      {...props}
    />
  )
})

export { Input }