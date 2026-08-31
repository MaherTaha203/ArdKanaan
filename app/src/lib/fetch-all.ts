// Paginated fetch — reads EVERY row past PostgREST's default 1000-row response cap.
//
// A financial system must never silently operate on the first 1000 rows: truncated
// totals under-count, and a truncated backup becomes permanent data loss on restore.
// The caller supplies a page function that applies `.range(from, to)` to a fresh
// query; this loops until a short page proves the end was reached.

export const PAGE_SIZE = 1000

type Page<T> = { data: T[] | null; error: unknown }

/**
 * Read all rows of a query in PAGE_SIZE batches. `page(from, to)` must build a
 * fresh query each call and apply `.range(from, to)` (Supabase query builders are
 * single-use). Returns the accumulated rows, or the first error encountered.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<Page<T>>,
): Promise<{ data: T[]; error: unknown }> {
  const all: T[] = []
  let from = 0
  // Hard ceiling so a misbehaving backend can never spin this forever.
  const MAX_PAGES = 10_000
  for (let i = 0; i < MAX_PAGES; i += 1) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1)
    if (error) return { data: all, error }
    const batch = data ?? []
    all.push(...batch)
    if (batch.length < PAGE_SIZE) return { data: all, error: null }
    from += PAGE_SIZE
  }
  return { data: all, error: new Error('تجاوز عدد الصفحات الحدّ المسموح.') }
}
