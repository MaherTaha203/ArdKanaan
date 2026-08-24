import { type ReactNode } from 'react'

import { RouteHeader } from '@/components/shell/route-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { appEnv } from '@/lib/env'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3.5 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="block">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {note ? <p className="mt-1 text-[12.5px] leading-6 text-faint">{note}</p> : null}
      </CardHeader>
      <CardContent className="px-5 py-1.5">{children}</CardContent>
    </Card>
  )
}

export function SettingsWorkspace() {
  const connected = appEnv.isSupabaseConfigured

  return (
    <div>
      <RouteHeader
        eyebrow="الإعدادات"
        title="إعدادات المركز"
        description="مساحة مقيّدة تعرض ما هو قائم فعلًا فقط — لا لوحة إدارة."
      />

      <div className="grid max-w-[760px] gap-6">
        <Group title="المركز والمشغّل">
          <Row label="اسم المركز">أرض كنعان</Row>
          <Row label="نوع الاستخدام">مركز تدريبي واحد · مشغّل واحد</Row>
          <Row label="المشغّل">أمين المركز</Row>
        </Group>

        <Group title="اللغة والعرض" note="سياسات ثابتة على مستوى المنتج.">
          <Row label="اللغة">العربية</Row>
          <Row label="الاتجاه">من اليمين إلى اليسار (RTL)</Row>
          <Row label="السمة">فاتحة</Row>
          <Row label="عرض الأرقام">
            <span className="figure">0-9</span> أرقام إنجليزية دائمًا
          </Row>
        </Group>

        <Group
          title="الاتصال بقاعدة البيانات"
          note="مصدر البيانات هو Supabase. لا تُعرض المفاتيح هنا."
        >
          <Row label="الحالة">
            <span
              className={`inline-flex items-center gap-2 ${
                connected ? 'text-olive' : 'text-clay'
              }`}
            >
              <span
                className={`size-2 rounded-full ${connected ? 'bg-olive' : 'bg-clay'}`}
              />
              {connected ? 'متصل' : 'غير مهيأ في هذه البيئة'}
            </span>
          </Row>
        </Group>

        <Group
          title="نموذج الحقيقة المالية"
          note="ثوابت دستورية (ARK-002) — للعرض فقط، غير قابلة للتعديل من الإعدادات."
        >
          <Row label="مصدر الحقيقة">سندات القبض والصرف فقط</Row>
          <Row label="البيان والتقرير">مشتقّان دائمًا — لا يُخزَّن رصيد</Row>
          <Row label="التصحيح">يتم بتصحيح السند، لا بتعديل البيان</Row>
        </Group>

        <Group
          title="المصادقة والأمان"
          note="حدود العرض مطبّقة كتجربة منتج. لم تُفعَّل مصادقة حقيقية ولا سياسات RLS بعد؛ ذلك قرار مالك منفصل."
        >
          <Row label="المصادقة">تجربة عرض فقط (بدون تأمين فعلي)</Row>
          <Row label="RLS">غير مُفعَّلة — بانتظار قرار المالك</Row>
        </Group>
      </div>
    </div>
  )
}
