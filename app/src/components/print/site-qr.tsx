const SITE_URL = 'https://canaanites-land.com/'

/**
 * Static, presentation-only QR for the public Ard Kanaan website.
 * It intentionally carries no financial, student, voucher, or database identifier.
 */
export function SiteQr() {
  return (
    <div className="flex flex-col items-center gap-1" style={{ width: '20mm' }}>
      <img
        src="/canaanites-land-qr.svg"
        alt="موقع أرض كنعان"
        title={SITE_URL}
        className="block size-[20mm] shrink-0 object-contain"
      />
      <span className="whitespace-nowrap text-center text-[7px] font-medium leading-3 text-[#64748b]">
        امسح الكود للوصول الى موقع ارض كنعان
      </span>
    </div>
  )
}
