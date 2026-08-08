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
        <div className="text-[11.5px] tracking-[0.2em] text-faint">{eyebrow}</div>
        <h1 className="editorial mt-1 text-[clamp(1.7rem,3vw,2.3rem)] text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
