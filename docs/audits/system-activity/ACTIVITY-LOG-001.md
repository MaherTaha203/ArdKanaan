# ACTIVITY-LOG-001 — System Activity Log

## Decision

The application exposes a dedicated **سجل العمل** page for chronological, read-only review of consequential system activity. The cancelled-voucher section is intentionally not restored to the financial report UI.

## Recorded activity

The existing server-side `audit_log` is the source for:

- إصدار سندات القبض والصرف.
- تعديل السندات والسجلات ذات الصلة.
- إلغاء السندات.
- إنشاء وتعديل الطلاب والتسجيلات.
- استعادة نسخة احتياطية.
- تسجيل الدخول والخروج وتغيير كلمة المرور.
- تصدير النسخ الاحتياطية.
- تعديل بيانات المركز المحلية.

Each event may carry the authenticated operator, event time, stable application device identifier, request IP when supplied by the platform, browser user-agent, and browser timezone.

## Product constraints

- The page is observation-only; it has no edit, delete, restore, or replay action.
- Events are displayed newest-first and are searchable/filterable without changing stored history.
- Financial calculations, balances, voucher numbering, cancellation semantics, and source-of-truth tables are not changed by this feature.
- The audit stream remains append-only from the application's perspective; writes are performed by server-side triggers or the guarded authenticated event RPC.
