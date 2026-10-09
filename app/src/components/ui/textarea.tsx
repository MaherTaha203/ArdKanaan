import { forwardRef, type ChangeEventHandler, type TextareaHTMLAttributes } from 'react'

import { toWesternDigits } from '@/lib/numbers'

import { cn } from '@/lib/utils'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, onChange, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      onChange={((event) => {
        const normalized = toWesternDigits(event.currentTarget.value)
        if (normalized !== event.currentTarget.value) event.currentTarget.value = normalized
        onChange?.(event)
      }) as ChangeEventHandler<HTMLTextAreaElement>}
      className={cn(
        'flex min-h-24 w-full rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-faint focus:border-olive',
        className,
      )}
      {...props}
    />
  )
})

export { Textarea }
