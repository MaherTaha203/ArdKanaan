import { normalizeArabic } from '@/lib/text'
import type { Student } from '@/types/domain'

// Attaching a receipt to the WRONG student is a silent financial error: the money
// lands on someone else's statement. So a voucher may never bind to "the first
// match" of an ambiguous name. These pure helpers decide, given the exact-name
// matches found in the database, whether to reuse a student, create a new one, or
// refuse and demand an explicit pick. They hold no I/O — the store does the reads.

export type StudentResolution =
  | { kind: 'existing'; id: string } // exactly one match — safe to reuse
  | { kind: 'new' } // no match — a genuinely new student
  | { kind: 'ambiguous'; count: number } // several share the name — operator must pick

/**
 * Classify the students whose stored name equals the typed name. One match reuses
 * it; none means new; more than one is ambiguous and must not be resolved silently.
 */
export function classifyNameMatches(matchIds: readonly string[]): StudentResolution {
  if (matchIds.length === 0) return { kind: 'new' }
  if (matchIds.length === 1) return { kind: 'existing', id: matchIds[0] }
  return { kind: 'ambiguous', count: matchIds.length }
}

/**
 * How many existing students share a name (compared after Arabic normalization, so
 * visually identical names collide). Used by the picker to warn before submit; the
 * store's database-side check remains the real guard.
 */
export function countNameMatches(students: readonly Student[], name: string): number {
  const term = normalizeArabic(name.trim())
  if (!term) return 0
  let count = 0
  for (const student of students) {
    if (normalizeArabic(student.name) === term) count += 1
  }
  return count
}
