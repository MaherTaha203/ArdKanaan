import { forwardRef, type ChangeEventHandler, type InputHTMLAttributes } from 'react'

import { toWesternDigits } from '@/lib/numbers'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, inputMode, dir, pattern, onChange, ...props },
  ref,
) {
  const numericInput = type === 'number' || inputMode === 'numeric' || inputMode === 'decimal' || inputMode === 'tel'
  const handleChange: ChangeEventHandler<HTMLInputElement> | undefined = type !== 'password' && type !== 'file'
    ? (event) => {
        const westernDigits = toWesternDigits(event.currentTarget.value)
        const normalized = type === 'number' ? westernDigits.replace(/[^0-9]/g, '') : westernDigits
        if (normalized !== event.currentTarget.value) event.currentTarget.value = normalized
        onChange?.(event)
      }
    : onChange

  return (
    <input
      ref={ref}
      type={type === 'number' ? 'text' : type}
      inputMode={numericInput ? (inputMode ?? 'numeric') : inputMode}
      dir={dir ?? (numericInput ? 'ltr' : undefined)}
      pattern={type === 'number' ? '[0-9]*' : pattern}
      onChange={handleChange}
      className={cn(
        'flex h-11 w-full rounded-xl border border-border-strong bg-panel px-3.5 py-2 text-sm text-foreground outline-none placeholder:text-faint focus:border-olive',
        className,
      )}
      {...props}
    />
  )
})

export { Input }
