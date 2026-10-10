#!/usr/bin/env bash
# Real PostgreSQL integration test for ADR-0080 monthly course billing.
# Uses a disposable local PostgreSQL instance and applies the complete migration chain.
set -euo pipefail

PGBIN="${PGBIN:-/usr/lib/postgresql/17/bin}"
PG_RUNAS="${PG_RUNAS:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/migrations"
BASE="${TMPDIR:-/tmp}/pgmonthly_$$"
DATADIR="$BASE/data"
SOCK="$BASE/sock"
LOG="$BASE/pg.log"
DB=monthly_test
OWNER='00000000-0000-0000-0000-0000000000aa'
COURSE='00000000-0000-0000-0000-0000000c0004'
LEGACY_STUDENT='00000000-0000-0000-0000-0000000a0001'
MONTHLY_STUDENT='00000000-0000-0000-0000-0000000a0002'
OTHER_MONTHLY_STUDENT='00000000-0000-0000-0000-0000000a0003'
FAILED=0

if [ -n "$PG_RUNAS" ]; then
  run() { su "$PG_RUNAS" -c "$1"; }
else
  run() { bash -c "$1"; }
fi
pass() { echo "   PASS: $1"; }
fail() { echo "   FAIL: $1"; FAILED=1; }
eq() {
  if [ "$2" = "$3" ]; then pass "$1 = $2"; else fail "$1 expected $3, got $2"; fi
}
run_file() {
  run "$PGBIN/psql -h $SOCK -U ${PG_RUNAS:-$USER} -v ON_ERROR_STOP=1 -X -q -t -A -d $DB -f $1"
}
runFP() {
  printf '%s;\n' "$1" > "$BASE/query.sql"
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/query.sql"
  run_file "$BASE/query.sql" | tr -d '[:space:]'
}
run_owner_sql() {
  cat > "$BASE/owner.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
$1
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/owner.sql"
  run_file "$BASE/owner.sql"
}
run_owner_fp() {
  printf "set request.jwt.claim.sub = '%s';\n%s;\n" "$OWNER" "$1" > "$BASE/owner_query.sql"
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/owner_query.sql"
  run_file "$BASE/owner_query.sql" | tr -d '[:space:]'
}

rm -rf "$BASE"
mkdir -p "$DATADIR" "$SOCK"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE"
PU="${PG_RUNAS:-$USER}"

run "$PGBIN/initdb -D $DATADIR -U $PU --auth=trust -E UTF8" > "$BASE/initdb.log" 2>&1 || {
  echo "initdb failed"; cat "$BASE/initdb.log"; exit 1;
}
run "$PGBIN/pg_ctl -D $DATADIR -l $LOG -o '-c unix_socket_directories=$SOCK -c listen_addresses=\\\"\\\"' -w start" >/dev/null || {
  cat "$LOG"; exit 1;
}

cat > "$BASE/roles.sql" <<'SQL'
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/roles.sql"
run "$PGBIN/createdb -h $SOCK -U $PU $DB"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/roles.sql"

cat > "$BASE/stubs.sql" <<SQL
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);
create or replace function auth.uid() returns uuid
language sql stable as \$fn\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$fn\$;
create or replace function auth.jwt() returns jsonb
language sql stable as \$fn\$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb \$fn\$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable() returns void
language plpgsql as \$fn\$ begin end \$fn\$;
insert into auth.users (id, email) values ('$OWNER', 'owner@test.local');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/stubs.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/stubs.sql"

echo "== Apply complete migration chain to disposable PostgreSQL =="
for f in $(ls -1 "$MIG"/*.sql | sort); do
  if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $f" > "$BASE/migration.out" 2>&1; then
    echo ">>> migration FAILED: $(basename "$f")"
    cat "$BASE/migration.out"
    exit 1
  fi
done
pass "all repository migrations applied in order"

echo "== Seed a legacy enrollment and a monthly-priced course =="
cat > "$BASE/seed.sql" <<SQL
set session_replication_role = replica;
insert into public.courses (id, name, base_fee, monthly_fee, status)
values ('$COURSE', 'دورة اختبار الرسوم الشهرية', 500, 250, 'active');
insert into public.students (id, name, status) values
  ('$LEGACY_STUDENT', 'طالب رسوم تسجيل قديم', 'active'),
  ('$MONTHLY_STUDENT', 'طالب رسوم شهرية', 'active'),
  ('$OTHER_MONTHLY_STUDENT', 'طالب اشتراك آخر', 'active');
insert into public.enrollments (id, student_id, course_id, course_name, course_value, billing_model)
values ('00000000-0000-0000-0000-0000000e0004',
        '$LEGACY_STUDENT', '$COURSE', 'دورة اختبار الرسوم الشهرية', 500, 'legacy_total');
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/seed.sql"
run_file "$BASE/seed.sql"

echo "== Create monthly enrollment through the real owner RPC =="
run_owner_sql "select public.create_enrollment('{\"student_id\":\"$MONTHLY_STUDENT\",\"course_id\":\"$COURSE\"}'::jsonb);" > "$BASE/enrollment.out"
if grep -q '"billing_model": "monthly"' "$BASE/enrollment.out"; then
  pass "create_enrollment creates an explicit monthly enrollment"
else
  fail "create_enrollment did not return monthly billing model"
  cat "$BASE/enrollment.out"
fi
eq "Exactly one monthly enrollment exists" "$(runFP "select count(*) from public.enrollments where course_id='$COURSE' and billing_model='monthly'")" "1"
eq "Legacy enrollment remains legacy_total" "$(runFP "select count(*) from public.enrollments where course_id='$COURSE' and billing_model='legacy_total'")" "1"
MONTHLY_ENROLLMENT_ID="$(runFP "select id from public.enrollments where student_id='$MONTHLY_STUDENT' and course_id='$COURSE' and billing_model='monthly'")"

echo "== Preview must exclude legacy registration-fee enrollments =="
PREVIEW_COUNT="$(run_owner_fp "select (public.preview_monthly_course_obligations('$COURSE', date '2099-10-01', 'shared', 50)->>'eligible_count')::int")"
eq "Preview eligible count excludes legacy enrollment" "$PREVIEW_COUNT" "1"
PREVIEW_NEW="$(run_owner_fp "select (public.preview_monthly_course_obligations('$COURSE', date '2099-10-01', 'shared', 50)->>'to_create_count')::int")"
eq "Preview shows one new obligation" "$PREVIEW_NEW" "1"

echo "== Create monthly obligations, then retry for idempotency =="
CREATED="$(run_owner_fp "select (public.create_monthly_course_obligations('$COURSE', date '2099-10-01', 'shared', 50)->>'created')::int")"
eq "First monthly generation creates one obligation" "$CREATED" "1"
CREATED_RETRY="$(run_owner_fp "select (public.create_monthly_course_obligations('$COURSE', date '2099-10-01', 'shared', 50)->>'created')::int")"
eq "Second monthly generation creates no duplicate" "$CREATED_RETRY" "0"
eq "No monthly obligation is created for legacy enrollment" "$(runFP "select count(*) from public.fee_obligations where enrollment_id='00000000-0000-0000-0000-0000000e0004' and fee_kind='monthly_course'")" "0"

echo "== Adjust one student's monthly subscription without rewriting history =="
run_owner_sql "select public.update_monthly_enrollment_fee('$MONTHLY_ENROLLMENT_ID', 180, 'individual rate');" >/dev/null
eq "Existing October obligation remains at its original amount" "$(runFP "select amount::int from public.fee_obligations where enrollment_id='$MONTHLY_ENROLLMENT_ID' and fee_kind='monthly_course' and due_month=date '2099-10-01'")" "250"
run_owner_sql "select public.create_enrollment('{\\"student_id\\":\\"$OTHER_MONTHLY_STUDENT\\",\\"course_id\\":\\"$COURSE\\"}'::jsonb);" >/dev/null
OTHER_ENROLLMENT_ID="$(runFP "select id from public.enrollments where student_id='$OTHER_MONTHLY_STUDENT' and course_id='$COURSE' and billing_model='monthly'")"
NEXT_PREVIEW="$(run_owner_fp "select ((public.preview_monthly_course_obligations('$COURSE', date '2099-11-01', 'shared', 50)->'students'->0->>'amount')::int)")"
eq "Future preview uses the student's override" "$NEXT_PREVIEW" "180"
NEXT_CREATED="$(run_owner_fp "select (public.create_monthly_course_obligations('$COURSE', date '2099-11-01', 'shared', 50)->>'created')::int")"
eq "Future generation creates the overridden monthly amount" "$NEXT_CREATED" "1"
eq "New November obligation uses the student's override" "$(runFP "select amount::int from public.fee_obligations where enrollment_id='$MONTHLY_ENROLLMENT_ID' and fee_kind='monthly_course' and due_month=date '2099-11-01'")" "180"
eq "Other monthly students retain the course default" "$(runFP "select count(*) from public.enrollments where course_id='$COURSE' and billing_model='monthly' and student_id<>'$MONTHLY_STUDENT' and monthly_fee_override is null")" "0"

FEE_ID="$(runFP "select id from public.fee_obligations where course_id='$COURSE' and fee_kind='monthly_course' and due_month=date '2099-10-01'")"
eq "Monthly fee amount is the full configured monthly price" "$(runFP "select amount::int from public.fee_obligations where id='$FEE_ID'")" "250"
eq "Monthly fee keeps recipient split independent from fee kind" "$(runFP "select count(*) from public.fee_obligations where id='$FEE_ID' and fee_category='shared' and external_share=50 and fee_kind='monthly_course'")" "1"

echo "== Collect the monthly fee through the real receipt RPC =="
cat > "$BASE/receipt.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations(
  '{"student_id":"$MONTHLY_STUDENT","student_name":"طالب رسوم شهرية","voucher_date":"2099-10-01","amount_received":250,"payer_name":"طالب رسوم شهرية","notes":"monthly-fee integration test","idempotency_key":"99999999-0000-0000-0000-000000000010","allocations":[{"type":"fee","fee_obligation_id":"$FEE_ID","amount":250}]}'::jsonb
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/receipt.sql"
run_file "$BASE/receipt.sql" > "$BASE/receipt.out"
RECEIPT_ID="$(runFP "select id from public.receipt_vouchers where idempotency_key='99999999-0000-0000-0000-000000000010'")"
eq "Receipt posted once" "$(runFP "select count(*) from public.receipt_vouchers where idempotency_key='99999999-0000-0000-0000-000000000010'")" "1"
eq "Receipt allocation settles the monthly fee" "$(runFP "select count(*) from public.receipt_allocations where receipt_voucher_id='$RECEIPT_ID' and fee_obligation_id='$FEE_ID' and amount=250 and external_share=50")" "1"
eq "Student statement shows full payment and zero balance" "$(runFP "select count(*) from public.student_statement_lines where student_id='$MONTHLY_STUDENT' and fee_obligation_id='$FEE_ID' and amount_received=250 and remaining_balance=0")" "1"
eq "Financial movements conserve gross, external, and center amounts" "$(runFP "select count(*) from public.financial_movements where id='$RECEIPT_ID' and amount=250 and external_share=50 and amount-external_share=200")" "1"

echo "== Verify owner-only guard on monthly generation =="
cat > "$BASE/non_owner.sql" <<SQL
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000099';
select public.create_monthly_course_obligations('$COURSE', date '2099-11-01', 'institute', 0);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/non_owner.sql"
if run_file "$BASE/non_owner.sql" > "$BASE/non_owner.out" 2>&1; then
  fail "non-owner was allowed to create monthly obligations"
else
  if grep -q "OWNER_ONLY" "$BASE/non_owner.out"; then pass "non-owner monthly generation rejected"; else fail "non-owner rejected for an unexpected reason"; cat "$BASE/non_owner.out"; fi
fi
eq "Unauthorized call created no November obligation" "$(runFP "select count(*) from public.fee_obligations where course_id='$COURSE' and fee_kind='monthly_course' and due_month=date '2099-11-01'")" "0"

run "$PGBIN/pg_ctl -D $DATADIR -m fast -w stop" >/dev/null || true
rm -rf "$BASE"
if [ "$FAILED" -ne 0 ]; then
  echo "Monthly course fee integration tests FAILED"
  exit 1
fi
echo "All monthly course fee integration tests passed."
