#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Financial runtime guard-gap suite (throwaway PostgreSQL only).
# Complements external_share_layers.sh with the invariants that the original
# TEST-001 audit called out but the broad harness did not exercise explicitly.
# Production is never touched.
# ---------------------------------------------------------------------------
set -euo pipefail

PGBIN="${PGBIN:-/usr/bin}"
PG_RUNAS="${PG_RUNAS:-}"
USER="${USER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/migrations"
BASE="${TMPDIR:-/tmp}/pgfinancial_guards_$$"
DATADIR="$BASE/data"
SOCK="$BASE/sock"
LOG="$BASE/pg.log"
DB=guards
OWNER='00000000-0000-0000-0000-0000000000aa'
NON_OWNER='00000000-0000-0000-0000-0000000000bb'

if [ -n "$PG_RUNAS" ]; then
  run() { su "$PG_RUNAS" -c "$1"; }
else
  run() { bash -c "$1"; }
fi

PU="${PG_RUNAS:-$USER}"
PSQL="$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB"
run_sql() { run "$PSQL -v ON_ERROR_STOP=1 -f '$1'"; }
query() { run "$PSQL -qtA -c \"$1\"" | tr -d '[:space:]'; }
assert_query_eq() {
  local label="$1" sql="$2" expected="$3" actual
  actual="$(query "$sql")"
  if [ "$actual" != "$expected" ]; then
    echo "FAIL: $label expected=$expected actual=$actual"
    exit 1
  fi
}

cleanup() {
  run "$PGBIN/pg_ctl -D $DATADIR -w stop" >/dev/null 2>&1 || true
  rm -rf "$BASE"
}
trap cleanup EXIT

rm -rf "$BASE"
mkdir -p "$DATADIR" "$SOCK"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE"

run "$PGBIN/initdb -D $DATADIR -U $PU --auth=trust -E UTF8" >"$BASE/initdb.log" 2>&1
run "$PGBIN/pg_ctl -D $DATADIR -l $LOG -o '-c unix_socket_directories=$SOCK -c listen_addresses=\"\"' -w start" >/dev/null
cat > "$BASE/roles.sql" <<'SQL'
do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end
$$;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/roles.sql"
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d postgres -f '$BASE/roles.sql'"
run "$PGBIN/createdb -h $SOCK -U $PU $DB"

cat > "$BASE/stubs.sql" <<SQL
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);
create or replace function auth.uid()
returns uuid
language sql stable
as \$fn\$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
\$fn\$;
create or replace function auth.jwt()
returns jsonb
language sql stable
as \$fn\$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
\$fn\$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable()
returns void
language plpgsql
as \$fn\$
begin
end
\$fn\$;
insert into auth.users (id, email) values
  ('$OWNER', 'owner@test.local')
on conflict (id) do nothing;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/stubs.sql"
run_sql "$BASE/stubs.sql"

echo "== apply full migration chain =="
while IFS= read -r -d '' f; do
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$f'"
done < <(find "$MIG" -maxdepth 1 -type f -name '*.sql' -print0 | sort -z)
echo "   all migrations applied."

# The real migrations normally establish this from auth.users. Keep the fixture
# explicit so the test remains deterministic even if that bootstrap policy changes.
cat > "$BASE/owner.sql" <<SQL
insert into public.owner_identity (id) values ('$OWNER')
on conflict (id) do nothing;
set session_replication_role = replica;
insert into public.courses (id, name, status, base_fee)
values ('00000000-0000-0000-0000-0000000c1001', 'دورة اختبار الحواجز', 'active', 50);
insert into public.students (id, name, status)
values ('00000000-0000-0000-0000-0000000a1001', 'طالب اختبار الحواجز', 'active');
insert into public.enrollments (id, student_id, course_id, course_name, course_value)
values (
  '00000000-0000-0000-0000-0000000e1001',
  '00000000-0000-0000-0000-0000000a1001',
  '00000000-0000-0000-0000-0000000c1001',
  'دورة اختبار الحواجز',
  50
);
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/owner.sql"
run_sql "$BASE/owner.sql"

STUDENT='00000000-0000-0000-0000-0000000a1001'
ENROLLMENT='00000000-0000-0000-0000-0000000e1001'

make_fee() {  # course student description amount category external
  cat > "$BASE/fee.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.create_fee_obligations('{"course_id":"$1","student_ids":["$2"],"description":"$3","amount":$4,"fee_category":"$5","external_share":$6}'::jsonb);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/fee.sql"
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/fee.sql"
}
post_receipt() {
  local amount="$1" key="$2" fee_id="$3" extra="${4:-}"
  cat > "$BASE/post_receipt.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations(
  jsonb_build_object(
    'student_id', '$STUDENT'::uuid,
    'student_name', 'طالب اختبار الحواجز',
    'voucher_date', '2026-02-03',
    'amount_received', $amount,
    'payer_name', 'اختبار',
    'notes', '',
    'idempotency_key', '$key'::uuid,
    'allocations', $extra
  )
);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/post_receipt.sql"
  run_sql "$BASE/post_receipt.sql"
}

echo "== Guard G1: duplicate fee allocation is rejected before any write =="
make_fee '00000000-0000-0000-0000-0000000c1001' "$STUDENT" 'رسوم التخصيص المكرر' 50 institute 0
FEE_DUP="$(query "select id from public.fee_obligations where description='رسوم التخصيص المكرر'")"
cat > "$BASE/dup_fee.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations(
  jsonb_build_object(
    'student_id', '$STUDENT'::uuid,
    'student_name', 'طالب اختبار الحواجز',
    'voucher_date', '2026-02-03',
    'amount_received', 50,
    'payer_name', 'اختبار',
    'notes', '',
    'idempotency_key', '90000000-0000-0000-0000-000000000001'::uuid,
    'allocations', jsonb_build_array(
      jsonb_build_object('type','fee','fee_obligation_id','$FEE_DUP'::uuid,'amount',25),
      jsonb_build_object('type','fee','fee_obligation_id','$FEE_DUP'::uuid,'amount',25)
    )
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/dup_fee.sql"
if run_sql "$BASE/dup_fee.sql" >"$BASE/dup_fee.out" 2>&1; then
  echo "FAIL: duplicate fee allocation was accepted"; exit 1
fi
grep -q 'DUPLICATE_FEE_ALLOCATION' "$BASE/dup_fee.out"
assert_query_eq "duplicate fee receipt count" "select count(*) from public.receipt_vouchers where idempotency_key='90000000-0000-0000-0000-000000000001'" "0"
assert_query_eq "duplicate fee allocation sum" "select coalesce(sum(amount),0) from public.receipt_allocations where fee_obligation_id='$FEE_DUP'" "0"
echo "   PASS: duplicate fee allocation rejected atomically"

echo "== Guard G2: duplicate course allocation is rejected before any write =="
cat > "$BASE/dup_course.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations(
  jsonb_build_object(
    'student_id', '$STUDENT'::uuid,
    'student_name', 'طالب اختبار الحواجز',
    'voucher_date', '2026-02-03',
    'amount_received', 50,
    'payer_name', 'اختبار',
    'notes', '',
    'idempotency_key', '90000000-0000-0000-0000-000000000002'::uuid,
    'allocations', jsonb_build_array(
      jsonb_build_object('type','course','enrollment_id','$ENROLLMENT'::uuid,'amount',25),
      jsonb_build_object('type','course','enrollment_id','$ENROLLMENT'::uuid,'amount',25)
    )
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/dup_course.sql"
if run_sql "$BASE/dup_course.sql" >"$BASE/dup_course.out" 2>&1; then
  echo "FAIL: duplicate course allocation was accepted"; exit 1
fi
grep -q 'DUPLICATE_ENROLLMENT_ALLOCATION' "$BASE/dup_course.out"
assert_query_eq "duplicate course receipt count" "select count(*) from public.receipt_vouchers where idempotency_key='90000000-0000-0000-0000-000000000002'" "0"
assert_query_eq "duplicate course allocation sum" "select coalesce(sum(amount),0) from public.receipt_allocations where enrollment_id='$ENROLLMENT'" "0"
echo "   PASS: duplicate course allocation rejected atomically"

echo "== Guard G3: derived external split preserves fractional runtime value exactly =="
make_fee '00000000-0000-0000-0000-0000000c1001' "$STUDENT" 'رسوم الكسر' 100 shared 33
FEE_FRAC="$(query "select id from public.fee_obligations where description='رسوم الكسر'")"

cat > "$BASE/frac_one.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations(
  jsonb_build_object(
    'student_id', '$STUDENT'::uuid,
    'student_name', 'طالب اختبار الحواجز',
    'voucher_date', '2026-02-03',
    'amount_received', 1,
    'payer_name', 'اختبار',
    'notes', '',
    'idempotency_key', '90000000-0000-0000-0000-000000000003'::uuid,
    'allocations', jsonb_build_array(
      jsonb_build_object('type','fee','fee_obligation_id','$FEE_FRAC'::uuid,'amount',1)
    )
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/frac_one.sql"
run_sql "$BASE/frac_one.sql" >/dev/null
FRAC_R1="$(query "select ra.external_share::numeric from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where rv.idempotency_key='90000000-0000-0000-0000-000000000003'")"
assert_query_eq "fractional external share for 1" "select ra.external_share::numeric from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where rv.idempotency_key='90000000-0000-0000-0000-000000000003'" "0.33"

cat > "$BASE/frac_two.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations(
  jsonb_build_object(
    'student_id', '$STUDENT'::uuid,
    'student_name', 'طالب اختبار الحواجز',
    'voucher_date', '2026-02-03',
    'amount_received', 99,
    'payer_name', 'اختبار',
    'notes', '',
    'idempotency_key', '90000000-0000-0000-0000-000000000004'::uuid,
    'allocations', jsonb_build_array(
      jsonb_build_object('type','fee','fee_obligation_id','$FEE_FRAC'::uuid,'amount',99)
    )
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/frac_two.sql"
run_sql "$BASE/frac_two.sql" >/dev/null
FRAC_R2="$(query "select ra.external_share::numeric from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where rv.idempotency_key='90000000-0000-0000-0000-000000000004'")"
FRAC_TOTAL="$(query "select coalesce(sum(amount),0)::numeric from public.receipt_allocations where fee_obligation_id='$FEE_FRAC'")"
FRAC_EXT="$(query "select coalesce(sum(external_share),0)::numeric from public.receipt_allocations where fee_obligation_id='$FEE_FRAC'")"
assert_query_eq "fractional external share for 99" "select ra.external_share::numeric from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where rv.idempotency_key='90000000-0000-0000-0000-000000000004'" "32.67"
assert_query_eq "fractional allocation gross" "select coalesce(sum(amount),0)::numeric from public.receipt_allocations where fee_obligation_id='$FEE_FRAC'" "100"
assert_query_eq "fractional external total" "select coalesce(sum(external_share),0)::numeric from public.receipt_allocations where fee_obligation_id='$FEE_FRAC'" "33"
echo "   PASS: fractional split 0.33 + 32.67 = 33.00 with exact conservation"

echo "== Guard G4: direct receipt insert is rejected outside the posting RPC =="
DIRECT_KEY='90000000-0000-0000-0000-000000000005'
cat > "$BASE/direct_receipt.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '$OWNER';
select set_config('app.receipt_posting','off',true);
insert into public.receipt_vouchers
  (voucher_date, student_id, student_name_snapshot, course_name, course_value,
   amount_received, payer_name, notes, fee_category, external_share,
   allocation_mode, idempotency_key)
values
  ('2026-02-03', '$STUDENT'::uuid, 'طالب اختبار الحواجز', 'تجاوز مباشر',
   50, 1, 'اختبار مباشر', '', null, 0, false, '$DIRECT_KEY'::uuid);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/direct_receipt.sql"
if run_sql "$BASE/direct_receipt.sql" >"$BASE/direct_receipt.out" 2>&1; then
  echo "FAIL: direct receipt insert bypassed the posting RPC"; exit 1
fi
if ! grep -Eq 'RECEIPT_POSTING_RPC_REQUIRED|permission denied' "$BASE/direct_receipt.out"; then
  echo "FAIL: direct receipt insert failed for an unexpected reason"; cat "$BASE/direct_receipt.out"; exit 1
fi
assert_query_eq "direct receipt count" "select count(*) from public.receipt_vouchers where idempotency_key='$DIRECT_KEY'" "0"
echo "   PASS: direct receipt insert cannot create a financial row"

echo "== Guard G5: non-owner receipt RPC is denied =="
cat > "$BASE/non_owner_receipt.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '$NON_OWNER';
select public.post_receipt_with_allocations(
  jsonb_build_object(
    'student_id', '$STUDENT'::uuid,
    'student_name', 'طالب اختبار الحواجز',
    'voucher_date', '2026-02-03',
    'amount_received', 1,
    'payer_name', 'غير المالك',
    'notes', '',
    'idempotency_key', '90000000-0000-0000-0000-000000000006'::uuid,
    'allocations', jsonb_build_array(
      jsonb_build_object('type','fee','fee_obligation_id','$FEE_DUP'::uuid,'amount',1)
    )
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/non_owner_receipt.sql"
if run_sql "$BASE/non_owner_receipt.sql" >"$BASE/non_owner_receipt.out" 2>&1; then
  echo "FAIL: non-owner receipt RPC was accepted"; exit 1
fi
grep -q 'OWNER_ONLY' "$BASE/non_owner_receipt.out"
assert_query_eq "non-owner receipt count" "select count(*) from public.receipt_vouchers where idempotency_key='90000000-0000-0000-0000-000000000006'" "0"
echo "   PASS: non-owner receipt RPC denied"

echo "== Guard G6: fractional receipt remains internally conserved at receipt level =="
FRAC_GROSS="$(query "select coalesce(sum(amount),0)::numeric from public.financial_movements where id in (select id from public.receipt_vouchers where idempotency_key in ('90000000-0000-0000-0000-000000000003','90000000-0000-0000-0000-000000000004'))")"
FRAC_CENTER="$(query "select coalesce(sum(amount-external_share),0)::numeric from public.financial_movements where id in (select id from public.receipt_vouchers where idempotency_key in ('90000000-0000-0000-0000-000000000003','90000000-0000-0000-0000-000000000004'))")"
[ "$FRAC_GROSS" = "100" ]
[ "$FRAC_CENTER" = "67" ]
echo "   PASS: fractional receipts conserve gross 100 and center 67"

echo "=============== FINANCIAL GUARD-GAP SUITE PASSED ==============="
