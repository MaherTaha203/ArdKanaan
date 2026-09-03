import { type ReactNode, useState } from 'react'

import { RouteHeader } from '@/components/shell/route-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BackupRestore } from '@/features/settings/backup-restore'
import { DEFAULT_CENTER_SETTINGS, getCenterSettings, saveCenterSettings, type CenterSettings } from '@/lib/center-settings'
import { useAuthStore } from '@/store/use-auth-store'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3.5 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="block">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </CardHeader>
      <CardContent className="px-6 py-1.5">{children}</CardContent>
    </Card>
  )
}

export function SettingsWorkspace() {
  const session = useAuthStore((state) => state.session)
  const signOut = useAuthStore((state) => state.signOut)
  const email = session?.user?.email ?? '—'
  const [center, setCenter] = useState<CenterSettings>(() => getCenterSettings())
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function updateField(field: keyof CenterSettings, value: string) {
    setCenter((current) => ({ ...current, [field]: value }))
    setMessage(null)
  }

  function handleSave() {
    setIsSaving(true)
    saveCenterSettings(center)
    setCenter(getCenterSettings())
    setMessage('تم حفظ بيانات المركز')
    setIsSaving(false)
  }

  function handleReset() {
    setCenter((current) => ({ ...current, name: DEFAULT_CENTER_SETTINGS.name }))
    setMessage('تمت إعادة اسم المركز الافتراضي')
  }

  return (
    <div>
      <RouteHeader eyebrow="الإعدادات" title="الإعدادات" />

      <div className="grid w-full max-w-[1080px] gap-6">
        <Group title="بيانات المركز">
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[13px] text-muted-foreground">اسم المركز</span>
              <Input value={center.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] text-muted-foreground">اسم المسؤول</span>
              <Input value={center.responsibleName} onChange={(event) => updateField('responsibleName', event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] text-muted-foreground">الهاتف</span>
              <Input dir="ltr" inputMode="tel" value={center.phone} onChange={(event) => updateField('phone', event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] text-muted-foreground">العنوان</span>
              <Input value={center.address} onChange={(event) => updateField('address', event.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border py-4">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'جارٍ الحفظ…' : 'حفظ بيانات المركز'}
            </Button>
            <Button variant="quiet" size="sm" onClick={handleReset}>
              إعادة الاسم الافتراضي
            </Button>
            {message ? <span className="text-sm font-medium text-gold">{message}</span> : null}
          </div>
          <p className="pb-4 text-xs leading-6 text-muted-foreground">
            تستخدم هذه البيانات في ترويسة المستندات المطبوعة والتقارير.
          </p>
        </Group>

        <Group title="المالية">
          <Row label="العملة">شيكل (₪)</Row>
          <Row label="تنسيق التاريخ">
            <span className="figure">DD/MM/YYYY</span>
          </Row>
          <Row label="ترقيم سندات القبض">تلقائيّ متسلسل</Row>
          <Row label="ترقيم سندات الصرف">تلقائيّ متسلسل</Row>
        </Group>

        <Group title="النسخ الاحتياطي والاستعادة">
          <BackupRestore />
        </Group>

        <Group title="الحساب">
          <Row label="البريد">
            <span className="figure" dir="ltr">
              {email}
            </span>
          </Row>
          <div className="py-4">
            <Button variant="quiet" size="sm" onClick={() => void signOut()}>
              تسجيل الخروج
            </Button>
          </div>
        </Group>
      </div>
    </div>
  )
}
