// Backup file helpers — pure, presentation-adjacent utilities. The actual data
// read/write goes through the backup store (Supabase). A backup is a plain JSON
// snapshot of the three source-of-truth tables; restore is atomic server-side.

export const BACKUP_APP = 'ard-kanaan'
export const BACKUP_VERSION = 1

export type BackupPayload = {
  app: string
  version: number
  exported_at: string
  students: unknown[]
  receipt_vouchers: unknown[]
  payment_vouchers: unknown[]
}

/** A validated backup, narrowed to the three arrays the restore RPC expects. */
export type RestorePayload = {
  students: unknown[]
  receipt_vouchers: unknown[]
  payment_vouchers: unknown[]
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export type BackupValidation =
  | { ok: true; payload: RestorePayload }
  | { ok: false; reason: string }

/**
 * Validate a parsed object as a restorable backup: it must be this app's backup,
 * a version this build understands, and carry the three expected arrays. Returns a
 * tagged result so the caller can explain *why* a file was rejected.
 */
export function validateBackup(value: unknown): BackupValidation {
  if (!value || typeof value !== 'object') {
    return { ok: false, reason: 'الملف غير صالح كنسخة احتياطيّة.' }
  }
  const record = value as Record<string, unknown>
  if (record.app !== BACKUP_APP) {
    return { ok: false, reason: 'هذا الملف ليس نسخة احتياطيّة لأرض كنعان.' }
  }
  if (typeof record.version !== 'number' || record.version > BACKUP_VERSION) {
    return { ok: false, reason: 'إصدار النسخة غير مدعوم في هذا التطبيق.' }
  }
  if (!isArray(record.students) || !isArray(record.receipt_vouchers) || !isArray(record.payment_vouchers)) {
    return { ok: false, reason: 'بنية النسخة الاحتياطيّة غير مكتملة.' }
  }
  return {
    ok: true,
    payload: {
      students: record.students,
      receipt_vouchers: record.receipt_vouchers,
      payment_vouchers: record.payment_vouchers,
    },
  }
}

/** A stable, sortable filename for a backup taken now. */
export function backupFilename(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
  return `ard-kanaan-backup-${stamp}.json`
}

/** Trigger a browser download of the given backup as a JSON file. */
export function downloadBackup(payload: BackupPayload, filename = backupFilename()): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  // Revoke on the next tick so the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Read a File as text and parse it as JSON, or throw a friendly Arabic error. */
export async function readBackupFile(file: File): Promise<unknown> {
  const text = await file.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('الملف غير صالح (ليس نسخة احتياطيّة).')
  }
}
