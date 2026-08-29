import { type ReactNode } from 'react'

type RouteHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

export function RouteHeader({ eyebrow, title, description, actions }: RouteHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[12px] font-bold tracking-wide text-olive">{eyebrow}</div>
        <h1 className="editorial mt-1.5 text-[clamp(1.8rem,3vw,2.5rem)] text-foreground">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[62ch] text-[14px] leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
