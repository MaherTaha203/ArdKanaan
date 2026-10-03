#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# REAL-PATH financial integration test suite (throwaway PostgreSQL only).
# ---------------------------------------------------------------------------
# Runs in CI and locally against THROWAWAY PostgreSQL. Production is never touched.
# It applies the FULL repo
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
PGBIN="${PGBIN:-/usr/bin}"
PG_RUNAS="${PG_RUNAS:-}"
USER="${USER:-postgres}"
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

echo "== Course roster parity: legacy receipt (pre-allocation posting model) remains visible on demand ==";
# The enrollment carries a real course_id (enrollments.course_id is NOT NULL since
# migration 20260915150000, in shared history before any divergence) and needs
# session_replication_role=replica only to bypass the course_value/base_fee
# snapshot-match check (this course has no base_fee). The LEGACY element under
# test is the RECEIPT shape: recorded directly against the course NAME, with
# allocation_mode=false and no receipt_allocations row — exactly how a receipt
# looked before the allocation model existed. get_course_financial_roster's
# legacy_course_paid CTE must still attribute its amount to the matching
# enrollment via student_id + course_name.
#
# The receipt itself is posted through the real app.receipt_posting firewall GUC
# (the same one post_receipt_with_allocations sets), NOT under replica mode: a
# legacy, pre-allocation receipt was still a real receipt that went through
# *some* posting path and so is correctly ledger-tracked, like every other
# voucher. Posting it under replica mode would bypass the ledger-recording
# trigger entirely — producing a receipt_vouchers row with no ledger movement, a
# state the real application can never produce (every receipt_vouchers insert in
# the real app goes through the RPC, which always records a movement) and that
# restore_center_data is consequently not designed to reproduce byte-for-byte:
# restoring a backup correctly re-establishes a ledger movement for every voucher
# it restores, since every real voucher is a real financial fact.
cat > "$BASE/course_roster_legacy.sql" <<SQL
set session_replication_role = replica;
insert into public.courses (id, name, status)
values ('00000000-0000-0000-0000-0000000d0001', 'دورة قديمة', 'active');
insert into public.students (id, name, status)
values ('00000000-0000-0000-0000-0000000d0002', 'طالب قديم', 'active');
insert into public.enrollments (id, student_id, course_id, course_name, course_value)
values ('00000000-0000-0000-0000-0000000d0003', '00000000-0000-0000-0000-0000000d0002', '00000000-0000-0000-0000-0000000d0001', 'دورة قديمة', 100);
set session_replication_role = origin;
select set_config('app.receipt_posting', 'on', false);
insert into public.receipt_vouchers
  (id, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes, fee_category, external_share, allocation_mode)
values
  ('00000000-0000-0000-0000-0000000d0004', '2026-02-01', '00000000-0000-0000-0000-0000000d0002', 'طالب قديم', 'دورة قديمة', 100, 40, 'طالب قديم', '', null, 0, false);
select set_config('app.receipt_posting', 'off', false);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/course_roster_legacy.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/course_roster_legacy.sql" || { echo legacy roster fixture FAIL; exit 1; }
eq "legacy course roster row count" "$(runFP "select count(*) from public.get_course_financial_roster('00000000-0000-0000-0000-0000000d0001')")" "1"
eq "legacy enrollment is mapped to catalog course" "$(runFP "select count(*) from public.get_course_financial_roster('00000000-0000-0000-0000-0000000d0001') where enrollment_id='00000000-0000-0000-0000-0000000d0003' and course_id='00000000-0000-0000-0000-0000000d0001'")" "1"
eq "legacy receipt remains visible in course paid total" "$(runFP "select coalesce(paid,0)::int from public.get_course_financial_roster('00000000-0000-0000-0000-0000000d0001') where enrollment_id='00000000-0000-0000-0000-0000000d0003'")" "40"
eq "legacy course remaining balance preserved" "$(runFP "select coalesce(remaining,0)::int from public.get_course_financial_roster('00000000-0000-0000-0000-0000000d0001') where enrollment_id='00000000-0000-0000-0000-0000000d0003'")" "60"

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

echo "== Scoped student statement read path: parity with the canonical view ==";
eq "Scoped function returns same row count for student B" \
  "$(runFP "select count(*) from public.get_student_statement_lines('00000000-0000-0000-0000-0000000a0002')" )" \
  "$(runFP "select count(*) from public.student_statement_lines where student_id='00000000-0000-0000-0000-0000000a0002'")"
eq "Scoped function matches canonical statement rows for student B" \
  "$(runFP "select md5(coalesce(string_agg(row_to_json(x)::text, '|' order by voucher_date,voucher_number,id),'')) from public.get_student_statement_lines('00000000-0000-0000-0000-0000000a0002') x")" \
  "$(runFP "select md5(coalesce(string_agg(row_to_json(x)::text, '|' order by voucher_date,voucher_number,id),'')) from public.student_statement_lines x where student_id='00000000-0000-0000-0000-0000000a0002'")"
cat > "$BASE/scoped_statement_auth.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ab';
select count(*) from public.get_student_statement_lines('00000000-0000-0000-0000-0000000a0002');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/scoped_statement_auth.sql"
eq "Non-owner scoped statement returns no rows" "$(run "$PGBIN/psql -h $SOCK -U $PU -X -qtA -d $DB -f $BASE/scoped_statement_auth.sql" | tr -d '[:space:]')" "0"

echo "== Isolation: student_statement_lines exposes NO external_share =="
eq "student_statement_lines has external_share column" \
  "$(runFP "select count(*)::int from information_schema.columns where table_name='student_statement_lines' and column_name='external_share'")" "0"

echo "== Server student summary parity: no full statement rows transferred ==";
eq "Summary A paid" "$(runFP "select paid::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0001'")" "100"
eq "Summary A remaining" "$(runFP "select remaining::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0001'")" "500"
eq "Summary A courses" "$(runFP "select courses from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0001'")" "1"
eq "Summary B paid" "$(runFP "select paid::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0002'")" "100"
eq "Summary B remaining" "$(runFP "select remaining::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0002'")" "500"
eq "Summary B line_count" "$(runFP "select line_count from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0002'")" "1"
eq "Summary C paid" "$(runFP "select paid::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0003'")" "100"
eq "Summary C remaining" "$(runFP "select remaining::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0003'")" "500"
eq "Summary C paid (repeat guard)" "$(runFP "select paid::int from public.student_financial_summary where student_id='00000000-0000-0000-0000-0000000a0003'")" "100"

echo "== Server student summary contract/parity ==";
eq "Summary has exactly one row per student" \
  "$(runFP "select count(*) from public.student_financial_summary")" \
  "$(runFP "select count(*) from public.students")"
eq "Summary authenticated SELECT grant" \
  "$(runFP "select case when has_table_privilege('authenticated','public.student_financial_summary','select') then 1 else 0 end")" "1"
eq "Summary anon SELECT revoked" \
  "$(runFP "select case when has_table_privilege('anon','public.student_financial_summary','select') then 1 else 0 end")" "0"
eq "Summary uses security invoker" \
  "$(runFP "select case when 'security_invoker=true' = any(coalesce(reloptions,'{}')) then 1 else 0 end from pg_class where oid='public.student_financial_summary'::regclass")" "1"

PARITY=$(runFP "with
enrollment_counts as (
  select student_id, course_name, count(*)::int as enrollment_count
  from public.enrollments group by student_id, course_name
),
course_lines as (
  select l.id,l.student_id,l.course_name,l.voucher_date,l.voucher_number,l.amount_received,l.remaining_balance,
    case when l.enrollment_id is not null then l.enrollment_id
         when coalesce(ec.enrollment_count,0)=1 then en_name.id else null end resolved_enrollment_id,
    case when l.enrollment_id is not null then 'enrollment:'||l.enrollment_id::text
         when coalesce(ec.enrollment_count,0)=1 then 'enrollment:'||en_name.id::text
         else 'legacy:'||l.course_name end bucket_key,
    case when l.enrollment_id is not null then en_id.course_name
         when coalesce(ec.enrollment_count,0)=1 then en_name.course_name
         else l.course_name end resolved_course_name
  from public.student_statement_lines l
  left join public.enrollments en_id on en_id.id=l.enrollment_id
  left join enrollment_counts ec on ec.student_id=l.student_id and ec.course_name=l.course_name
  left join public.enrollments en_name on en_name.student_id=l.student_id and en_name.course_name=l.course_name and ec.enrollment_count=1
  where coalesce(l.entry_type,'course')='course'
),
course_paid as (
  select student_id,bucket_key,sum(amount_received)::numeric paid from course_lines group by student_id,bucket_key
),
course_latest as (
  select distinct on (student_id,bucket_key) student_id,bucket_key,resolved_course_name,resolved_enrollment_id,remaining_balance
  from course_lines
  order by student_id,bucket_key,voucher_date desc,voucher_number desc,id desc
),
course_rows as (
  select cl.student_id,cl.bucket_key,cl.resolved_course_name,cl.resolved_enrollment_id,greatest(0,cl.remaining_balance)::numeric remaining
  from course_latest cl
  union all
  select e.student_id,'enrollment:'||e.id,e.course_name,e.id,e.course_value::numeric
  from public.enrollments e
  where not exists(select 1 from course_lines l where l.resolved_enrollment_id=e.id)
),
course_summary as (
  select student_id,count(*)::int courses,coalesce(sum(remaining),0)::numeric course_remaining,
    coalesce(array_agg(distinct resolved_course_name order by resolved_course_name) filter(where resolved_course_name is not null),'{}'::text[]) course_names
  from course_rows group by student_id
),
fee_paid as (
  select student_id,fee_obligation_id,sum(amount_received)::numeric paid
  from public.student_statement_lines
  where entry_type='fee' and fee_obligation_id is not null
  group by student_id,fee_obligation_id
),
fee_summary as (
  select f.student_id,coalesce(sum(greatest(0,f.amount-coalesce(fp.paid,0))),0)::numeric fee_remaining
  from public.fee_obligations f
  left join fee_paid fp on fp.fee_obligation_id=f.id
  where f.cancelled_at is null group by f.student_id
),
activity as (
  select student_id,coalesce(sum(amount_received),0)::numeric paid,max(voucher_date) last_activity,count(id)::bigint line_count
  from public.student_statement_lines group by student_id
),
expected as (
  select s.id student_id,coalesce(a.paid,0)::numeric paid,
    greatest(0,coalesce(cs.course_remaining,0)+coalesce(fs.fee_remaining,0))::numeric remaining,
    coalesce(cs.courses,0)::int courses,a.last_activity,coalesce(a.line_count,0)::bigint line_count,
    coalesce(cs.course_names,'{}'::text[]) course_names
  from public.students s
  left join activity a on a.student_id=s.id
  left join course_summary cs on cs.student_id=s.id
  left join fee_summary fs on fs.student_id=s.id
),
diff as (
  (select student_id,paid,remaining,courses,last_activity,line_count,course_names from public.student_financial_summary
   except all
   select student_id,paid,remaining,courses,last_activity,line_count,course_names from expected)
  union all
  (select student_id,paid,remaining,courses,last_activity,line_count,course_names from expected
   except all
   select student_id,paid,remaining,courses,last_activity,line_count,course_names from public.student_financial_summary)
)
select count(*) from diff")
eq "Server summary is exactly parity with the aggregate contract" "$PARITY" "0"

echo "== On-demand course financial roster: parity + authorization ==";
eq "Course A roster row count" "$(runFP "select count(*) from public.get_course_financial_roster('00000000-0000-0000-0000-0000000c0001')")" "$(runFP "select count(*) from public.enrollments where course_id='00000000-0000-0000-0000-0000000c0001'")"
eq "Course A paid excludes fee-only receipt" "$(runFP "select paid::int from public.get_course_financial_roster('00000000-0000-0000-0000-0000000c0001') where enrollment_id='00000000-0000-0000-0000-0000000e0001'")" "0"
eq "Course A remaining equals enrollment fee" "$(runFP "select remaining::int from public.get_course_financial_roster('00000000-0000-0000-0000-0000000c0001') where enrollment_id='00000000-0000-0000-0000-0000000e0001'")" "500"
eq "Course B paid excludes fee-only receipt" "$(runFP "select paid::int from public.get_course_financial_roster('00000000-0000-0000-0000-0000000c0002') where enrollment_id='00000000-0000-0000-0000-0000000e0002'")" "0"
cat > "$BASE/course_roster_auth.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ab';
select count(*) from public.get_course_financial_roster('00000000-0000-0000-0000-0000000c0001');
select count(*) from public.student_financial_summary;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/course_roster_auth.sql"
eq "Non-owner course roster returns no rows" "$(run "$PGBIN/psql -h $SOCK -U $PU -X -qtA -d $DB -f $BASE/course_roster_auth.sql" | head -n1 | tr -d '[:space:]')" "0"
eq "Non-owner student summary returns no rows" "$(run "$PGBIN/psql -h $SOCK -U $PU -X -qtA -d $DB -f $BASE/course_roster_auth.sql" | tail -n1 | tr -d '[:space:]')" "0"

echo "== Aggregate over financial_movements (receipts only) =="
# 300/140/160 from Cases A-C (100+100+100 gross, 0+40+100 external) + the legacy
# receipt (40 gross, external_share=0, now ledger-tracked like any other posted
# receipt — see the course_roster_legacy fixture above): 300+40=340 gross,
# 140+0=140 external unchanged, 160+40=200 center.
eq "total gross in"                  "$(runFP "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='receipt'")" "340"
eq "total external held"             "$(runFP "select coalesce(sum(external_share),0)::int from public.financial_movements where movement_type='receipt'")" "140"
eq "center receipts (Σ amount-ext)"  "$(runFP "select coalesce(sum(amount-external_share),0)::int from public.financial_movements where movement_type='receipt'")" "200"


echo "== Expansion P1: payment posting, idempotency, cancellation, ledger reversal ==";
PAYKEY=99999999-0000-0000-0000-000000000009
cat > "$BASE/payment.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_payment_voucher('{"voucher_date":"2026-02-01","expense_type":"تشغيل","amount":80,"notes":"integration payment","idempotency_key":"$PAYKEY"}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/payment.sql"
PAY_OUT=$(run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/payment.sql")
PAYID=$(runFP "select id from public.payment_vouchers where idempotency_key='$PAYKEY'")
PAYNUM=$(runFP "select voucher_number from public.payment_vouchers where id='$PAYID'")
eq "Payment posted exactly once" "$(runFP "select count(*) from public.payment_vouchers where idempotency_key='$PAYKEY'")" "1"
eq "Payment amount persisted" "$(runFP "select amount::int from public.payment_vouchers where id='$PAYID'")" "80"
eq "Payment appears in financial_movements" "$(runFP "select count(*) from public.financial_movements where id='$PAYID' and movement_type='payment' and amount=80")" "1"
eq "Payment ledger original exists" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='payment' and source_id='$PAYID' and entry_kind='original'")" "1"

cat > "$BASE/payment_replay.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_payment_voucher('{"voucher_date":"2026-02-01","expense_type":"تشغيل","amount":80,"notes":"retry","idempotency_key":"$PAYKEY"}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/payment_replay.sql"
PAY_REPLAY=$(run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/payment_replay.sql")
if grep -q '"idempotent_replay": true' <<<"$PAY_REPLAY"; then pass "payment same-key replay"; else fail "payment same-key replay failed"; fi
eq "Payment replay kept one row" "$(runFP "select count(*) from public.payment_vouchers where idempotency_key='$PAYKEY'")" "1"

cat > "$BASE/payment_mismatch.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_payment_voucher('{"voucher_date":"2026-02-01","expense_type":"تشغيل","amount":81,"notes":"","idempotency_key":"$PAYKEY"}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/payment_mismatch.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/payment_mismatch.sql" >"$BASE/payment_mismatch.out" 2>&1; then
  fail "payment idempotency mismatch was accepted"
else
  if grep -q "IDEMPOTENCY_KEY_REUSE_MISMATCH" "$BASE/payment_mismatch.out"; then pass "payment idempotency mismatch rejected"; else fail "wrong payment idempotency error"; sed 's/^/       /' "$BASE/payment_mismatch.out"; fi
fi
eq "Payment mismatch created no second row" "$(runFP "select count(*) from public.payment_vouchers where idempotency_key='$PAYKEY'")" "1"

cat > "$BASE/payment_cancel.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '$OWNER';
update public.payment_vouchers
set cancelled_at = timezone('utc', now()), cancel_reason = 'integration-test payment cancellation'
where id = '$PAYID';
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/payment_cancel.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/payment_cancel.sql" >"$BASE/payment_cancel.out" 2>&1; then
  pass "owner payment cancellation through authenticated UPDATE succeeded"
else
  fail "owner payment cancellation failed"; sed 's/^/       /' "$BASE/payment_cancel.out"
fi
eq "Cancelled payment excluded from financial_movements" "$(runFP "select count(*) from public.financial_movements where id='$PAYID'")" "0"
eq "Payment ledger original remains append-only" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='payment' and source_id='$PAYID' and entry_kind='original' and reversed_at is null")" "1"
eq "Payment ledger reversal exists" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='payment' and source_id='$PAYID' and entry_kind='reversal'")" "1"
eq "Payment reversal points to original" "$(runFP "select count(*) from public.financial_movement_ledger r join public.financial_movement_ledger o on r.reversal_of=o.id where r.source_id='$PAYID' and r.entry_kind='reversal' and o.entry_kind='original'")" "1"

cat > "$BASE/payment_cancel_again.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
update public.payment_vouchers
set cancelled_at = timezone('utc', now()), cancel_reason = 'second cancellation'
where id = '$PAYID';
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/payment_cancel_again.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/payment_cancel_again.sql" >"$BASE/payment_cancel_again.out" 2>&1; then
  fail "cancelled payment was mutable"
else
  if grep -q "CANCELLED_VOUCHER_IS_IMMUTABLE" "$BASE/payment_cancel_again.out"; then pass "cancelled payment is immutable"; else fail "wrong cancelled-payment mutation error"; sed 's/^/       /' "$BASE/payment_cancel_again.out"; fi
fi
eq "Payment has exactly one reversal" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='payment' and source_id='$PAYID' and entry_kind='reversal'")" "1"

echo "== Expansion 1: idempotency replay + mismatch protection ==";
BEFORE_IDEM=$(runFP "select count(*) from public.receipt_vouchers");
cat > "$BASE/idem_replay.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"00000000-0000-0000-0000-0000000a0002","student_name":"طالب ب","voucher_date":"2026-02-01","amount_received":100,"payer_name":"طالب ب","notes":"","idempotency_key":"22222222-0000-0000-0000-000000000002","allocations":[{"type":"fee","fee_obligation_id":"$FEEB","amount":100}]}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/idem_replay.sql"
REPLAY_OUT=$(run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/idem_replay.sql");
if grep -q '"idempotent_replay": true' <<<"$REPLAY_OUT"; then pass "same idempotency key replays"; else fail "same idempotency key did not replay"; fi
eq "Idempotency replay row count unchanged" "$(runFP "select count(*) from public.receipt_vouchers")" "$BEFORE_IDEM";

cat > "$BASE/idem_mismatch.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"00000000-0000-0000-0000-0000000a0002","student_name":"طالب ب","voucher_date":"2026-02-01","amount_received":99,"payer_name":"طالب ب","notes":"","idempotency_key":"22222222-0000-0000-0000-000000000002","allocations":[{"type":"fee","fee_obligation_id":"$FEEB","amount":99}]}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/idem_mismatch.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/idem_mismatch.sql" >"$BASE/idem_mismatch.out" 2>&1; then
  fail "idempotency key reuse mismatch was accepted"
else
  if grep -q "IDEMPOTENCY_KEY_REUSE_MISMATCH" "$BASE/idem_mismatch.out"; then
    pass "idempotency key reuse mismatch rejected"
  else
    fail "wrong error for idempotency key reuse mismatch"; sed 's/^/       /' "$BASE/idem_mismatch.out"
  fi
fi
eq "Idempotency mismatch created no row" "$(runFP "select count(*) from public.receipt_vouchers where amount_received=99")" "0";

echo "== Expansion 2: overpayment rejection is atomic ==";
BEFORE_OVER=$(runFP "select count(*) from public.receipt_vouchers");
cat > "$BASE/overpay.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"00000000-0000-0000-0000-0000000a0003","student_name":"طالب ج","voucher_date":"2026-02-01","amount_received":1,"payer_name":"طالب ج","notes":"","idempotency_key":"44444444-0000-0000-0000-000000000004","allocations":[{"type":"fee","fee_obligation_id":"$FEEC","amount":1}]}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/overpay.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/overpay.sql" >"$BASE/overpay.out" 2>&1; then
  fail "overpayment was accepted"
else
  if grep -q "FEE_ALLOCATION_EXCEEDS_REMAINING_BALANCE" "$BASE/overpay.out"; then
    pass "overpayment rejected at remaining-balance boundary"
  else
    fail "wrong error for overpayment"; sed 's/^/       /' "$BASE/overpay.out"
  fi
fi
eq "Overpayment created no receipt" "$(runFP "select count(*) from public.receipt_vouchers")" "$BEFORE_OVER";

echo "== Expansion 3: partial fee settlement + exact external-share conservation ==";
make_fee 00000000-0000-0000-0000-0000000c0001 00000000-0000-0000-0000-0000000a0001 "رسوم جزئية" 100 shared 40
FEED=$(runFP "select id from public.fee_obligations where student_id='00000000-0000-0000-0000-0000000a0001' and description='رسوم جزئية'")
post_receipt 00000000-0000-0000-0000-0000000a0001 "طالب أ" 30 55555555-0000-0000-0000-000000000005 "$FEED"
RVD1=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEED' and rv.idempotency_key='55555555-0000-0000-0000-000000000005'")
eq "Partial fee payment accepted" "$(runFP "select amount::int from public.receipt_allocations where receipt_voucher_id='$RVD1'")" "30"
eq "Partial external share = 12" "$(runFP "select external_share::int from public.receipt_allocations where receipt_voucher_id='$RVD1'")" "12"
post_receipt 00000000-0000-0000-0000-0000000a0001 "طالب أ" 70 66666666-0000-0000-0000-000000000006 "$FEED"
RVD2=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.fee_obligation_id='$FEED' and rv.idempotency_key='66666666-0000-0000-0000-000000000006'")
eq "Final fee payment accepted" "$(runFP "select amount::int from public.receipt_allocations where receipt_voucher_id='$RVD2'")" "70"
eq "Final external share = remaining 28" "$(runFP "select external_share::int from public.receipt_allocations where receipt_voucher_id='$RVD2'")" "28"
eq "Fee total settled exactly" "$(runFP "select coalesce(sum(amount),0)::int from public.receipt_allocations where fee_obligation_id='$FEED'")" "100"
eq "Fee external conserved exactly" "$(runFP "select coalesce(sum(external_share),0)::int from public.receipt_allocations where fee_obligation_id='$FEED'")" "40";

echo "== Expansion 4: receipt cancellation reverses ledger and restores balance ==";
cat > "$BASE/cancel.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '$OWNER';
update public.receipt_vouchers
set cancelled_at = timezone('utc', now()), cancel_reason = 'integration-test cancellation'
where id = '$RVD2';
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/cancel.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/cancel.sql" >"$BASE/cancel.out" 2>&1; then
  pass "owner cancellation through authenticated UPDATE succeeded"
else
  fail "owner cancellation failed"; sed 's/^/       /' "$BASE/cancel.out"
fi
eq "Cancelled receipt excluded from financial_movements" "$(runFP "select count(*) from public.financial_movements where id='$RVD2'")" "0"
eq "Append-only original ledger remains unmodified" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='receipt' and source_id='$RVD2' and entry_kind='original' and reversed_at is null")" "1"
eq "Receipt ledger reversal exists" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='receipt' and source_id='$RVD2' and entry_kind='reversal'")" "1"
eq "Reversal points to original" "$(runFP "select count(*) from public.financial_movement_ledger r join public.financial_movement_ledger o on r.reversal_of=o.id where r.source_id='$RVD2' and r.entry_kind='reversal' and o.entry_kind='original'")" "1"
eq "Cancelled allocation remains immutable history" "$(runFP "select count(*) from public.receipt_allocations where receipt_voucher_id='$RVD2'")" "1"
eq "Cancelled payment no longer counts toward fee balance" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.fee_obligation_id='$FEED' and rv.cancelled_at is null")" "30";

echo "== Expansion 5: cancelled receipt can be replaced without changing old fact ==";
post_receipt 00000000-0000-0000-0000-0000000a0001 "طالب أ" 70 77777777-0000-0000-0000-000000000007 "$FEED"
RVD3=$(runFP "select rv.id from public.receipt_vouchers rv where rv.idempotency_key='77777777-0000-0000-0000-000000000007'")
eq "Replacement receipt accepted" "$(runFP "select amount_received::int from public.receipt_vouchers where id='$RVD3'")" "70"
eq "Replacement external share = 28" "$(runFP "select external_share::int from public.receipt_allocations where receipt_voucher_id='$RVD3'")" "28"
eq "Active fee settlement restored to full" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.fee_obligation_id='$FEED' and rv.cancelled_at is null")" "100";

echo "== Expansion 6: paid fee cannot be cancelled ==";
cat > "$BASE/cancel_paid_fee.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.cancel_fee_obligation('$FEED','must reject while paid');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/cancel_paid_fee.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/cancel_paid_fee.sql" >"$BASE/cancel_paid_fee.out" 2>&1; then
  fail "paid fee cancellation was accepted"
else
  if grep -q "PAID_FEE_REQUIRES_REVERSAL_BEFORE_CANCELLATION" "$BASE/cancel_paid_fee.out"; then pass "paid fee cancellation rejected"; else fail "wrong error for paid fee cancellation"; sed 's/^/       /' "$BASE/cancel_paid_fee.out"; fi
fi
eq "Paid fee remains active" "$(runFP "select count(*) from public.fee_obligations where id='$FEED' and cancelled_at is null")" "1";

echo "== Expansion 7: atomic rollback on invalid second allocation ==";
make_fee 00000000-0000-0000-0000-0000000c0002 00000000-0000-0000-0000-0000000a0002 "رسوم ذرية" 50 institute 0
FEEAT=$(runFP "select id from public.fee_obligations where student_id='00000000-0000-0000-0000-0000000a0002' and description='رسوم ذرية'")
BEFORE_ATOMIC_R=$(runFP "select count(*) from public.receipt_vouchers")
BEFORE_ATOMIC_A=$(runFP "select count(*) from public.receipt_allocations")
cat > "$BASE/atomic.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"00000000-0000-0000-0000-0000000a0002","student_name":"طالب ب","voucher_date":"2026-02-01","amount_received":51,"payer_name":"طالب ب","notes":"","idempotency_key":"88888888-0000-0000-0000-000000000008","allocations":[{"type":"fee","fee_obligation_id":"$FEEAT","amount":50},{"type":"fee","fee_obligation_id":"$FEEC","amount":1}]}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/atomic.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/atomic.sql" >"$BASE/atomic.out" 2>&1; then
  fail "atomic invalid allocation was accepted"
else
  if grep -Eq "FEE_ALLOCATION_EXCEEDS_REMAINING_BALANCE|FEE_OBLIGATION_NOT_FOUND" "$BASE/atomic.out"; then pass "invalid second allocation rejected"; else fail "wrong atomic rollback error"; sed 's/^/       /' "$BASE/atomic.out"; fi
fi
eq "Atomic rollback left receipt count unchanged" "$(runFP "select count(*) from public.receipt_vouchers")" "$BEFORE_ATOMIC_R"
eq "Atomic rollback left allocation count unchanged" "$(runFP "select count(*) from public.receipt_allocations")" "$BEFORE_ATOMIC_A"
eq "Atomic rollback left first fee unpaid" "$(runFP "select coalesce(sum(amount),0)::int from public.receipt_allocations where fee_obligation_id='$FEEAT'")" "0"

echo "== Expansion R1: backup -> clean DB restore -> financial comparison ==";
DB2=ext_restore
BASE2=$BASE"_restore"
DATADIR2=$BASE2/data
SOCK2=$BASE2/sock
LOG2=$BASE2/pg.log
rm -rf "$BASE2"; mkdir -p "$DATADIR2" "$SOCK2"; [ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE2"
run "$PGBIN/initdb -D $DATADIR2 -U $PU --auth=trust -E UTF8" >"$BASE2/initdb.log" 2>&1 || { echo target initdb FAIL; tail "$BASE2/initdb.log"; exit 1; }
run "$PGBIN/pg_ctl -D $DATADIR2 -l $LOG2 -o '-c unix_socket_directories=$SOCK2 -c listen_addresses=\"\"' -w start" >/dev/null || { cat "$LOG2"; exit 1; }
cat > "$BASE2/roles.sql" <<'SQL'
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE2/roles.sql"
run "$PGBIN/createdb -h $SOCK2 -U $PU $DB2" || exit 1
run "$PGBIN/psql -h $SOCK2 -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB2 -f $BASE2/roles.sql" || exit 1

cat > "$BASE2/stubs.sql" <<'SQL'
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text, created_at timestamptz not null default now());
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable() returns void language plpgsql as $$ begin end $$;
insert into auth.users (id, email) values ('OWNER_UUID', 'owner@test.local');
SQL
sed -i "s/OWNER_UUID/$OWNER/g" "$BASE2/stubs.sql"
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE2/stubs.sql"
run "$PGBIN/psql -h $SOCK2 -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB2 -f $BASE2/stubs.sql" || { echo target stubs FAIL; exit 1; }

for f in $(ls -1 "$MIG"/*.sql | sort); do
  if ! run "$PGBIN/psql -h $SOCK2 -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB2 -f $f" >"$BASE2/m.out" 2>&1; then
    echo ">>> target migration FAILED: $(basename "$f")"; cat "$BASE2/m.out"; exit 1
  fi
done

run "$PGBIN/psql -h $SOCK -U $PU -X -At -d $DB -c \"select jsonb_build_object(
  'students',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.students x),
  'courses',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.courses x),
  'enrollments',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.enrollments x),
  'fee_obligations',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.fee_obligations x),
  'receipt_vouchers',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.receipt_vouchers x),
  'receipt_allocations',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.receipt_allocations x),
  'payment_vouchers',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb) from public.payment_vouchers x)
)\"" >"$BASE2/backup.json"
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE2/backup.json"

cat > "$BASE2/restore.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.restore_center_data(pg_read_file('$BASE2/backup.json')::jsonb, false);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE2/restore.sql"
if run "$PGBIN/psql -h $SOCK2 -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB2 -f $BASE2/restore.sql" >"$BASE2/restore.out" 2>&1; then
  pass "backup restored into clean PostgreSQL database"
else
  fail "backup restore failed"; sed 's/^/       /' "$BASE2/restore.out"
fi

run2() { if [ -n "$PG_RUNAS" ]; then su "$PG_RUNAS" -c "$1"; else bash -c "$1"; fi; }
runFP2() {
  printf '%s;\n' "$1" > "$BASE2/query.sql"
  [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE2/query.sql"
  run2 "$PGBIN/psql -h $SOCK2 -U $PU -X -qtA -d $DB2 -f $BASE2/query.sql" | tr -d '[:space:]'
}
eq2() { if [ "$2" = "$3" ]; then pass "$1 = $2"; else fail "$1 expected $3, got $2"; fi; }

for t in students courses enrollments fee_obligations receipt_vouchers receipt_allocations payment_vouchers; do
  SRC=$(runFP "select count(*) from public.$t")
  DST=$(runFP2 "select count(*) from public.$t")
  eq2 "Restore row count $t" "$DST" "$SRC"
done

eq2 "Restore active gross receipts" "$(runFP2 "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='receipt'")" "$(runFP "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='receipt'")"
eq2 "Restore active external receipts" "$(runFP2 "select coalesce(sum(external_share),0)::int from public.financial_movements where movement_type='receipt'")" "$(runFP "select coalesce(sum(external_share),0)::int from public.financial_movements where movement_type='receipt'")"
eq2 "Restore active center receipts" "$(runFP2 "select coalesce(sum(amount-external_share),0)::int from public.financial_movements where movement_type='receipt'")" "$(runFP "select coalesce(sum(amount-external_share),0)::int from public.financial_movements where movement_type='receipt'")"
eq2 "Restore active payment total" "$(runFP2 "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='payment'")" "$(runFP "select coalesce(sum(amount),0)::int from public.financial_movements where movement_type='payment'")"
eq2 "Restore receipt ledger rows" "$(runFP2 "select count(*) from public.financial_movement_ledger where source_type='receipt'")" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='receipt'")"
eq2 "Restore payment ledger rows" "$(runFP2 "select count(*) from public.financial_movement_ledger where source_type='payment'")" "$(runFP "select count(*) from public.financial_movement_ledger where source_type='payment'")"
eq2 "Restore reversal ledger rows" "$(runFP2 "select count(*) from public.financial_movement_ledger where entry_kind='reversal'")" "$(runFP "select count(*) from public.financial_movement_ledger where entry_kind='reversal'")"
eq2 "Restore payment idempotency keys" "$(runFP2 "select count(*) from public.payment_vouchers where idempotency_key is not null")" "$(runFP "select count(*) from public.payment_vouchers where idempotency_key is not null")"
eq2 "Restore payment idempotency key exact value" "$(runFP2 "select count(*) from public.payment_vouchers p where p.idempotency_key='$PAYKEY'")" "$(runFP "select count(*) from public.payment_vouchers p where p.idempotency_key='$PAYKEY'")"
eq2 "Restore cancelled receipt state" "$(runFP2 "select count(*) from public.receipt_vouchers where id='$RVD2' and cancelled_at is not null")" "1"
eq2 "Restore cancelled payment state" "$(runFP2 "select count(*) from public.payment_vouchers where id='$PAYID' and cancelled_at is not null")" "1"

run2 "$PGBIN/pg_ctl -D $DATADIR2 -w stop" >/dev/null 2>&1
rm -rf "$BASE2"

echo "== Expansion N1: authorization boundaries + direct-insert firewall ==";
cat > "$BASE/non_owner_payment.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000bb';
select public.post_payment_voucher('{"voucher_date":"2026-02-01","expense_type":"unauthorized","amount":1,"notes":"","idempotency_key":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/non_owner_payment.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/non_owner_payment.sql" >"$BASE/non_owner_payment.out" 2>&1; then
  fail "non-owner payment RPC was accepted"
else
  if grep -q "OWNER_ONLY" "$BASE/non_owner_payment.out"; then pass "non-owner payment RPC rejected"; else fail "wrong non-owner payment error"; sed 's/^/       /' "$BASE/non_owner_payment.out"; fi
fi

cat > "$BASE/non_owner_restore.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000bb';
select public.restore_center_data('{"students":[],"courses":[],"enrollments":[],"fee_obligations":[],"receipt_vouchers":[],"receipt_allocations":[],"payment_vouchers":[]}'::jsonb, false);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/non_owner_restore.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/non_owner_restore.sql" >"$BASE/non_owner_restore.out" 2>&1; then
  fail "non-owner restore RPC was accepted"
else
  if grep -q "OWNER_ONLY" "$BASE/non_owner_restore.out"; then pass "non-owner restore RPC rejected"; else fail "wrong non-owner restore error"; sed 's/^/       /' "$BASE/non_owner_restore.out"; fi
fi

cat > "$BASE/direct_payment.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select set_config('app.payment_posting','off',true);
insert into public.payment_vouchers (voucher_date, expense_type, amount, notes, idempotency_key)
values ('2026-02-02','direct-bypass',1,'', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/direct_payment.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/direct_payment.sql" >"$BASE/direct_payment.out" 2>&1; then
  fail "direct payment insert bypassed financial firewall"
else
  if grep -q "PAYMENT_POSTING_RPC_REQUIRED" "$BASE/direct_payment.out"; then pass "direct payment insert rejected when posting GUC is not on"; else fail "wrong direct payment firewall error"; sed 's/^/       /' "$BASE/direct_payment.out"; fi
fi
eq "Direct payment insert created no row" "$(runFP "select count(*) from public.payment_vouchers where idempotency_key='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'")" "0"

run "$PGBIN/pg_ctl -D $DATADIR -w stop" >/dev/null 2>&1
rm -rf "$BASE"
echo
if [ "$FAILED" = "0" ]; then echo "=============== ALL LAYER ASSERTIONS PASSED ==============="; else echo "=============== SOME ASSERTIONS FAILED ==============="; exit 1; fi
