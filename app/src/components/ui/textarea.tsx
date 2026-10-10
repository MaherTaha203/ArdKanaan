import { forwardRef, type ChangeEventHandler, type TextareaHTMLAttributes } from 'react'

import { toWesternDigits } from '@/lib/numbers'

import { cn } from '@/lib/utils'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, onChange, ...props },
  ref,
) {
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const normalized = toWesternDigits(event.currentTarget.value)
    if (normalized !== event.currentTarget.value) event.currentTarget.value = normalized
    onChange?.(event)
  }

  return (
    <textarea
      ref={ref}
      onChange={handleChange}
      className={cn(
        // Fixed height with internal scroll (resize-none): a long value never grows
        // the field or pushes the fields above/below out of view. Unified across the app.
        'flex h-24 w-full resize-none overflow-y-auto rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-faint focus:border-olive',
        className,
      )}
      {...props}
    />
  )
})

export { Textarea }
