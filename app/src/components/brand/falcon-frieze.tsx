// A decorative band echoing the emblem's top course — a stylized falcon and
// rosette, repeated horizontally. Rendered as a tiled inline-SVG background so it
// fills any width crisply and scales to the given height. Purely ornamental
// (aria-hidden). Colour is passed explicitly since it lives inside a data URI.

type FalconFriezeProps = {
  className?: string
  color?: string
  height?: number
}

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export function FalconFrieze({ className, color = '#a8823c', height = 24 }: FalconFriezeProps) {
  const petals = PETAL_ANGLES.map(
    (a) => `<ellipse cx='37' cy='8.5' rx='1.4' ry='3' transform='rotate(${a} 37 13)'/>`,
  ).join('')

  const tile =
    `<svg xmlns='http://www.w3.org/2000/svg' width='46' height='26' viewBox='0 0 46 26'>` +
    `<g fill='${color}'>` +
    // falcon
    `<ellipse cx='15' cy='13' rx='8.5' ry='5.5'/>` +
    `<circle cx='22' cy='9' r='3'/>` +
    `<path d='M24.5 8 L28 9.2 L24.5 10.6 Z'/>` +
    `<path d='M7.5 14 L2.5 21 L9 18.5 Z'/>` +
    `<rect x='12.4' y='18' width='1.3' height='5'/>` +
    `<rect x='16.4' y='18' width='1.3' height='5'/>` +
    // rosette
    petals +
    `<circle cx='37' cy='13' r='1.7'/>` +
    // ledge
    `<rect x='0' y='24.2' width='46' height='0.9'/>` +
    `</g></svg>`

  const uri = `url("data:image/svg+xml,${encodeURIComponent(tile)}")`

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={className}
      style={{
        height,
        backgroundImage: uri,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
        backgroundSize: `auto ${height}px`,
      }}
    />
  )
}
