#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# REAL-PATH integration test for the external-share model (manual / local).
# ---------------------------------------------------------------------------
# NOT wired into CI (no Postgres service there). Run it locally against a
# THROWAWAY Postgres 16 — Production is never touched. It applies the FULL repo
# migration chain, then drives the ACTUAL app RPCs (create_fee_obligations +
# post_receipt_with_allocations) and reads the ACTUAL views
# (student_statement_lines, financial_movements) to prove, across every layer:
#   - receipt 100 / external 40  → student sees 100, center 60, external 40
#   - the matrix 100/0, 100/40, 100/100
#   - reject 100 / external 120  (INVALID_FEE_PAYLOAD, no row written)
#   - the student layer (voucher value, allocation, remaining balance) is
#     independent of external_share (the statement view has no such column).
#
# Usage:
#   PGBIN=/usr/lib/postgresql/16/bin PG_RUNAS=pgtest bash external_share_layers.sh
#   (PG_RUNAS is the OS user to run the server as when the caller is root;
#    leave it empty to run psql/initdb directly as the current user.)
set -u
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PG_RUNAS="${PG_RUNAS:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/migrations"
BASE="${TMPDIR:-/tmp}/pgext_$$"
DATADIR="$BASE/data"; SOCK="$BASE/sock"; LOG="$BASE/pg.log"
DB=ext
OWNER='00000000-0000-0000-0000-0000000000aa'
if [ -n "$PG_RUNAS" ]; then run() { su "$PG_RUNAS" -c "$1"; }; else run() { bash -c "$1"; }; fi
runFP() { run "$PGBIN/psql -h $SOCK -U ${PG_RUNAS:-$USER} -X -qtA -d $DB -c \"$1\"" | tr -d '[:space:]'; }
FAILED=0
pass() { echo "   PASS: $1"; }
fail() { echo "   FAIL: $1"; FAILED=1; }
eq() { if [ "$2" = "$3" ]; then pass "$1 = $2"; else fail "$1 expected $3, got $2"; fi; }
rm -rf "$BASE"; mkdir -p "$DATADIR" "$SOCK"; [ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE"
PU="${PG_RUNAS:-$USER}"

run "$PGBIN/initdb -D $DATADIR -U $PU --auth=trust -E UTF8" >"$BASE/initdb.log" 2>&1 || { echo initdb FAIL; tail "$BASE/initdb.log"; exit 1; }
run "$PGBIN/pg_ctl -D $DATADIR -l $LOG -o '-c unix_socket_directories=$SOCK -c listen_addresses=\"\"' -w start" >/dev/null || { cat "$LOG"; exit 1; }
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d postgres -c \"do \\\$\\\$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname='postgres') then create role postgres superuser login; end if;
end \\\$\\\$;\"" || exit 1
run "$PGBIN/createdb -h $SOCK -U $PU $DB" || exit 1

# Minimal Supabase-compatible auth stub so is_owner() / RLS resolve locally.
cat > "$BASE/stubs.sql" <<SQL
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text, created_at timestamptz not null default now());
create or replace function auth.uid() returns uuid language sql stable as \$fn\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$fn\$;
create or replace function auth.jwt() returns jsonb language sql stable as \$fn\$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb \$fn\$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable() returns void language plpgsql as \$fn\$ begin end \$fn\$;
insert into auth.users (id, email) values ('$OWNER', 'owner@test.local');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/stubs.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/stubs.sql" || { echo stubs FAIL; exit 1; }

echo "== apply full migration chain =="
for f in $(ls -1 "$MIG"/*.sql | sort); do
  if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $f" >"$BASE/m.out" 2>&1; then
    echo ">>> migration FAILED: $(basename "$f")"; cat "$BASE/m.out"; exit 1
  fi
done
echo "   all migrations applied."

echo "== seed: 3 students + 3 courses + 3 enrollments =="
cat > "$BASE/seed.sql" <<SQL
set session_replication_role = replica;
insert into public.courses (id, name, status) values
  ('00000000-0000-0000-0000-0000000c0001','دورة أ','active'),
  ('00000000-0000-0000-0000-0000000c0002','دورة ب','active'),
  ('00000000-0000-0000-0000-0000000c0003','دورة ج','active');
insert into public.students (id, name, status) values
  ('00000000-0000-0000-0000-0000000a0001','طالب أ','active'),
  ('00000000-0000-0000-0000-0000000a0002','طالب ب','active'),
  ('00000000-0000-0000-0000-0000000a0003','طالب ج','active');
insert into public.enrollments (id, student_id, course_id, course_name, course_value) values
  ('00000000-0000-0000-0000-0000000e0001','00000000-0000-0000-0000-0000000a0001','00000000-0000-0000-0000-0000000c0001','دورة أ',500),
  ('00000000-0000-0000-0000-0000000e0002','00000000-0000-0000-0000-0000000a0002','00000000-0000-0000-0000-0000000c0002','دورة ب',500),
  ('00000000-0000-0000-0000-0000000e0003','00000000-0000-0000-0000-0000000a0003','00000000-0000-0000-0000-0000000c0003','دورة ج',500);
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/seed.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/seed.sql" || { echo seed FAIL; exit 1; }

make_fee() {  # $1 course $2 student $3 desc $4 amount $5 category $6 external
  cat > "$BASE/fee.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.create_fee_obligations('{"course_id":"$1","student_ids":["$2"],"description":"$3","amount":$4,"fee_category":"$5","external_share":$6}'::jsonb);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/fee.sql"
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/fee.sql" >"$BASE/fee.out" 2>&1
}
post_receipt() {  # $1 student $2 name $3 amount $4 key $5 fee_id
  cat > "$BASE/rcpt.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"$1","student_name":"$2","voucher_date":"2026-02-01","amount_received":$3,"payer_name":"$2","notes":"","idempotency_key":"$4","allocations":[{"type":"fee","fee_obligation_id":"$5","amount":$3}]}'::jsonb);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/rcpt.sql"
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/rcpt.sql" >"$BASE/rcpt.out" 2>&1
}

echo "== Case A: receipt 100 / external 0 (institute) =="
make_fee 00000000-0000-0000-0000-0000000c0001 00000000-0000-0000-0000-0000000a0001 "رسوم أ" 100 institute 0
FEEA=$(runFP "select id from public.fee_obligations where student_id='00000000-0000-0000-0000-0000000a0001' and description='رسوم أ'")
post_receipt 00000000-0000-0000-0000-0000000a0001 "طالب أ" 100 11111111-0000-0000-0000-000000000001 "$FEEA"
RVA=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEEA'")
eq "A receipt_vouchers.external_share"      "$(runFP "select external_share::int from public.receipt_vouchers where id='$RVA'")" "0"
eq "A receipt_vouchers.amount_received"     "$(runFP "select amount_received::int from public.receipt_vouchers where id='$RVA'")" "100"
eq "A financial_movements center(amt-ext)"  "$(runFP "select (amount-external_share)::int from public.financial_movements where id='$RVA'")" "100"

echo "== Case B: receipt 100 / external 40 (shared) — all layers =="
make_fee 00000000-0000-0000-0000-0000000c0002 00000000-0000-0000-0000-0000000a0002 "رسوم ب" 100 shared 40
FEEB=$(runFP "select id from public.fee_obligations where student_id='00000000-0000-0000-0000-0000000a0002' and description='رسوم ب'")
post_receipt 00000000-0000-0000-0000-0000000a0002 "طالب ب" 100 22222222-0000-0000-0000-000000000002 "$FEEB"
RVB=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEEB'")
eq "B receipt_vouchers.amount_received"      "$(runFP "select amount_received::int from public.receipt_vouchers where id='$RVB'")" "100"
eq "B receipt_vouchers.external_share"       "$(runFP "select external_share::int from public.receipt_vouchers where id='$RVB'")" "40"
eq "B receipt_allocations.amount"            "$(runFP "select amount::int from public.receipt_allocations where fee_obligation_id='$FEEB'")" "100"
eq "B receipt_allocations.external_share"    "$(runFP "select external_share::int from public.receipt_allocations where fee_obligation_id='$FEEB'")" "40"
eq "B student_statement_lines.amount_received"   "$(runFP "select amount_received::int from public.student_statement_lines where student_id='00000000-0000-0000-0000-0000000a0002' and fee_obligation_id='$FEEB'")" "100"
eq "B student_statement_lines.remaining_balance" "$(runFP "select remaining_balance::int from public.student_statement_lines where student_id='00000000-0000-0000-0000-0000000a0002' and fee_obligation_id='$FEEB'")" "0"
eq "B financial_movements.amount"            "$(runFP "select amount::int from public.financial_movements where id='$RVB'")" "100"
eq "B financial_movements.external_share"    "$(runFP "select external_share::int from public.financial_movements where id='$RVB'")" "40"
eq "B center (amount - external)"            "$(runFP "select (amount-external_share)::int from public.financial_movements where id='$RVB'")" "60"

echo "== Case C: receipt 100 / external 100 (external) =="
make_fee 00000000-0000-0000-0000-0000000c0003 00000000-0000-0000-0000-0000000a0003 "رسوم ج" 100 external 100
FEEC=$(runFP "select id from public.fee_obligations where student_id='00000000-0000-0000-0000-0000000a0003' and description='رسوم ج'")
post_receipt 00000000-0000-0000-0000-0000000a0003 "طالب ج" 100 33333333-0000-0000-0000-000000000003 "$FEEC"
RVC=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEEC'")
eq "C receipt_vouchers.external_share"       "$(runFP "select external_share::int from public.receipt_vouchers where id='$RVC'")" "100"
eq "C student_statement_lines.amount_received"   "$(runFP "select amount_received::int from public.student_statement_lines where student_id='00000000-0000-0000-0000-0000000a0003' and fee_obligation_id='$FEEC'")" "100"
eq "C center (amount - external)"            "$(runFP "select (amount-external_share)::int from public.financial_movements where id='$RVC'")" "0"

echo "== Reject: fee amount 100 / external 120 (external > amount) =="
make_fee 00000000-0000-0000-0000-0000000c0001 00000000-0000-0000-0000-0000000a0001 "رسوم مرفوضة" 100 shared 120
if grep -q "INVALID_FEE_PAYLOAD" "$BASE/fee.out"; then
  pass "external 120 > amount 100 rejected with INVALID_FEE_PAYLOAD"
else
  fail "external>amount NOT rejected"; sed 's/^/       /' "$BASE/fee.out"
fi
eq "Reject: no fee row was created" "$(runFP "select count(*)::int from public.fee_obligations where description='رسوم مرفوضة'")" "0"

echo "== Isolation: student_statement_lines exposes NO external_share =="
eq "student_statement_lines has external_share column" \
  "$(runFP "select count(*)::int from information_schema.columns where table_name='student_statement_lines' and column_name='external_share'")" "0"

echo "== Aggregate over financial_movements (receipts only) =="
eq "total gross in"                  "$(runFP "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='receipt'")" "300"
eq "total external held"             "$(runFP "select coalesce(sum(external_share),0)::int from public.financial_movements where movement_type='receipt'")" "140"
eq "center receipts (Σ amount-ext)"  "$(runFP "select coalesce(sum(amount-external_share),0)::int from public.financial_movements where movement_type='receipt'")" "160"

run "$PGBIN/pg_ctl -D $DATADIR -w stop" >/dev/null 2>&1
rm -rf "$BASE"
echo
if [ "$FAILED" = "0" ]; then echo "=============== ALL LAYER ASSERTIONS PASSED ==============="; else echo "=============== SOME ASSERTIONS FAILED ==============="; exit 1; fi
