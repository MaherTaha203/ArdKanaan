# R2.4 Backup & Disaster-Recovery Design Proposal

**Status:** PROPOSAL — Owner decision required before production implementation  
**Scope:** OPS-010 / OPS-011 / OPS-012  
**Production database:** READ-ONLY during this design stage

## 1. Current verified state

The current application backup is a manual browser JSON download. It is not scheduled, offsite, encrypted, retained independently, or immutable.

The pre-restore safety copy is also downloaded to the same browser/device.

The database-level restore path is now executable and tested in CI through `app/supabase/tests/external_share_layers.sh`. The test uses disposable PostgreSQL only and verifies restore integrity, payment idempotency preservation, authorization/firewall behavior, and independent non-forced shrink rejection for all seven restorable sections.

## 2. Backup boundary

The current restorable payload contains seven sections:

1. students
2. courses
3. enrollments
4. fee_obligations
5. receipt_vouchers
6. receipt_allocations
7. payment_vouchers

The following are not represented by the current application backup payload and therefore are **not recoverable from that JSON alone**:

- audit_log
- restore_log
- Supabase Auth users/sessions
- application/runtime secrets
- external service configuration
- database-level objects already supplied by the migration chain

This boundary must remain explicit in the restore runbook.

## 3. Proposed production architecture

Before enabling automation, the Owner must approve the external storage boundary.

### Required flow

`Production Supabase DB -> scheduled server-side dump -> encrypted backup artifact -> independent offsite storage -> retention policy`

The browser must not be part of the scheduled backup path.

### Required properties

- Automated schedule independent of the operator browser.
- Encryption before or at the external storage boundary.
- Offsite storage independent of the production database.
- Retention policy with automatic expiry.
- Backup integrity verification after creation.
- Restore test against an isolated disposable PostgreSQL environment.
- No production restore as part of routine verification.
- Credentials limited to the backup job and storage target.
- Backup artifacts must never be exposed to the frontend.
- Secrets/keys must never be committed to Git.
- Failed backup jobs must produce a visible failure signal.

## 4. Proposed schedule (not yet adopted)

These are engineering defaults, not product decisions:

- Daily automated backup.
- Keep at least 30 daily copies.
- Keep at least 12 monthly copies.
- Keep the latest successful backup immediately accessible.
- Run an isolated restore verification at least monthly.

The exact RPO/RTO and retention values require Owner approval.

## 5. External storage decision

Implementation is intentionally blocked until one storage model is selected.

### Option A — S3-compatible object storage

Recommended engineering shape.

Advantages:
- purpose-built object storage
- server-side encryption available
- lifecycle/retention policies
- independent credentials
- easy separation from GitHub and Supabase

Required decision:
- provider
- bucket/account ownership
- region
- retention period
- encryption/key ownership

### Option B — GitHub Actions artifact/object storage

Possible for automation, but not preferred as the long-term financial backup repository.

Risks:
- repository/CI platform becomes part of the disaster-recovery dependency
- retention and access model are tied to CI infrastructure
- backup data sits closer to source-control administration than necessary

### Option C — Managed third-party backup service

Possible if the Owner already has an approved provider.

Required decision:
- provider
- data residency
- encryption model
- retention
- recovery access

**No option is adopted by this document.**

## 6. Restore runbook requirements

A production restore procedure must be documented before the automated backup is connected to Production.

Minimum sequence:

1. Declare the incident and freeze normal financial writes.
2. Identify the latest known-good backup artifact.
3. Verify artifact integrity and backup timestamp.
4. Record the intended restore point.
5. Restore into an isolated PostgreSQL environment first.
6. Run the database restore harness and financial integrity checks.
7. Compare expected row counts and financial aggregates.
8. Verify payment idempotency preservation.
9. Verify all seven non-forced shrink guards.
10. Verify authorization/firewall behavior.
11. Only after isolated validation, prepare the production recovery action.
12. Production restore requires explicit Owner authorization.
13. Record the restore event and evidence.

The routine safety copy must not rely on the same browser/device as the operator's normal backup.

## 7. Recovery targets

RPO and RTO are currently **undefined**.

They must be explicitly decided before production automation is declared complete:

- **RPO:** maximum acceptable loss of newly entered financial data.
- **RTO:** maximum acceptable time to restore operational access.

The automated schedule must be chosen to satisfy the approved RPO.

## 8. Security constraints

The backup system must not:

- expose financial backup files through the application UI
- store plaintext credentials in the repository
- grant frontend access to backup storage
- use the Supabase service-role secret in browser code
- silently overwrite the only known-good backup
- delete the previous known-good backup before a new backup is verified

The backup encryption key must have a documented recovery path. Losing the encryption key must not be equivalent to losing the backup.

## 9. R2.4 implementation gates

R2.4 is complete only when all are true:

- [ ] Owner approves the external storage model.
- [ ] Owner approves RPO/RTO.
- [ ] Automated server-side schedule is implemented.
- [ ] Backup is encrypted.
- [ ] Backup is stored offsite.
- [ ] Retention/lifecycle policy is active.
- [ ] Backup integrity is verified.
- [ ] Failure alerting is verified.
- [ ] Isolated restore from an actual offsite artifact succeeds.
- [ ] Restore runbook is complete.
- [ ] Production remains unchanged until the above evidence exists.
- [ ] Post-implementation CI and deployment checks pass.

## 10. Explicit non-goals

This R2.4 design does not change:

- application UI
- page layout
- button positions
- navigation
- financial calculation rules
- voucher behavior
- database financial invariants
- production database contents

It is an operational resilience change only.
