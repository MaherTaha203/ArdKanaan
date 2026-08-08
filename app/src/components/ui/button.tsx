import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
  {
    variants: {
      variant: {
        default: 'bg-accent px-4 py-3 text-white hover:bg-accent/90',
        outline:
          'border border-border bg-panel px-4 py-3 text-foreground hover:bg-highlight',
        ghost: 'px-3 py-2 text-muted-foreground hover:bg-highlight hover:text-foreground',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 rounded-xl px-3',
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