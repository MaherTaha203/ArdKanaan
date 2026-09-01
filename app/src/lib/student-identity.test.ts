import { describe, expect, it } from 'vitest'

import { classifyNameMatches, countNameMatches } from '@/lib/student-identity'
import type { Student } from '@/types/domain'

function student(id: string, name: string): Student {
  return { id, name, idNumber: null, phone: null, notes: null }
}

describe('classifyNameMatches', () => {
  it('treats no matches as a new student', () => {
    // Arrange / Act
    const result = classifyNameMatches([])

    // Assert
    expect(result).toEqual({ kind: 'new' })
  })

  it('reuses the single matching student', () => {
    const result = classifyNameMatches(['s-1'])

    expect(result).toEqual({ kind: 'existing', id: 's-1' })
  })

  it('refuses to guess when several students share the name', () => {
    const result = classifyNameMatches(['s-1', 's-2'])

    expect(result).toEqual({ kind: 'ambiguous', count: 2 })
  })

  it('reports the full ambiguous count, not just "more than one"', () => {
    const result = classifyNameMatches(['s-1', 's-2', 's-3', 's-4'])

    expect(result).toEqual({ kind: 'ambiguous', count: 4 })
  })
})

describe('countNameMatches', () => {
  const students = [
    student('s-1', 'محمد علي'),
    student('s-2', 'محمد علي'),
    student('s-3', 'سارة أحمد'),
  ]

  it('counts every student sharing the exact name', () => {
    expect(countNameMatches(students, 'محمد علي')).toBe(2)
  })

  it('counts a unique name once', () => {
    expect(countNameMatches(students, 'سارة أحمد')).toBe(1)
  })

  it('returns zero for an unknown name', () => {
    expect(countNameMatches(students, 'خالد')).toBe(0)
  })

  it('returns zero for a blank query', () => {
    expect(countNameMatches(students, '   ')).toBe(0)
  })

  it('collides names that differ only by diacritics or alef form', () => {
    // "مُحمد علي" (with damma) and "احمد" vs "أحمد" normalize together.
    expect(countNameMatches(students, 'مُحمد علي')).toBe(2)
    expect(countNameMatches([student('s-4', 'أحمد')], 'احمد')).toBe(1)
  })
})
