# R2.4 — Disaster Recovery & Restore Runbook

**Status:** PRE-IMPLEMENTATION RUNBOOK
**Production mutations:** forbidden unless explicitly authorized

## 1. Purpose
Defines the recovery sequence before automated offsite backup activation and separates database disaster recovery from the application's logical seven-section restore.

## 2. Recovery decision
Use Database DR when the database is lost, corrupted, or the hosting environment must be rebuilt.
Use Logical Restore when the database is healthy and an Owner intentionally restores the supported source-data snapshot.
Do not use a browser JSON export as the only recovery mechanism for a full outage.

## 3. Database DR procedure
1. Confirm incident and stop destructive application activity.
2. Identify the latest verified offsite backup artifact.
3. Record timestamp, provider object/version identifier, and checksum if available.
4. Create an isolated recovery environment.
5. Restore the artifact there first.
6. Verify schema, expected objects, RLS, critical grants, ledger integrity, receipt/allocation conservation, fee totals, payment idempotency, audit/restore logs, and expected row counts.
7. Run the DB-level restore/integration harness.
8. Run application typecheck/unit/E2E checks against isolation.
9. Only after successful verification, prepare production recovery.
10. Record the exact artifact and recovery result.

## 4. Logical restore procedure
The existing restore_center_data(payload, force) path remains the authoritative application restore mechanism.

Required protections: owner-only authorization; complete payload validation; financial graph validation before destructive work; RESTORE_REFUSED_EMPTY; RESTORE_SHRINKS unless force is explicitly authorized; size limits; atomic transaction; idempotency/fingerprint reconstruction; audit/restore logging.

The R2.2 runtime harness is the automated proof for this path and must remain green.

## 5. Pre-restore safety copy
The current browser safety export is useful but insufficient as an independent DR control because it shares the operator device.
After R2.4 activation, the safety copy for a destructive logical restore must be stored in the independent offsite backup system before restore is allowed.

## 6. Recovery boundaries
The seven-section application JSON backup restores students, courses, enrollments, fee obligations, receipt vouchers, receipt allocations, and payment vouchers.

It does not by itself restore audit_log, restore_log, database functions/triggers/policies/views/indexes, Supabase Auth users, application secrets/configuration, or the financial ledger as an independent exported table.

Therefore the seven-section JSON is not a complete disaster-recovery image. Full environment recovery requires the database-level backup.

## 7. Secret recovery
Secrets are recovered separately. They must never be placed inside a database dump, browser backup, Git repository, or CI log.

## 8. Recovery acceptance criteria
- isolated restore succeeds without destructive errors;
- expected source rows are present;
- financial totals match the source artifact;
- ledger integrity checks pass;
- idempotency identities survive;
- RLS and critical authorization controls are present;
- application starts and authenticates with test credentials;
- agreed test suite passes;
- Production was not mutated during the exercise;
- artifact and result are recorded.

## 9. Open approvals
Before production activation, the Owner must approve: offsite storage provider; retention schedule; immutability/versioning policy; encryption/key-management model; backup execution identity and least-privilege scope; alert destination; recovery-point and recovery-time targets.