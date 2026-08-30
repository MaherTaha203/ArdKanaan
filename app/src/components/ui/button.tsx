import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        // Primary — the confident blue pill.
        default: 'bg-olive px-5 py-2.5 text-sm text-white shadow-sm hover:bg-olive-ink',
        // Money-in — emerald pill.
        gold: 'bg-gold px-5 py-2.5 text-sm text-white shadow-sm hover:brightness-95',
        // Destructive — clay/red pill (cancel, remove).
        destructive: 'bg-clay px-5 py-2.5 text-sm text-white shadow-sm hover:brightness-95',
        // Neutral filled — near-black pill (strong secondary).
        outline:
          'border border-border bg-panel px-5 py-2.5 text-sm text-foreground shadow-sm hover:bg-highlight',
        ghost: 'px-3.5 py-2 text-sm text-muted-foreground hover:bg-highlight hover:text-foreground',
        quiet:
          'border border-border-strong bg-panel px-4 py-2 text-sm text-muted-foreground hover:border-olive hover:text-olive',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size, variant, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})
