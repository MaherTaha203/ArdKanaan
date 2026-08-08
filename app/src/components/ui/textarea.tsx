import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-md border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-faint focus:border-olive focus:ring-[3px] focus:ring-olive-weak',
        className,
      )}
      {...props}
    />
  )
})

export { Textarea }
