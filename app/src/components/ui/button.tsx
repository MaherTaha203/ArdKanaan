import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-olive px-4 py-3 text-[#f2efe4] hover:bg-olive-ink',
        gold: 'bg-gold px-4 py-3 text-[#2a2008] hover:brightness-95',
        outline:
          'border border-border-strong bg-panel px-4 py-3 text-foreground hover:bg-highlight',
        ghost: 'px-3 py-2 text-muted-foreground hover:bg-highlight hover:text-foreground',
        quiet:
          'border border-border-strong px-3 py-2 text-muted-foreground hover:border-olive hover:text-olive',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 rounded-md px-3 text-[13px]',
        lg: 'h-12 px-5 text-base',
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
