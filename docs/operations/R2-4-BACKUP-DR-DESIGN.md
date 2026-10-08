# R2.4 — Backup & Disaster-Recovery Design

**Status:** DESIGN-READY / NOT YET IMPLEMENTED
**Scope:** OPS-010, OPS-012, backup coverage and DR documentation
**Production:** READ-ONLY during design and validation

## 1. Objective
Replace the current single-device browser-only backup dependency with an automated recovery path independent of the operator's browser.

Target: scheduled backups; independent offsite storage; encryption in transit and at rest; retention; protection against accidental deletion; isolated restore verification; auditable recovery procedure.

## 2. Proposed architecture
Production Supabase → scheduled trusted runner → encrypted offsite object storage.

The runner creates a consistent PostgreSQL/Supabase backup, encrypts it, uploads it privately, writes a versioned/immutable object, applies retention, records only operational metadata, and alerts on failure.

## 3. Storage requirements
- Independent service/account boundary from the application database.
- Private bucket/container; TLS-only; encryption at rest.
- Object versioning or immutable retention.
- Lifecycle retention rules and access logging where available.
- Least-privilege backup credential restricted to the destination.
- No public listing or public object access.
- Backup credentials must never enter frontend code.

## 4. Backup scope
The DR copy must represent the complete PostgreSQL database required to rebuild the financial system, not merely the seven browser-export arrays.

Account for financial/source tables, ledger, audit_log, restore_log, functions, triggers, policies, views, indexes, migration state, and required authentication/authorization configuration.

Secrets are recovered separately and are never embedded in the database backup.

The existing seven-array JSON export remains a logical application backup, not the complete DR source of truth.

## 5. Restore tiers
### Tier A — Database disaster recovery
Restore the offsite PostgreSQL backup into an isolated PostgreSQL/Supabase-compatible environment, then run integrity checks and application tests.

### Tier B — Application logical restore
Use the existing owner-authorized restore_center_data path for the seven supported source sections. Its validation, transactionality, financial guards, and shrink protection remain authoritative.

### Tier C — Browser export
Manual JSON export is a convenience/safety mechanism only; it is not the DR source of truth.

## 6. Safety requirements
Before production activation: restore a real offsite artifact into isolation; verify row counts, financial aggregates, ledger integrity, audit/restore logs, authorization, and no-production-mutation; record artifact ID and result.

## 7. Retention policy — pending Owner decision
Do not invent a retention period.

Recommended baseline for approval: daily 30 days; weekly 12 weeks; monthly 12 months; at least one immutable recovery point spanning a full monthly cycle.

## 8. Provider decision — pending Owner decision
No external provider is selected by this document.

Implementation gate: Provider + retention + encryption/immutability model + credential model approved → implement runner → isolated restore proof → production activation.

## 9. Production safety boundary
Until approval: Production remains READ-ONLY; no production backup secret or bucket is created; no scheduled production dump is enabled; no application UI/design/navigation changes are made.