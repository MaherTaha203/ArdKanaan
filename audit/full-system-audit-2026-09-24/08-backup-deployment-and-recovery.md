# 08 — Backup, Deployment & Disaster Recovery

**Phases covered:** 13 (backup & DR) · 14 (build / deploy / hosting)

## Backup & restore — what exists

Backup is a **client-driven JSON export**: `use-backup-store.ts:46-101` dumps 7 source
tables (`select('*')`, each verified against a `count(exact)` and **rejected if
incomplete**), and `lib/backup.ts:83-93` downloads `ard-kanaan-backup-YYYYMMDD-HHMM.json`.
Restore validates the file (`validateBackup`) then calls the atomic server RPC
`restore_center_data`. That RPC (current def
`20260916125000_restore_financial_identity_hardening.sql`) is **strong within its scope**:
owner-only, validates the entire financial graph before any delete (enrollment↔course
snapshots, fee categories/shares, allocation targets, per-receipt allocation sums), then
delete-all + reinsert in one transaction, rebuilds idempotency fingerprints, resets
sequences, and writes `restore_log` + `audit_log`. Guards: `RESTORE_REFUSED_EMPTY`,
`RESTORE_SHRINKS` (force required), oversize caps. The UI forces an **automatic safety
export before restore** (`backup-restore.tsx:110-121`) and a typed confirmation word.

## Backup/DR gaps

| ID | Sev | Status | Evidence | Impact / recommendation (not implemented) |
|---|---|---|---|---|
| OPS-010 | P2 | PROVEN | `lib/backup.ts:83-93`; `use-backup-store.ts:46-101` | **Manual** browser download only — no schedule, offsite, encryption, retention, immutability. Miss a day → lose a day; plaintext full financial dataset in the operator's Downloads on one device. → Add automated, offsite, encrypted, retained backups (e.g. scheduled Supabase dump) |
| OPS-012 | P2 | PROVEN | `backup-restore.tsx:110-121` | The pre-restore safety copy downloads to the **same** browser as the routine backup — single device for both. → Require the safety copy be stored independently; keep a server-side snapshot |
| OPS-011 | P2 | PROVEN | `e2e/smoke.spec.ts:147-164`; `supabase/tests/` | Restore e2e runs against a **mocked** Supabase (asserts only the client calls the RPC); the heavy server-side validation/restore logic has **no automated test**. A restore bug could corrupt/erase live data undetected. → Add a DB-level restore test (pgTAP/harness) exercising the guards |
| DB-002 | P2 | PROVEN | restore rejects null enrollment/course vs `20260919130000` standalone fees | A backup containing a standalone fee obligation makes restore **abort wholesale** (`INVALID_FEE_BACKUP`) once that repo-only feature ships to production. → Align restore validation with the standalone rules **before** enabling it live |
| DB-004 | P3 | IMPROVEMENT | `20260916125000:56` | Shrink guard covers only students/receipts/payments, not `receipt_allocations`/`fee_obligations` (money-bearing). → Extend the guard |
| — coverage | P2 | PROVEN (OPS) | export table set | Backup covers students/courses/enrollments/fee_obligations/receipt_vouchers/receipt_allocations/payment_vouchers — **not** `audit_log`, `restore_log`, app settings, or Supabase Auth users → the **audit trail and settings are unrecoverable** from a backup file. → Decide coverage explicitly; document what a restore does and does not recover |
| — DR docs | P2 | PROVEN (OPS) | `docs/` has no runbook | No restore runbook, host-outage plan, rebuild-from-repo steps, or "unrecoverable secrets" note; recovery is tribal knowledge. → Write a DR/restore runbook (see report 09) |

## Build / deploy / hosting

**Build:** `npm run build` (tsc -b && vite build) passes; single ~747 KB JS chunk, no
source maps in production (good). **`dist/` is committed to git** (build artifact in source
control — can drift). PG major 17 per `config.toml`; 53 timestamped migrations managed by
Supabase CLI (`db.migrations.enabled=true`); ordering by filename; **no automated
migration-apply test in CI**. Prior branches (`chore/reconcile-migration-history`,
`codex/fix-supabase-migration-sync`) indicate past migration-drift incidents — schema state
is a single point of failure.

| ID | Sev | Status | Evidence | Impact / recommendation (not implemented) |
|---|---|---|---|---|
| TEST-002 / OPS-015 | P2 | PROVEN | `ci.yml:4-10` | CI triggers only on `claude/ard-kanaan-phase-0-6rymjv` + a now-deleted branch, PRs onto the former; **current branch + default + ~30 others get no CI**. → Trigger on the default branch and all PRs |
| TEST-011 | P3 | PROVEN | no deploy job/config anywhere | **No deploy mechanism** — no CI deploy, no `vercel.json`/`netlify.toml`/`Dockerfile`/Pages. Release is manual & undocumented. → Add an explicit deploy job/config; stop committing `dist/` |
| TEST-009 | P3 | PROVEN | `src/index.css:1` | Runtime `@import` of Google Fonts from `fonts.googleapis.com` — external fetch at load (degrades offline; widens any future CSP). → Self-host fonts |
| — migrations | P2 | SUSPECTED | drift branches; repo-only tail | No migration-apply/reset test in CI; the actual applied production schema is unverified from the repo (ADR-0077 tail marked "repo only, not in production"). → Add a `db reset` smoke in CI; reconcile & record the true applied migration set |
| — rollback | P2 | PROVEN (absence) | no rollback doc/config | No documented rollback for a failed release or a bad migration. → Document a rollback path (revert build + migration down/restore) |

**Local runnability:** confirmed good — unit, e2e, lint, and build all pass in this
environment; the app is a static bundle + Supabase, so it runs locally with the two public
`VITE_*` vars. **Start-up internet dependence:** Supabase (data/auth) + Google Fonts CDN;
no offline mode by design.

**Net:** the *restore engine* is genuinely strong and safe within its scope; the weaknesses
are **operational** — manual/local-only/unencrypted backups, an untested server restore
path, no deploy/rollback tooling or docs, narrow CI, and unverified production schema state.
