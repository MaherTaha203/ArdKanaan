#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# REAL-PATH concurrency + growth/performance integration test.
# THROWAWAY PostgreSQL only. Never targets Supabase Production.
# ---------------------------------------------------------------------------
set -u
PGBIN="${PGBIN:-/usr/bin}"
PG_RUNAS="${PG_RUNAS:-}"
USER="${USER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/migrations"
BASE="${TMPDIR:-/tmp}/pgconcurrency_growth_$$"
DATADIR="$BASE/data"; SOCK="$BASE/sock"; LOG="$BASE/pg.log"
DB=growth
OWNER='00000000-0000-0000-0000-0000000000aa'
FAILED=0
if [ -n "$PG_RUNAS" ]; then run() { su "$PG_RUNAS" -c "$1"; }; else run() { bash -c "$1"; }; fi
PU="${PG_RUNAS:-$USER}"
runFP() { run "$PGBIN/psql -h $SOCK -U $PU -X -qtA -d $DB -c \"$1\"" | tr -d '[:space:]'; }
runText() { run "$PGBIN/psql -h $SOCK -U $PU -X -qtA -d $DB -c \"$1\"" | sed -e '/^[[:space:]]*$/d'; }
pass(){ echo "   PASS: $1"; }
fail(){ echo "   FAIL: $1"; FAILED=1; }
eq(){ if [ "$2" = "$3" ]; then pass "$1 = $2"; else fail "$1 expected $3, got $2"; fi; }
cleanup(){ run "$PGBIN/pg_ctl -D $DATADIR -w stop" >/dev/null 2>&1 || true; rm -rf "$BASE"; }
trap cleanup EXIT

rm -rf "$BASE"; mkdir -p "$DATADIR" "$SOCK"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE"
run "$PGBIN/initdb -D $DATADIR -U $PU --auth=trust -E UTF8" >"$BASE/initdb.log" 2>&1 || { cat "$BASE/initdb.log"; exit 1; }
run "$PGBIN/pg_ctl -D $DATADIR -l $LOG -o '-c unix_socket_directories=$SOCK -c listen_addresses=\"\"' -w start" >/dev/null || { cat "$LOG"; exit 1; }
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d postgres -c \"do \\\$\\\$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end \\\$\\\$;\"" || exit 1
run "$PGBIN/createdb -h $SOCK -U $PU $DB" || exit 1

cat > "$BASE/stubs.sql" <<SQL
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text, created_at timestamptz not null default now());
create or replace function auth.uid() returns uuid language sql stable as \$fn\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$fn\$;
create or replace function auth.jwt() returns jsonb language sql stable as \$fn\$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb \$fn\$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable() returns void language plpgsql as \$fn\$ begin end \$fn\$;
insert into auth.users (id,email) values ('$OWNER','owner@test.local');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/stubs.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/stubs.sql" || exit 1

echo "== apply full migration chain =="
for f in $(ls -1 "$MIG"/*.sql | sort); do
  if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $f" >$BASE/m.out 2>&1; then
    echo ">>> migration FAILED: $(basename "$f")"; cat "$BASE/m.out"; exit 1
  fi
done
echo "   all migrations applied."

echo "== seed 10 courses + 20000 students/enrollments =="
cat > "$BASE/seed.sql" <<'SQL'
set session_replication_role = replica;
insert into public.courses (id,name,status)
select ('00000000-0000-0000-0000-' || lpad(to_hex(2000000000+i),12,'0'))::uuid,
       'Growth Course '||i, 'active'
from generate_series(1,10) g(i);
insert into public.students (id,name,status)
select ('00000000-0000-0000-0000-' || lpad(to_hex(1000000000+i),12,'0'))::uuid,
       'Growth Student '||i, 'active'
from generate_series(1,100000) g(i);
insert into public.enrollments (id,student_id,course_id,course_name,course_value)
select ('00000000-0000-0000-0000-' || lpad(to_hex(3000000000+i),12,'0'))::uuid,
       ('00000000-0000-0000-0000-' || lpad(to_hex(1000000000+i),12,'0'))::uuid,
       ('00000000-0000-0000-0000-' || lpad(to_hex(2000000000+((i-1)%10)+1),12,'0'))::uuid,
       'Growth Course '||(((i-1)%10)+1), 100
from generate_series(1,100000) g(i);
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/seed.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/seed.sql" || exit 1
eq "student volume" "$(runFP "select count(*) from public.students where name like 'Growth Student %'")" "100000"
eq "enrollment volume" "$(runFP "select count(*) from public.enrollments where course_name like 'Growth Course %'")" "100000"

echo "== create 20000 fee obligations through actual RPC =="
cat > "$BASE/fees.sql" <<SQL
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select public.create_fee_obligations(
  jsonb_build_object(
    'course_id',(select id from public.courses where name='Growth Course 1' limit 1),
    'student_ids',(select jsonb_agg(id order by id) from public.students where name like 'Growth Student %'),
    'description','Growth fee',
    'amount',50,
    'fee_category','institute',
    'external_share',0
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/fees.sql"
if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/fees.sql" >"$BASE/fees.out" 2>&1; then
  fail "bulk fee creation via actual RPC"; cat "$BASE/fees.out"
fi
eq "fee volume" "$(runFP "select count(*) from public.fee_obligations where description='Growth fee'")" "100000"

echo "== CONCURRENCY C1: 10 receipts race on the SAME fee (50 total capacity) =="
FEE=$(runFP "select id from public.fee_obligations where description='Growth fee' order by id limit 1")
STUDENT=$(runFP "select student_id from public.fee_obligations where id='$FEE'")
STUDENT_NAME=$(runText "select name from public.students where id='$STUDENT'")
echo "   race fixture: student=$STUDENT name=$STUDENT_NAME fee=$FEE"
mkdir -p "$BASE/race_receipts"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE/race_receipts"
for i in $(seq 1 10); do
  key=$(printf 'c1000000-0000-0000-0000-%012d' "$i")
  cat > "$BASE/race_receipts/$i.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"$STUDENT","student_name":"$STUDENT_NAME","voucher_date":"2026-02-01","amount_received":10,"payer_name":"Race","notes":"","idempotency_key":"$key","allocations":[{"type":"fee","fee_obligation_id":"$FEE","amount":10}]}'::jsonb);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/race_receipts/$i.sql"
done
start=$(date +%s%N)
for i in $(seq 1 10); do
  (run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/race_receipts/$i.sql' >'$BASE/race_receipts/$i.out' 2>&1"; echo $? > "$BASE/race_receipts/$i.rc") &
done
wait
elapsed_ms=$((($(date +%s%N)-start)/1000000))
successes=0; failures=0
for i in $(seq 1 10); do
  rc=$(cat "$BASE/race_receipts/$i.rc")
  if [ "$rc" = "0" ]; then successes=$((successes+1)); else failures=$((failures+1)); fi
done
echo "   receipt race wall time: ${elapsed_ms} ms; successes=$successes failures=$failures"
if [ "$failures" -gt 0 ]; then
  echo "   first concurrent receipt errors:"
  for i in 1 2 3; do echo "--- receipt $i ---"; sed -n "1,12p" "$BASE/race_receipts/$i.out" 2>/dev/null || true; done
fi
eq "receipt race total outcomes" "$((successes+failures))" "10"
eq "receipt race settled amount" "$(runFP "select coalesce(sum(amount),0)::int from public.receipt_allocations where fee_obligation_id='$FEE'")" "50"
eq "receipt race successful calls" "$successes" "5"
eq "receipt race rejected calls" "$failures" "5"
eq "receipt race cannot exceed fee" "$(runFP "select case when coalesce(sum(amount),0) <= 50 then 1 else 0 end from public.receipt_allocations where fee_obligation_id='$FEE'")" "1"
eq "receipt race row count matches successful calls" "$(runFP "select count(*) from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEE'")" "$successes"

echo "== CONCURRENCY C2: 10 identical payment idempotency requests race =="
PAYKEY='c2aaaaaa-0000-0000-0000-000000000001'
mkdir -p "$BASE/race_payment"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE/race_payment"
for i in $(seq 1 10); do
  cat > "$BASE/race_payment/$i.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_payment_voucher('{"voucher_date":"2026-02-01","expense_type":"concurrent-idempotent","amount":7,"notes":"","idempotency_key":"$PAYKEY"}'::jsonb);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/race_payment/$i.sql"
done
for i in $(seq 1 10); do
  (run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/race_payment/$i.sql' >'$BASE/race_payment/$i.out' 2>&1"; echo $? > "$BASE/race_payment/$i.rc") &
done
wait
eq "same-key concurrent payment creates one row" "$(runFP "select count(*) from public.payment_vouchers where idempotency_key='$PAYKEY'")" "1"

echo "== CONCURRENCY C3: 10 independent payments race =="
mkdir -p "$BASE/race_distinct_payments"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE/race_distinct_payments"
for i in $(seq 1 10); do
  key=$(printf 'c3bbbbbb-0000-0000-0000-%012d' "$i")
  cat > "$BASE/race_distinct_payments/$i.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_payment_voucher('{"voucher_date":"2026-02-01","expense_type":"concurrent-independent","amount":1,"notes":"","idempotency_key":"$key"}'::jsonb);
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/race_distinct_payments/$i.sql"
done
for i in $(seq 1 10); do
  (run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/race_distinct_payments/$i.sql' >'$BASE/race_distinct_payments/$i.out' 2>&1"; echo $? > "$BASE/race_distinct_payments/$i.rc") &
done
wait
independent_ok=0
for i in $(seq 1 10); do [ "$(cat "$BASE/race_distinct_payments/$i.rc")" = "0" ] && independent_ok=$((independent_ok+1)); done
eq "independent payment race successes" "$independent_ok" "10"
eq "independent payment rows" "$(runFP "select count(*) from public.payment_vouchers where expense_type='concurrent-independent'")" "10"

echo "== GROWTH G0: 25000 real receipt RPC transactions as independent transactions =="
mkdir -p "$BASE/growth_receipt_workers"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE/growth_receipt_workers"
for w in $(seq 0 4); do
  offset=$((w*5000+1))
  cat > "$BASE/gen_$w.sql" <<SQL
  select format(
    'select public.post_receipt_with_allocations(%L::jsonb);',
    jsonb_build_object(
      'student_id', f.student_id,
      'student_name', (select s.name from public.students s where s.id=f.student_id),
      'voucher_date', '2026-02-01',
      'amount_received', 10,
      'payer_name', 'Growth',
      'notes', '',
      'idempotency_key', ('d0000000-0000-0000-0000-' || lpad((row_number() over(order by f.id) + $offset - 1)::text,12,'0'))::uuid,
      'allocations', jsonb_build_array(jsonb_build_object('type','fee','fee_obligation_id',f.id,'amount',10))
    )
  )
  from public.fee_obligations f
  where f.description='Growth fee'
  order by f.id
  offset $offset limit 5000
;
SQL
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/gen_$w.sql"
  run "$PGBIN/psql -h $SOCK -U $PU -X -At -q -d $DB -f $BASE/gen_$w.sql" > "$BASE/growth_receipt_workers/worker_$w.sql" || exit 1
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/growth_receipt_workers/worker_$w.sql"
done
start=$(date +%s%N)
for w in $(seq 0 4); do
  (run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -c \"set request.jwt.claim.sub = '$OWNER'\" -f '$BASE/growth_receipt_workers/worker_$w.sql' >'$BASE/growth_receipt_workers/worker_$w.out' 2>&1"; echo $? > "$BASE/growth_receipt_workers/worker_$w.rc") &
done
wait
growth_failures=0
for w in $(seq 0 4); do [ "$(cat "$BASE/growth_receipt_workers/worker_$w.rc")" = "0" ] || growth_failures=$((growth_failures+1)); done
elapsed_ms=$((($(date +%s%N)-start)/1000000))
echo "   25000 receipt RPC transactions wall time: ${elapsed_ms} ms; worker failures=${growth_failures}"
if [ "$growth_failures" -gt 0 ]; then
  for w in $(seq 0 4); do [ -s "$BASE/growth_receipt_workers/worker_$w.out" ] && { echo "--- worker $w ---"; sed -n '1,20p' "$BASE/growth_receipt_workers/worker_$w.out"; }; done
  fail "25000 real receipt growth transactions"
else
  pass "25000 real receipt growth transactions"
fi

echo "== GROWTH G1: add 5000 synthetic payment rows with financial triggers =="
cat > "$BASE/growth_payments.sql" <<SQL
set statement_timeout = '120s';
set app.payment_posting = 'on';
insert into public.payment_vouchers
  (voucher_date, expense_type, amount, notes, idempotency_key)
select
  date '2026-02-01',
  'Growth synthetic',
  5,
  'growth fixture',
  ('e0000000-0000-0000-0000-' || lpad(g::text,12,'0'))::uuid
from generate_series(1,25000) g;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/growth_payments.sql"
start=$(date +%s%N)
if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/growth_payments.sql" >"$BASE/growth_payments.out" 2>&1; then
  fail "5000 synthetic payment growth load"; sed 's/^/       /' "$BASE/growth_payments.out"
else
  elapsed_ms=$((($(date +%s%N)-start)/1000000))
  echo "   5000 payment insert wall time: ${elapsed_ms} ms"
  pass "5000 synthetic payment growth load"
fi
eq "growth payment volume" "$(runFP "select count(*) from public.payment_vouchers where expense_type='Growth synthetic'")" "25000"

echo "== GROWTH G2: query-plan measurements at 100k students / 25k receipts / 25k payments =="
cat > "$BASE/plan_financial.sql" <<SQL
set statement_timeout = '120s';
explain (analyze, buffers, format text)
select id, movement_type, amount, external_share
from public.financial_movements
order by id desc
limit 100;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/plan_financial.sql"
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -f $BASE/plan_financial.sql" >"$BASE/plan_financial.out"
grep -E "Seq Scan|Index Scan|Index Only Scan|Sort|Execution Time|Planning Time" "$BASE/plan_financial.out" | sed 's/^/   /'
FIN_MS=$(awk '/Execution Time:/{gsub(/[^0-9.]/,"",$3); print $3; exit}' "$BASE/plan_financial.out")
echo "   financial_movements Execution Time: ${FIN_MS:-unknown} ms"

STUDENT_PLAN=$(runFP "select student_id from public.fee_obligations where description='Growth fee' order by id offset 1000 limit 1")
cat > "$BASE/plan_statement.sql" <<SQL
set statement_timeout = '120s';
explain (analyze, buffers, format text)
select *
from public.student_statement_lines
where student_id = '$STUDENT_PLAN';
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/plan_statement.sql"
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -f $BASE/plan_statement.sql" >"$BASE/plan_statement.out"
grep -E "Seq Scan|Index Scan|Index Only Scan|Sort|WindowAgg|Execution Time|Planning Time" "$BASE/plan_statement.out" | sed 's/^/   /'
STMT_MS=$(awk '/Execution Time:/{gsub(/[^0-9.]/,"",$3); print $3; exit}' "$BASE/plan_statement.out")
echo "   student_statement_lines Execution Time: ${STMT_MS:-unknown} ms"

cat > "$BASE/plan_student_target.sql" <<SQL
set statement_timeout = '120s';
explain (analyze, buffers, format text)
select count(*)
from public.student_statement_lines
where student_id = '$STUDENT_PLAN';
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/plan_student_target.sql"
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -f $BASE/plan_student_target.sql" >"$BASE/plan_student_target.out"
grep -E "Seq Scan|Index Scan|Index Only Scan|Sort|WindowAgg|Execution Time|Planning Time" "$BASE/plan_student_target.out" | sed 's/^/   /'
TARGET_MS=$(awk '/Execution Time:/{gsub(/[^0-9.]/,"",$3); print $3; exit}' "$BASE/plan_student_target.out")
echo "   filtered student_statement_lines Execution Time: ${TARGET_MS:-unknown} ms"

echo "== GROWTH G2b: candidate early student filter before windowing =="
cat > "$BASE/plan_statement_candidate.sql" <<SQL
set statement_timeout='120s';
explain (analyze,buffers,format text)
with allocated as (
  select
    ra.id, rv.voucher_number, rv.voucher_date, rv.student_id,
    rv.student_name_snapshot as student_name,
    case when ra.allocation_type='course' then en.course_name else fo.description end as course_name,
    case when ra.allocation_type='course' then en.course_value else fo.amount end as course_value,
    ra.amount as amount_received, rv.notes, rv.payer_name, rv.created_at,
    case
      when ra.allocation_type='course' then en.course_value - sum(ra.amount) over (
        partition by ra.enrollment_id order by rv.voucher_date,rv.voucher_number,ra.created_at,ra.id
        rows between unbounded preceding and current row)
      else fo.amount - sum(ra.amount) over (
        partition by ra.fee_obligation_id order by rv.voucher_date,rv.voucher_number,ra.created_at,ra.id
        rows between unbounded preceding and current row)
    end as remaining_balance,
    ra.allocation_type as entry_type, ra.fee_obligation_id, ra.enrollment_id
  from public.receipt_allocations ra
  join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id
  left join public.enrollments en on en.id=ra.enrollment_id
  left join public.fee_obligations fo on fo.id=ra.fee_obligation_id
  where rv.cancelled_at is null and rv.student_id='$STUDENT_PLAN'
),
legacy as (
  select
    rv.id,rv.voucher_number,rv.voucher_date,rv.student_id,rv.student_name_snapshot as student_name,
    rv.course_name,coalesce(en.course_value,rv.course_value) as course_value,rv.amount_received,
    rv.notes,rv.payer_name,rv.created_at,
    coalesce(en.course_value,rv.course_value)-sum(rv.amount_received) over (
      partition by rv.student_id,rv.course_name order by rv.voucher_date,rv.voucher_number
      rows between unbounded preceding and current row) as remaining_balance,
    'course'::text as entry_type,null::uuid as fee_obligation_id,en.id as enrollment_id
  from public.receipt_vouchers rv
  left join public.enrollments en on en.student_id=rv.student_id and en.course_name=rv.course_name
  where rv.cancelled_at is null and rv.student_id='$STUDENT_PLAN'
    and not exists (select 1 from public.receipt_allocations ra where ra.receipt_voucher_id=rv.id)
)
select * from allocated
union all
select * from legacy;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/plan_statement_candidate.sql"
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -f $BASE/plan_statement_candidate.sql" >"$BASE/plan_statement_candidate.out"
grep -E "Seq Scan|Index Scan|Index Only Scan|Bitmap|Sort|WindowAgg|Execution Time|Planning Time" "$BASE/plan_statement_candidate.out" | sed 's/^/   /'
CANDIDATE_MS=$(awk '/Execution Time:/{gsub(/[^0-9.]/,"",$3); print $3; exit}' "$BASE/plan_statement_candidate.out")
echo "   candidate early-filter student_statement_lines Execution Time: \${CANDIDATE_MS:-unknown} ms"

echo "== GROWTH G3: integrity checks after load =="
eq "financial receipt rows visible" "$(runFP "select count(*) from public.financial_movements where movement_type='receipt'")" "25005"
eq "financial payment rows visible" "$(runFP "select count(*) from public.financial_movements where movement_type='payment'")" "25011"
eq "financial gross receipt total" "$(runFP "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='receipt'")" "250050"
eq "financial payment total" "$(runFP "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='payment'")" "125017"
eq "no duplicate growth receipt idempotency keys" "$(runFP "select count(*) - count(distinct idempotency_key) from public.receipt_vouchers where payer_name='Growth'")" "0"
eq "no duplicate growth payment idempotency keys" "$(runFP "select count(*) - count(distinct idempotency_key) from public.payment_vouchers where expense_type='Growth synthetic'")" "0"

echo "== FINAL: concurrency + growth assertions =="
if [ "$FAILED" = "0" ]; then
  echo "=============== CONCURRENCY + GROWTH PASSED ==============="
else
  echo "=============== CONCURRENCY + GROWTH FAILED ==============="
  exit 1
fi
