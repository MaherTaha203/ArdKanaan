# 06 — Reliability, Backup & Recovery (Section VII)

**Read-only.** How the system behaves under the operational realities of years of daily use:
network drops, retries, failures, session expiry, schema/version drift, and recovery.

## Reliability under daily operation

| Aspect | State (evidence) | Sustainability verdict |
|---|---|---|
| Internet drop / reconnect | **No** `navigator.onLine`/offline handling (OPS-009); Supabase `autoRefreshToken` reconnects the session | Offline actions fail with a generic error; no queue → operator must retry manually |
| Request fails **after** a successful DB write | Posting is **idempotent** (key + fingerprint) so a retried receipt won't duplicate; payment retry with a fresh key *could* (FIN-004) | Mostly safe; tighten idempotency-key reuse |
| Repeated submit / double-click | `isSaving` guard + disabled button on money-in/out; **cancel/update lack the guard** (CODE-009) but idempotent SQL protects | Safe |
| Loading / failure UI | `ErrorNotice` + retry on every workspace; read store refreshes auth + retries once | Good |
| **Error boundary** | **NONE** (OPS-005) — a single render throw white-screens the whole SPA | **Weak**: over years, one edge-case render bug takes the whole app down with no recovery |
| Error logging / monitoring | Only `console.error` (16 sites); **no remote tracking/alerting/tracing** (OPS-006) | **Weak**: failures in a financial system are invisible to the operator/maintainer |
| Session expiry mid-work | Read path refreshes + retries; **write path does not** (OPS-008) | Minor; autoRefresh usually covers it |
| External-service dependence | Supabase (data/auth) + **Google Fonts CDN at runtime** (TEST-009) | Supabase outage = full outage (inherent); self-host fonts |
| App/schema version compat | 53 CLI migrations; **no migration-apply test in CI**; repo↔prod drift signals (SEC-006, "repo only" tail) | **Weak**: schema/app drift is a real long-term hazard |
| Migration apply/rollback | Forward-only migrations; **no documented rollback** | Add corrective-migration + rollback discipline |

## Backup

- **Mechanism:** client-driven JSON export (`use-backup-store` dumps 7 tables, each verified
  against `count(exact)` and **rejected if incomplete**; downloads
  `ard-kanaan-backup-YYYYMMDD-HHMM.json`). **Manual only** — no schedule.
- **Storage:** the operator's browser Downloads; **not offsite, not encrypted, no retention,
  no immutability** (OPS-010). The pre-restore safety copy goes to the **same device**
  (OPS-012).
- **Coverage:** students, courses, enrollments, fee_obligations, receipt_vouchers,
  receipt_allocations, payment_vouchers. **Excludes** `audit_log` (the history/timeline),
  `restore_log`, app settings, and Supabase Auth users → **the audit trail and the login
  account are not recoverable from a backup file.**

## Restore

- **Engine (strong within scope):** `restore_center_data` RPC — owner-only, validates the
  entire financial graph before a delete-all + reinsert in one transaction, with empty/shrink
  guards, sequence resets, and `restore_log`+`audit_log` records. Client validation is not
  load-bearing (server re-validates).
- **Gaps:** the server restore path has **no executable test** (e2e mocks Supabase — OPS-011);
  **DB-002** (restore aborts wholesale on a standalone fee obligation once that repo-only
  feature ships); shrink guard omits money-bearing child tables (DB-004).

## Disaster-recovery posture

| DR question | Answer (evidence) |
|---|---|
| Is there a DR plan / runbook? | **No** — `docs/` has no restore procedure, host-outage plan, or rebuild-from-repo steps |
| RPO (data that can be lost) | Undefined; realistically **up to the interval between manual exports** (a day+), and the audit trail is unrecoverable from a file |
| RTO (downtime) | Undefined; no tested restore → unknown time to recover |
| Backups independent of host? | **No** — local browser file only; a Supabase-side automated backup (if the plan provides it) is **NOT VERIFIED IN LIVE ENVIRONMENT** |
| Backups protected / no secrets? | Plaintext full dataset on the operator's device; contains no auth secrets (users not exported) but **is** the full financial + personal dataset |
| Restore proven? | **No** — never rehearsed end-to-end. *"A backup that has never been restored is a hypothesis, not a backup."* |
| Rebuild app from repo? | Feasible (static bundle + Supabase) **once documented** — currently undocumented |

## Cost with growth (estimate)

DB storage stays modest for a decade (`02`: ~0.3–0.8 GB) → low Supabase cost. The growing
cost is **egress**: re-transferring the whole history on every cold load multiplies bandwidth
with data × sessions. Exact plan costs are **NOT VERIFIED IN LIVE ENVIRONMENT**.

## Verdict

**Records are durable; recovery is not proven.** The biggest reliability gaps for a
years-long system are (1) **no tested, offsite, automated backup+restore**, (2) **no error
boundary or monitoring** (silent failures), and (3) **schema/version drift** without CI apply
tests or a rollback procedure.
