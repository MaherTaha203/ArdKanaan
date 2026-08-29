// A simplified, single-colour interpretation of the Ard Kanaan emblem — the
// tree of life set within an arch. It renders in `currentColor`, so callers set
// the hue with a text-* utility. Use it wherever the full colour artwork would be
// too busy: small marks, print watermark/footer, empty states. The full emblem
// image (public/brand/emblem.jpg) stays for large, ceremonial surfaces.

type EmblemMarkProps = {
  className?: string
  title?: string
}

export function EmblemMark({ className, title }: EmblemMarkProps) {
  return (
    <svg
      viewBox="0 0 64 74"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      {/* The arch */}
      <path d="M7 68 V30 A25 25 0 0 1 57 30 V68" />
      {/* Ground line */}
      <path d="M14 68 H50" />

      {/* Trunk, splitting toward the canopy */}
      <path d="M32 68 V40 M32 46 C28 42 25 40 22 39 M32 46 C36 42 39 40 42 39" />

      {/* Canopy — a rounded tree of life */}
      <circle cx="32" cy="28" r="15" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 43 C22 43 16 36 16 27 C16 18 23 12 32 12 C41 12 48 18 48 27 C48 36 42 43 32 43 Z" />

      {/* Fruit */}
      <circle cx="25" cy="24" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="39" cy="22" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="33" cy="32" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
