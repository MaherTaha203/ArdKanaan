import { normalizeArabic } from '@/lib/text'
import type { Student } from '@/types/domain'

// Attaching a receipt to the WRONG student — or silently creating a DUPLICATE of an
// existing one — is a silent financial error: money lands on the wrong statement, or
// a person's history fragments across two records. So a voucher may never bind to
// "the first match" of an ambiguous name, and name matching must use the SAME Arabic
// normalization the operator sees in the picker (so visually identical names collide
// the same way in the warning and in the guard). These pure helpers decide, given the
// current roster, whether to reuse a student, create a new one, or refuse. No I/O.

export type StudentResolution =
  | { kind: 'existing'; id: string } // exactly one match — safe to reuse
  | { kind: 'new' } // no match — a genuinely new student
  | { kind: 'ambiguous'; count: number } // several share the name — operator must pick

/**
 * Ids of every student whose name equals the given name after Arabic normalization
 * (diacritics and alef/ya/ta-marbuta variants folded). This is the single definition
 * of "same name" used by both the picker's warning and the save guard.
 */
export function findNameMatchIds(students: readonly Student[], name: string): string[] {
  const term = normalizeArabic(name.trim())
  if (!term) return []
  return students.filter((student) => normalizeArabic(student.name) === term).map((s) => s.id)
}

/**
 * Classify the roster matches for a typed name. One match reuses it; none means new;
 * more than one is ambiguous and must not be resolved silently.
 */
export function classifyNameMatches(matchIds: readonly string[]): StudentResolution {
  if (matchIds.length === 0) return { kind: 'new' }
  if (matchIds.length === 1) return { kind: 'existing', id: matchIds[0] }
  return { kind: 'ambiguous', count: matchIds.length }
}

/** How many existing students share a name — used by the picker to warn before submit. */
export function countNameMatches(students: readonly Student[], name: string): number {
  return findNameMatchIds(students, name).length
}
