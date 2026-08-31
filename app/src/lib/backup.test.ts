import { describe, expect, it } from 'vitest'

import { BACKUP_APP, BACKUP_VERSION, backupFilename, validateBackup } from '@/lib/backup'

function validRecord(overrides: Record<string, unknown> = {}) {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exported_at: '2026-08-31T00:00:00.000Z',
    students: [{ id: 's-1' }],
    enrollments: [{ id: 'e-1' }],
    receipt_vouchers: [{ id: 'r-1' }],
    payment_vouchers: [],
    ...overrides,
  }
}

describe('validateBackup', () => {
  it('accepts a well-formed backup and narrows to the restore arrays', () => {
    const result = validateBackup(validRecord())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.payload.students).toHaveLength(1)
      expect(result.payload.enrollments).toHaveLength(1)
      expect(result.payload.receipt_vouchers).toHaveLength(1)
      expect(result.payload.payment_vouchers).toHaveLength(0)
    }
  })

  it('defaults enrollments to [] for older backups that lack them', () => {
    const record = validRecord()
    delete (record as Record<string, unknown>).enrollments
    const result = validateBackup(record)

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.payload.enrollments).toEqual([])
  })

  it('rejects a non-object', () => {
    expect(validateBackup(null).ok).toBe(false)
    expect(validateBackup('nope').ok).toBe(false)
  })

  it('rejects a file from another app', () => {
    const result = validateBackup(validRecord({ app: 'something-else' }))
    expect(result.ok).toBe(false)
  })

  it('rejects a newer, unsupported version', () => {
    const result = validateBackup(validRecord({ version: BACKUP_VERSION + 1 }))
    expect(result.ok).toBe(false)
  })

  it('rejects a structurally incomplete backup', () => {
    const record = validRecord()
    delete (record as Record<string, unknown>).receipt_vouchers
    expect(validateBackup(record).ok).toBe(false)
  })
})

describe('backupFilename', () => {
  it('builds a sortable, timestamped json name', () => {
    const name = backupFilename(new Date(2026, 7, 31, 9, 5))
    expect(name).toBe('ard-kanaan-backup-20260831-0905.json')
  })
})
