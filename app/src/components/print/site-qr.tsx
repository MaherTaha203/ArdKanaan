const SITE_URL = 'https://canaanites-land.com/'

/**
 * Static, presentation-only QR for the public Ard Kanaan website.
 * It intentionally carries no financial, student, voucher, or database identifier.
 */
export function SiteQr() {
  return (
    <div className="flex w-[16mm] flex-col items-center gap-1 text-center">
      <img
        src="/canaanites-land-qr.svg"
        alt="موقع أرض كنعان"
        title={SITE_URL}
        className="size-[16mm] shrink-0 object-contain"
      />
      <span className="whitespace-nowrap text-[8px] font-medium text-[#64748b] print:text-[8px]">
        موقع أرض كنعان
      </span>
    </div>
  )
}
