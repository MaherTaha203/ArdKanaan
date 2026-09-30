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
  if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f "$f" >"$BASE/m.out" 2>&1; then
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
from generate_series(1,20000) g(i);
insert into public.enrollments (id,student_id,course_id,course_name,course_value)
select ('00000000-0000-0000-0000-' || lpad(to_hex(3000000000+i),12,'0'))::uuid,
       ('00000000-0000-0000-0000-' || lpad(to_hex(1000000000+i),12,'0'))::uuid,
       ('00000000-0000-0000-0000-' || lpad(to_hex(2000000000+((i-1)%10)+1),12,'0'))::uuid,
       'Growth Course '||(((i-1)%10)+1), 100
from generate_series(1,20000) g(i);
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/seed.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/seed.sql" || exit 1
eq "student volume" "$(runFP "select count(*) from public.students where name like 'Growth Student %'")" "20000"
eq "enrollment volume" "$(runFP "select count(*) from public.enrollments where course_name like 'Growth Course %'")" "20000"

echo "== create 20000 fee obligations through actual RPC =="
cat > "$BASE/fees.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.create_fee_obligations(
  jsonb_build_object(
    'course_id',(select id from public.courses where name='Growth Course 1' limit 1),
    'student_ids',(select jsonb_agg(id order by id) from public.students where name like 'Growth Student %'),
    'description','Growth fee',
    'amount',100,
    'fee_category','institute',
    'external_share',0
  )
);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/fees.sql"
if ! run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/fees.sql" >"$BASE/fees.out" 2>&1; then
  fail "bulk fee creation via actual RPC"; cat "$BASE/fees.out"
fi
eq "fee volume" "$(runFP "select count(*) from public.fee_obligations where description='Growth fee'")" "20000"

echo "== CONCURRENCY C1: 10 receipts race on the SAME fee (50 total capacity) =="
FEE=$(runFP "select id from public.fee_obligations where description='Growth fee' order by id limit 1")
STUDENT=$(runFP "select student_id from public.fee_obligations where id='$FEE'")
mkdir -p "$BASE/race_receipts"
for i in $(seq 1 10); do
  key=$(printf 'c1000000-0000-0000-0000-%012d' "$i")
  cat > "$BASE/race_receipts/$i.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"$STUDENT","student_name":"Race Student","voucher_date":"2026-02-01","amount_received":10,"payer_name":"Race","notes":"","idempotency_key":"$key","allocations":[{"type":"fee","fee_obligation_id":"$FEE","amount":10}]}'::jsonb);
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
eq "receipt race total outcomes" "$((successes+failures))" "10"
eq "receipt race settled amount" "$(runFP "select coalesce(sum(amount),0)::int from public.receipt_allocations where fee_obligation_id='$FEE'")" "50"
eq "receipt race cannot exceed fee" "$(runFP "select case when coalesce(sum(amount),0) <= 50 then 1 else 0 end from public.receipt_allocations where fee_obligation_id='$FEE'")" "1"
eq "receipt race row count matches successful calls" "$(runFP "select count(*) from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEE'")" "$successes"

echo "== CONCURRENCY C2: 10 identical payment idempotency requests race =="
PAYKEY='c2aaaaaa-0000-0000-0000-000000000001'
mkdir -p "$BASE/race_payment"
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

echo "== GROWTH G1: statement view plan at 20000 fee rows =="
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -c "EXPLAIN (ANALYZE,BUFFERS,TIMING OFF) SELECT * FROM public.student_statement_lines WHERE student_id='$STUDENT';" > "$BASE/statement_plan.txt" 2>&1
cat "$BASE/statement_plan.txt"
if grep -q "Execution Time:" "$BASE/statement_plan.txt"; then pass "student_statement_lines filtered query executed"; else fail "student_statement_lines EXPLAIN did not complete"; fi

echo "== GROWTH G2: financial movements plan at concurrent payment/receipt volume =="
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -c "EXPLAIN (ANALYZE,BUFFERS,TIMING OFF) SELECT * FROM public.financial_movements WHERE movement_type='receipt';" > "$BASE/movements_plan.txt" 2>&1
cat "$BASE/movements_plan.txt"
if grep -q "Execution Time:" "$BASE/movements_plan.txt"; then pass "financial_movements query executed"; else fail "financial_movements EXPLAIN did not complete"; fi

echo "== GROWTH G3: full-view aggregate execution =="
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -c "EXPLAIN (ANALYZE,BUFFERS,TIMING OFF) SELECT count(*) FROM public.student_statement_lines;" > "$BASE/statement_full_plan.txt" 2>&1
cat "$BASE/statement_full_plan.txt"
if grep -q "Execution Time:" "$BASE/statement_full_plan.txt"; then pass "full student_statement_lines aggregate executed"; else fail "full student_statement_lines EXPLAIN did not complete"; fi

echo "== GROWTH G4: planner statistics =="
eq "student count final" "$(runFP "select count(*) from public.students where name like 'Growth Student %'")" "20000"
eq "fee count final" "$(runFP "select count(*) from public.fee_obligations where description='Growth fee'")" "20000"
eq "receipt total on raced fee" "$(runFP "select coalesce(sum(amount),0)::int from public.receipt_allocations where fee_obligation_id='$FEE'")" "50"

echo
if [ "$FAILED" = "0" ]; then
  echo "=============== CONCURRENCY + GROWTH ASSERTIONS PASSED ==============="
else
  echo "=============== CONCURRENCY + GROWTH ASSERTIONS FAILED ==============="
  exit 1
fi
