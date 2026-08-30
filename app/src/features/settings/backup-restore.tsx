import { useRef, useState } from 'react'

import { Download, Upload } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToastStore } from '@/components/ui/use-toast-store'
import {
  downloadBackup,
  readBackupFile,
  validateBackup,
  type RestorePayload,
} from '@/lib/backup'
import { useBackupStore } from '@/store/use-backup-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const CONFIRM_WORD = 'استعادة'

/**
 * Backup (export a JSON snapshot) and restore (replace everything from a backup).
 * Restore is guarded: it downloads an automatic backup of the current data first,
 * then requires the operator to type a confirmation word, then runs the atomic
 * server-side restore. If the restore fails, current data is left untouched.
 */
export function BackupRestore() {
  const exportBackup = useBackupStore((state) => state.exportBackup)
  const restore = useBackupStore((state) => state.restore)
  const isBusy = useBackupStore((state) => state.isBusy)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<RestorePayload | null>(null)
  const [confirmText, setConfirmText] = useState('')

  async function handleExport() {
    const payload = await exportBackup()
    if (!payload) {
      useToastStore.getState().show('تعذّر إنشاء النسخة الاحتياطيّة')
      return
    }
    downloadBackup(payload)
    useToastStore.getState().show('تم تنزيل النسخة الاحتياطيّة')
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset the input so choosing the same file again re-triggers change.
    event.target.value = ''
    if (!file) return
    try {
      const parsed = await readBackupFile(file)
      const valid = validateBackup(parsed)
      if (!valid) {
        useToastStore.getState().show('الملف غير صالح كنسخة احتياطيّة')
        return
      }
      setConfirmText('')
      setPending(valid)
    } catch {
      useToastStore.getState().show('تعذّرت قراءة الملف')
    }
  }

  async function handleConfirmRestore() {
    if (!pending) return
    // Safety net: download an automatic backup of the CURRENT data first.
    const current = await exportBackup()
    if (current) downloadBackup(current)

    const counts = await restore(pending)
    if (!counts) {
      useToastStore.getState().show('تعذّرت الاستعادة')
      return
    }
    await reloadWorkspace()
    setPending(null)
    setConfirmText('')
    useToastStore.getState().show('تمت الاستعادة بنجاح')
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 py-2">
        <Button variant="outline" onClick={handleExport} disabled={isBusy}>
          <Download className="size-4" />
          تصدير نسخة احتياطيّة
        </Button>
        <Button variant="quiet" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
          <Upload className="size-4" />
          استعادة من نسخة
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          className="hidden"
        />
      </div>
      <p className="pb-2 text-[12.5px] leading-6 text-faint">
        النسخة الاحتياطيّة ملفّ واحد يحفظ الطلاب وكل السندات. الاستعادة تستبدل
        البيانات الحاليّة بالكامل، وتُنزّل نسخةً احتياطيّةً تلقائيّة قبلها.
      </p>

      {pending ? (
        <ActionSheet title="تأكيد الاستعادة" onClose={() => setPending(null)}>
          <div className="mb-4 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
            ستُستبدل كل البيانات الحاليّة بمحتوى الملف. سنُنزّل نسخةً احتياطيّة
            تلقائيّة أولًا. لا يمكن التراجع بعد التأكيد إلا بالاستعادة من نسخة.
          </div>
          <p className="mb-2 text-[13px] text-muted-foreground">
            اكتب «{CONFIRM_WORD}» للمتابعة:
          </p>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={CONFIRM_WORD}
            autoFocus
          />
          <div className="mt-6 flex gap-3">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmRestore}
              disabled={isBusy || confirmText.trim() !== CONFIRM_WORD}
            >
              {isBusy ? 'جارٍ الاستعادة…' : 'تأكيد الاستعادة'}
            </Button>
            <Button variant="quiet" onClick={() => setPending(null)} disabled={isBusy}>
              تراجع
            </Button>
          </div>
        </ActionSheet>
      ) : null}
    </>
  )
}
