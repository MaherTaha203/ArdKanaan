# AUDIT-ACTIVITY-001 — Activity Log Coverage Audit

## Result

The new **سجل العمل** surface is read-only and correctly separates historical activity from financial reports. The current database audit stream is authoritative for the source-of-truth mutations that are actually persisted today.

## Confirmed coverage

- Receipt vouchers: create/edit/cancel are captured by the shared server-side audit trigger.
- Payment vouchers: create/edit/cancel are captured by the shared server-side audit trigger.
- Students: create/edit are captured by the shared server-side audit trigger.
- Enrollments: create/edit are captured by the shared server-side audit trigger.
- Backup restore: one aggregate restore event is recorded while row-level restore noise is suppressed.
- Authentication lifecycle events and client-only consequential actions are recorded through the guarded activity RPC.
- Actor, device identifier, user-agent, IP (when supplied by the request), and timezone context are stored when available.

## Important boundary

The product constitution describes additional domain concepts such as teachers and programs, but the current application database does not expose corresponding persisted `public.programs` / teacher source-of-truth tables in the audited migration set. No speculative triggers or tables were added. Audit coverage must follow the actual persisted source of truth, not documentation-only entities.

## Cancellation rule

Cancellation is final. The activity surface must never expose an action that implies restoration. Historical legacy action values such as `uncancel` may exist in old audit data, but they are historical records only and must not become a supported workflow.

## Next audit target

Add focused regression coverage for the activity page and consequential financial flows, then validate migration behavior against a real Supabase database when an authenticated database test environment is available. Do not alter financial derivation code for this purpose.
