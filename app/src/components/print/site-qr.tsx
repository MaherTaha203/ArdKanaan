const SITE_URL = 'https://canaanites-land.com/'

/**
 * Static, presentation-only QR for the public Ard Kanaan website.
 * It intentionally carries no financial, student, voucher, or database identifier.
 */
export function SiteQr() {
  return (
    <img
      src="/canaanites-land-qr.svg"
      alt="موقع أرض كنعان"
      title={SITE_URL}
      className="size-20 shrink-0 object-contain print:size-20"
    />
  )
}
