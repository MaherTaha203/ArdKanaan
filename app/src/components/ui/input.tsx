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
        'flex h-11 w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-faint focus:border-olive focus:ring-[3px] focus:ring-olive-weak',
        className,
      )}
      {...props}
    />
  )
})

export { Input }
