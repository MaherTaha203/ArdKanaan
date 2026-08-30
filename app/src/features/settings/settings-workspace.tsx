import { type ReactNode, useState } from 'react'

import { RouteHeader } from '@/components/shell/route-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getSupabaseBrowserClient } from '@/lib/supabase'
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

const MIN_PASSWORD = 6

export function SettingsWorkspace() {
  const session = useAuthStore((state) => state.session)
  const signOut = useAuthStore((state) => state.signOut)
  const email = session?.user?.email ?? '—'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < MIN_PASSWORD) {
      setMessage({ tone: 'error', text: 'كلمة المرور قصيرة' })
      return
    }
    if (password !== confirm) {
      setMessage({ tone: 'error', text: 'كلمتا المرور غير متطابقتين' })
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage({ tone: 'error', text: 'تعذّر تغيير كلمة المرور' })
      return
    }
    setIsSaving(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password })
    setIsSaving(false)
    if (error) {
      setMessage({ tone: 'error', text: 'تعذّر تغيير كلمة المرور' })
      return
    }
    setPassword('')
    setConfirm('')
    setMessage({ tone: 'ok', text: 'تم تغيير كلمة المرور' })
  }

  return (
    <div>
      <RouteHeader eyebrow="الإعدادات" title="الإعدادات" />

      <div className="grid max-w-[760px] gap-6">
        <Group title="المالية">
          <Row label="العملة">شيكل (₪)</Row>
          <Row label="تنسيق التاريخ">
            <span className="figure">DD/MM/YYYY</span>
          </Row>
          <Row label="ترقيم سندات القبض">تلقائيّ متسلسل</Row>
          <Row label="ترقيم سندات الصرف">تلقائيّ متسلسل</Row>
        </Group>

        <Group title="الحساب">
          <Row label="البريد">
            <span className="figure" dir="ltr">
              {email}
            </span>
          </Row>

          <div className="border-b border-border py-4 last:border-b-0">
            <div className="mb-2 text-[13px] text-muted-foreground">تغيير كلمة المرور</div>
            <form onSubmit={handleChangePassword} className="flex flex-wrap items-center gap-2">
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="كلمة مرور جديدة"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (message) setMessage(null)
                }}
                className="max-w-[200px]"
              />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="تأكيد كلمة المرور"
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value)
                  if (message) setMessage(null)
                }}
                className="max-w-[200px]"
              />
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'جارٍ الحفظ…' : 'تحديث'}
              </Button>
              {message ? (
                <span
                  className={`text-sm font-medium ${
                    message.tone === 'ok' ? 'text-gold' : 'text-clay'
                  }`}
                >
                  {message.text}
                </span>
              ) : null}
            </form>
          </div>

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
