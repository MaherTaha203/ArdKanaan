# 08 — Backup, Deployment & Disaster Recovery

**Phases 13–14.** The backup/restore and deploy story is the **weakest sustainability
dimension** — the system's ability to survive an incident or a maintainer handover depends
on capabilities that are mostly absent or untested.

## Backup & restore

**What exists:** a client-driven JSON export (`use-backup-store.ts:46-101` dumps 7 tables,
each verified against `count(exact)` and rejected if incomplete; `backup.ts:83-93` downloads
the file). Restore validates the file then calls the **atomic, owner-only server RPC
`restore_center_data`**, which validates the entire financial graph before a
delete-all+reinsert in one transaction, with empty/shrink guards, sequence resets, and
`restore_log`+`audit_log` records. The UI forces a pre-restore safety export + a typed
confirmation. **The restore engine is genuinely strong within its scope.**

## Backup/DR findings

| ID | Sev | Status | Finding / recommendation (not implemented) |
|---|---|---|---|
| OPS-010 | P2 | PROVEN | Backup is a **manual** browser download — no schedule/offsite/encryption/retention/immutability. Miss a day → lose a day; plaintext full dataset on one device |
| OPS-012 | P2 | PROVEN | Pre-restore safety copy lands on the **same device** as routine backups → single point of loss |
| OPS-011 | P2 | PROVEN | Server restore path (heavy validation) has **no executable test** (e2e mocks it) → a restore bug could corrupt/erase live data undetected |
| DB-002 | P2 | PROVEN | Restore aborts wholesale on any standalone fee obligation (`INVALID_FEE_BACKUP`) once that repo-only feature ships |
| DB-004 | P3 | IMPROVEMENT | Shrink guard omits money-bearing child tables |
| coverage | P2 | PROVEN | Backup omits `audit_log`, `restore_log`, settings, and Supabase Auth users → **the audit trail and settings are unrecoverable** from a backup |
| DR docs | P2 | PROVEN | No restore runbook, host-outage plan, or rebuild-from-repo steps (report 09) |

## Build / deploy / hosting (Phase 14)

Build passes first-hand (single 747 KB chunk, **no source maps** in prod = good). **`dist/`
is committed to git** (artifact drift risk). 53 CLI-managed migrations (PG 17); **no
migration-apply test in CI**; prior drift-reconciliation branches exist → schema state is a
single point of failure.

| ID | Sev | Status | Finding / recommendation (not implemented) |
|---|---|---|---|
| TEST-002 (=OPS-015) | P2 | PROVEN | CI on 2 hard-coded branches; current + default get no CI. → Trigger on default + all PRs |
| TEST-011 | P3 | PROVEN | **No deploy mechanism** (no vercel/netlify/Docker/Pages/CI-deploy); release manual & undocumented; `dist/` committed. → Add deploy job/config; stop committing `dist/` |
| TEST-009 | P3 | PROVEN | Runtime Google-Fonts CDN `@import` (`index.css:1`) → external fetch at load; widens future CSP. → Self-host |
| migration test | P2 | SUSPECTED | No `db reset`/apply smoke in CI; applied prod schema unverified. **BLOCKED — ACCESS REQUIRED**. → Add reset smoke; reconcile applied set |
| rollback | P2 | PROVEN (absence) | No documented rollback for a failed release or bad migration. → Document a rollback path |

## Long-term recovery outlook

If the operator's laptop is lost with the only recent backup, or a migration goes wrong in
production, **there is no rehearsed, offsite, tested recovery path today**. This is the most
important sustainability gap after the test-integrity P1. Local runnability is confirmed good
(all suites pass here); the app is a static bundle + Supabase, so rebuild-from-repo is
feasible **once documented**.

## BLOCKED — ACCESS REQUIRED

Applied production migration set; a real restore rehearsal in an isolated env; the actual
hosting/deploy target (none in repo).
