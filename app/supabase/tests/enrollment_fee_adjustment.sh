#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# REAL-PATH integration test for ADR-0078 owner-adjustable per-enrollment fee.
# ---------------------------------------------------------------------------
# NOT wired into CI (no Postgres service there). Run it locally against a
# THROWAWAY Postgres 16 — Production is never touched. It applies the FULL repo
# migration chain (including 20260928120000_owner_edit_enrollment_fee.sql), then
# drives the ACTUAL RPCs (post_receipt_with_allocations + update_enrollment_fee +
# restore_center_data) and reads the ACTUAL view (student_statement_lines) to
# prove the whole 16-point operating rule and acceptance criteria A–L across the
# scenarios A–P:
#   A  two enrollments in the same course change independently
#   B  cross-course isolation; course base_fee never changes
#   C  fee 300 / collected 100 → 250 leaves remaining 150
#   D  fee 100 / collected 100 → 80 rejected (FEE_BELOW_COLLECTED), atomic
#   E  fee 300 / collected 300 → 300 is a no-op: changed=false, NO audit row
#   F  a cancelled receipt's allocation is excluded from collected
#   G  legacy allocations are not double-counted
#   H  concurrency: the RPC serialises on the enrollment advisory-lock key
#   I  non-owner rejected (OWNER_ONLY)
#   J  anonymous rejected (OWNER_ONLY)
#   K  forged GUC by `authenticated` cannot bypass the firewall (no UPDATE grant)
#   L  invalid values rejected (negative, fractional, NaN, too large, no reason)
#   M  receipts / allocations / voucher rows are never modified by a fee change
#   N  restore round-trip accepts an enrollment whose fee diverges from base_fee
#   O  student_statement_lines remaining_balance reconciles with the new fee
#   P  regression: the firewall still blocks identity edits, snapshot mismatch,
#      and any course_value edit made outside the owner RPC
#
# Usage:
#   PGBIN=/usr/lib/postgresql/16/bin PG_RUNAS=pgtest bash enrollment_fee_adjustment.sh
#   (PG_RUNAS is the OS user to run the server as when the caller is root;
#    leave it empty to run psql/initdb directly as the current user.)
set -u
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PG_RUNAS="${PG_RUNAS:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/migrations"
BASE="${TMPDIR:-/tmp}/pgfee_$$"
DATADIR="$BASE/data"; SOCK="$BASE/sock"; LOG="$BASE/pg.log"
DB=fee
OWNER='00000000-0000-0000-0000-0000000000aa'
OTHER='00000000-0000-0000-0000-0000000000bb'
C1='00000000-0000-0000-0000-0000000c0001'   # course, base_fee 300
C2='00000000-0000-0000-0000-0000000c0002'   # course, base_fee 500
S1='00000000-0000-0000-0000-0000000a0001'
S2='00000000-0000-0000-0000-0000000a0002'
S3='00000000-0000-0000-0000-0000000a0003'
S4='00000000-0000-0000-0000-0000000a0004'
S5='00000000-0000-0000-0000-0000000a0005'
E1='00000000-0000-0000-0000-0000000e0001'   # S1 @ C1, fee 300  (main)
E2='00000000-0000-0000-0000-0000000e0002'   # S2 @ C1, fee 300  (isolation, same course)
E3='00000000-0000-0000-0000-0000000e0003'   # S3 @ C2, fee 500  (cross-course)
E4='00000000-0000-0000-0000-0000000e0004'   # S4 @ C1, fee 300  (full-payment no-op)
E5='00000000-0000-0000-0000-0000000e0005'   # S5 @ C1, fee 300  (concurrency probe)

if [ -n "$PG_RUNAS" ]; then run() { su "$PG_RUNAS" -c "$1"; }; else run() { bash -c "$1"; }; fi
PU="${PG_RUNAS:-$USER}"
runFP() { run "$PGBIN/psql -h $SOCK -U $PU -X -qtA -d $DB -c \"$1\"" | tr -d '[:space:]'; }
# Write $2 (SQL text) to a temp file and run it capturing combined output in $BASE/$1.out
runFILE() { local tag="$1"; shift; printf '%s\n' "$1" > "$BASE/$tag.sql"; [ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/$tag.sql"; run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -qtA -d $DB -f $BASE/$tag.sql" >"$BASE/$tag.out" 2>&1; return $?; }

FAILED=0
pass() { echo "   PASS: $1"; }
fail() { echo "   FAIL: $1"; FAILED=1; }
eq() { if [ "$2" = "$3" ]; then pass "$1 = $2"; else fail "$1 expected $3, got $2"; fi; }
expect_err() { if grep -q "$2" "$BASE/$1.out"; then pass "$3 [$2]"; else fail "$3 expected error $2"; sed 's/^/       /' "$BASE/$1.out"; fi; }
expect_ok() { if [ "$1" = "0" ]; then pass "$2"; else fail "$2 (rpc errored)"; sed 's/^/       /' "$BASE/$3.out"; fi; }

# --- owner-scoped RPC callers -------------------------------------------------
# update_enrollment_fee as OWNER
fee() { # $1 enrollment  $2 amount  $3 reason -> exit status, output in fee.out
  runFILE fee "set request.jwt.claim.sub = '$OWNER'; select public.update_enrollment_fee('$1', $2, '$3');"
}
# update_enrollment_fee as an arbitrary claim + optional role
fee_as() { # $1 claim  $2 role(''|anon|authenticated)  $3 enrollment  $4 amount  $5 reason
  local roleline=""; [ -n "$2" ] && roleline="set role $2;"
  runFILE feeas "set request.jwt.claim.sub = '$1'; $roleline select public.update_enrollment_fee('$3', $4, '$5');"
}
# post a course receipt as OWNER
receipt() { # $1 student  $2 name  $3 enrollment  $4 amount  $5 idem-key
  runFILE rcpt "set request.jwt.claim.sub = '$OWNER'; select public.post_receipt_with_allocations('{\"student_id\":\"$1\",\"student_name\":\"$2\",\"voucher_date\":\"2026-02-01\",\"amount_received\":$4,\"payer_name\":\"$2\",\"notes\":\"\",\"idempotency_key\":\"$5\",\"allocations\":[{\"type\":\"course\",\"enrollment_id\":\"$3\",\"amount\":$4}]}'::jsonb);"
}

rm -rf "$BASE"; mkdir -p "$DATADIR" "$SOCK"; [ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE"

run "$PGBIN/initdb -D $DATADIR -U $PU --auth=trust -E UTF8" >"$BASE/initdb.log" 2>&1 || { echo initdb FAIL; tail "$BASE/initdb.log"; exit 1; }
run "$PGBIN/pg_ctl -D $DATADIR -l $LOG -o '-c unix_socket_directories=$SOCK -c listen_addresses=\"\"' -w start" >/dev/null || { cat "$LOG"; exit 1; }
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d postgres -c \"do \\\$\\\$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname='postgres') then create role postgres superuser login; end if;
end \\\$\\\$;\"" || exit 1
run "$PGBIN/createdb -h $SOCK -U $PU $DB" || exit 1
# authenticated / anon must be able to reach the schema so grant-based denials are exercised.
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -c \"grant usage on schema public to anon, authenticated;\"" || exit 1

# Minimal Supabase-compatible auth stub. TWO users: OWNER (earliest → is_owner) + OTHER.
cat > "$BASE/stubs.sql" <<SQL
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text, created_at timestamptz not null default now());
create or replace function auth.uid() returns uuid language sql stable as \$fn\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$fn\$;
create or replace function auth.jwt() returns jsonb language sql stable as \$fn\$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb \$fn\$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable() returns void language plpgsql as \$fn\$ begin end \$fn\$;
insert into auth.users (id, email, created_at) values ('$OWNER', 'owner@test.local', '2020-01-01T00:00:00Z');
insert into auth.users (id, email, created_at) values ('$OTHER', 'other@test.local', '2021-01-01T00:00:00Z');
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
# authenticated needs execute on the RPCs it is meant to call (mirrors Supabase grants).
run "$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB -c \"grant select on public.enrollments, public.receipt_vouchers, public.receipt_allocations to authenticated;\"" >/dev/null 2>&1

echo "== seed: 5 students + 2 courses + 5 enrollments (fees = base) =="
cat > "$BASE/seed.sql" <<SQL
set session_replication_role = replica;
insert into public.courses (id, name, base_fee, status) values
  ('$C1','دورة الرياضيات',300,'active'),
  ('$C2','دورة الفيزياء',500,'active');
insert into public.students (id, name, status) values
  ('$S1','طالب أ','active'),
  ('$S2','طالب ب','active'),
  ('$S3','طالب ج','active'),
  ('$S4','طالب د','active'),
  ('$S5','طالب هـ','active');
insert into public.enrollments (id, student_id, course_id, course_name, course_value) values
  ('$E1','$S1','$C1','دورة الرياضيات',300),
  ('$E2','$S2','$C1','دورة الرياضيات',300),
  ('$E3','$S3','$C2','دورة الفيزياء',500),
  ('$E4','$S4','$C1','دورة الرياضيات',300),
  ('$E5','$S5','$C1','دورة الرياضيات',300);
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/seed.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f $BASE/seed.sql" || { echo seed FAIL; exit 1; }

echo "== seed receipts (course allocations) =="
receipt "$S1" "طالب أ" "$E1" 100 11111111-0000-0000-0000-000000000001   # E1 collected 100
receipt "$S4" "طالب د" "$E4" 300 44444444-0000-0000-0000-000000000004   # E4 fully paid 300
eq "seed E1 collected" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E1' and rv.cancelled_at is null")" "100"
eq "seed E4 collected" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E4' and rv.cancelled_at is null")" "300"

echo
echo "== C: fee 300 / collected 100 → 250, remaining 150 =="
fee "$E1" 250 "تصحيح رسوم التسجيل"; expect_ok "$?" "C update_enrollment_fee(E1,250) succeeded" fee
eq "C RPC returned remaining=150" "$(grep -o '\"remaining\": *[0-9.]*' "$BASE/fee.out" | grep -o '[0-9.]*$' | cut -d. -f1)" "150"
eq "C E1.course_value now"  "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "250"
eq "C E1 remaining (fee-collected)" "$(runFP "select (course_value - 100)::int from public.enrollments where id='$E1'")" "150"

echo
echo "== A: same-course sibling E2 is untouched =="
eq "A E2.course_value unchanged" "$(runFP "select course_value::int from public.enrollments where id='$E2'")" "300"

echo
echo "== B: cross-course isolation + course base_fee unchanged =="
eq "B E3.course_value unchanged"  "$(runFP "select course_value::int from public.enrollments where id='$E3'")" "500"
eq "B C1.base_fee unchanged (300)" "$(runFP "select base_fee::int from public.courses where id='$C1'")" "300"
eq "B C2.base_fee unchanged (500)" "$(runFP "select base_fee::int from public.courses where id='$C2'")" "500"

echo
echo "== D: cannot lower E1 below collected 100 (→ 80) =="
fee "$E1" 80 "محاولة خفض غير مسموح"
expect_err fee "FEE_BELOW_COLLECTED" "D lowering below collected rejected"
eq "D E1.course_value unchanged after reject (250)" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "250"

echo
echo "== D2: lowering to exactly collected 100 is allowed (remaining 0) =="
fee "$E1" 100 "خفض إلى المحصّل"; expect_ok "$?" "D2 lower to exactly collected accepted" fee
eq "D2 E1.course_value now 100" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "100"
# restore E1 to a workable 300 for later cases
fee "$E1" 300 "إعادة الضبط"; expect_ok "$?" "D2 raise back to 300" fee

echo
echo "== E: full-paid E4 set to same 300 → no-op (changed=false, no new audit row) =="
BEFORE_AUD=$(runFP "select count(*)::int from public.audit_log where entity='enrollment' and action='fee_adjustment'")
fee "$E4" 300 "بدون تغيير"; expect_ok "$?" "E no-op call succeeds" fee
if grep -q '"changed": false' "$BASE/fee.out"; then pass "E changed=false"; else fail "E changed flag not false"; sed 's/^/       /' "$BASE/fee.out"; fi
AFTER_AUD=$(runFP "select count(*)::int from public.audit_log where entity='enrollment' and action='fee_adjustment'")
eq "E no new audit row on no-op" "$AFTER_AUD" "$BEFORE_AUD"

echo
echo "== E2: full-paid E4 → 400 allowed; → 250 rejected (below collected 300) =="
fee "$E4" 400 "زيادة الرسوم"; expect_ok "$?" "E2 raise fully-paid fee to 400" fee
eq "E2 E4 remaining now 100" "$(runFP "select (course_value-300)::int from public.enrollments where id='$E4'")" "100"
fee "$E4" 250 "خفض غير مسموح"; expect_err fee "FEE_BELOW_COLLECTED" "E2 lower fully-paid below collected rejected"

echo
echo "== F: a CANCELLED receipt's allocation is excluded from collected =="
receipt "$S2" "طالب ب" "$E2" 120 22222222-0000-0000-0000-000000000022   # E2 collected 120
RV_CANCEL=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.enrollment_id='$E2'")
# A receipt is cancelled by the owner via a direct UPDATE that sets cancelled_at +
# reason (the financial firewall permits cancellation; all financial fields stay put).
runFILE cancel "set request.jwt.claim.sub = '$OWNER'; update public.receipt_vouchers set cancelled_at = now(), cancel_reason = 'خطأ إدخال' where id = '$RV_CANCEL';" || true
eq "F E2 collected after cancel = 0" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E2' and rv.cancelled_at is null")" "0"
fee "$E2" 50 "خفض بعد الإلغاء"; expect_ok "$?" "F can lower E2 to 50 once receipt cancelled" fee
eq "F E2.course_value now 50" "$(runFP "select course_value::int from public.enrollments where id='$E2'")" "50"
fee "$E2" 300 "إعادة الضبط"; expect_ok "$?" "F restore E2 to 300" fee

echo
echo "== G: legacy allocations are not double-counted (collected == Σ once) =="
# E1 has exactly one non-cancelled allocation of 100; RPC's collected must equal it.
eq "G E1 collected counted once" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E1' and rv.cancelled_at is null")" "100"
fee "$E1" 100 "الحد الأدنى المحصّل"; expect_ok "$?" "G lower to exactly-once collected 100 accepted" fee
fee "$E1" 99 "أقل من المحصّل"; expect_err fee "FEE_BELOW_COLLECTED" "G 99 < collected 100 rejected"
fee "$E1" 300 "إعادة الضبط"; expect_ok "$?" "G restore E1 to 300" fee

echo
echo "== I: non-owner rejected (OWNER_ONLY) =="
fee_as "$OTHER" "authenticated" "$E1" 200 "محاولة غير المالك"
expect_err feeas "OWNER_ONLY" "I authenticated non-owner rejected"
eq "I E1.course_value unchanged (300)" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "300"

echo
echo "== J: anonymous rejected (no execute grant / OWNER_ONLY) =="
fee_as "" "anon" "$E1" 200 "محاولة مجهول"
if grep -qi "permission denied\|OWNER_ONLY" "$BASE/feeas.out"; then pass "J anon rejected"; else fail "J anon NOT rejected"; sed 's/^/       /' "$BASE/feeas.out"; fi
eq "J E1.course_value unchanged (300)" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "300"

echo
echo "== K: forged GUC by 'authenticated' cannot bypass firewall (no UPDATE grant) =="
runFILE forge "set request.jwt.claim.sub = '$OWNER'; set role authenticated; set app.enrollment_fee_editing = 'on'; update public.enrollments set course_value = 999 where id = '$E1';"
if grep -qi "permission denied\|ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE" "$BASE/forge.out"; then pass "K forged-GUC direct UPDATE blocked"; else fail "K forged-GUC UPDATE was NOT blocked"; sed 's/^/       /' "$BASE/forge.out"; fi
eq "K E1.course_value still 300" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "300"

echo
echo "== L: invalid values rejected =="
fee "$E1" -5 "سالب";         expect_err fee "INVALID_FEE_AMOUNT" "L negative rejected"
fee "$E1" 250.5 "كسري";      expect_err fee "INVALID_FEE_AMOUNT" "L fractional rejected"
fee "$E1" "'NaN'::numeric" "لا رقم"; expect_err fee "INVALID_FEE_AMOUNT" "L NaN rejected"
fee "$E1" 100000001 "ضخم";   expect_err fee "FEE_AMOUNT_TOO_LARGE" "L too-large rejected"
fee "$E1" 250 "";            expect_err fee "FEE_ADJUSTMENT_REASON_REQUIRED" "L empty reason rejected"
fee "$E1" 250 "   ";         expect_err fee "FEE_ADJUSTMENT_REASON_REQUIRED" "L whitespace-only reason rejected"
runFILE nf "set request.jwt.claim.sub = '$OWNER'; select public.update_enrollment_fee('00000000-0000-0000-0000-0000000eFFFF', 250, 'غير موجود');"
expect_err nf "ENROLLMENT_NOT_FOUND" "L unknown enrollment rejected"
eq "L E1.course_value untouched by invalid attempts (300)" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "300"

echo
echo "== M: receipts / allocations / vouchers never modified by a fee change =="
RV_E1=$(runFP "select rv.id from public.receipt_vouchers rv join public.receipt_allocations ra on ra.receipt_voucher_id=rv.id where ra.enrollment_id='$E1' and rv.cancelled_at is null")
BEFORE_ROW=$(runFP "select md5(coalesce(amount_received::text,'')||'|'||coalesce(course_value::text,'')||'|'||coalesce(cancelled_at::text,'')) from public.receipt_vouchers where id='$RV_E1'")
BEFORE_ALLOC=$(runFP "select md5(string_agg(allocation_type||coalesce(enrollment_id::text,'')||amount::text, ',' order by id::text)) from public.receipt_allocations where receipt_voucher_id='$RV_E1'")
fee "$E1" 275 "تغيير مع حفظ الإيصالات"; expect_ok "$?" "M fee change to 275 succeeds" fee
AFTER_ROW=$(runFP "select md5(coalesce(amount_received::text,'')||'|'||coalesce(course_value::text,'')||'|'||coalesce(cancelled_at::text,'')) from public.receipt_vouchers where id='$RV_E1'")
AFTER_ALLOC=$(runFP "select md5(string_agg(allocation_type||coalesce(enrollment_id::text,'')||amount::text, ',' order by id::text)) from public.receipt_allocations where receipt_voucher_id='$RV_E1'")
eq "M receipt_voucher row unchanged" "$AFTER_ROW" "$BEFORE_ROW"
eq "M receipt_allocation rows unchanged" "$AFTER_ALLOC" "$BEFORE_ALLOC"

echo
echo "== O: student_statement_lines reconciles with the new fee =="
fee "$E1" 250 "إعادة الضبط للتسوية"; expect_ok "$?" "O set E1 fee to 250" fee
eq "O statement course_value = 250"     "$(runFP "select course_value::int from public.student_statement_lines where enrollment_id='$E1' and entry_type='course'")" "250"
eq "O statement remaining_balance = 150" "$(runFP "select remaining_balance::int from public.student_statement_lines where enrollment_id='$E1' and entry_type='course'")" "150"

echo
echo "== audit trail: the O-change wrote one immutable row with old/new/reason/actor =="
# Deterministic: assert the exact fee_adjustment row for O (E1 275→250) exists, with
# reason, actor, and metadata. (changed_at can tie, so match on content, not "last".)
eq "audit O-change row present (old 275, new 250, reason, actor)" \
  "$(runFP "select count(*)::int from public.audit_log where entity='enrollment' and action='fee_adjustment' and (metadata->>'enrollment_id')::uuid='$E1' and (metadata->>'old_amount')::numeric=275 and (metadata->>'new_amount')::numeric=250 and description='إعادة الضبط للتسوية' and changed_by='$OWNER'")" "1"

echo
echo "== H: actual concurrent receipt-posting vs fee-adjustment race =="
# Dedicated E5 starts at fee=300 with collected=0. Two REAL RPCs race:
#   fee RPC tries 300→50
#   receipt RPC tries to collect 100
# They share the same enrollment advisory-lock key. Exactly one operation may
# succeed; the other must reject against the state established by the winner.
eq "H E5 starts at fee 300" "$(runFP "select course_value::int from public.enrollments where id='$E5'")" "300"
eq "H E5 starts with collected 0" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E5' and rv.cancelled_at is null")" "0"

cat > "$BASE/h_fee.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.update_enrollment_fee('$E5', 50, 'اختبار سباق الرسوم');
SQL
cat > "$BASE/h_receipt.sql" <<SQL
set request.jwt.claim.sub = '$OWNER';
select public.post_receipt_with_allocations('{"student_id":"$S5","student_name":"طالب هـ","voucher_date":"2026-02-01","amount_received":100,"payer_name":"طالب هـ","notes":"","idempotency_key":"55555555-0000-0000-0000-000000000055","allocations":[{"type":"course","enrollment_id":"$E5","amount":100}]}'::jsonb);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/h_fee.sql" "$BASE/h_receipt.sql"

for H_ITER in 1 2 3 4 5; do
  # The winner is determined by actual lock acquisition; both calls below are
  # real production RPCs, not synthetic lock probes.
  rm -f "$BASE/h_fee.out" "$BASE/h_receipt.out"
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -qtA -d $DB -f $BASE/h_fee.sql" >"$BASE/h_fee.out" 2>&1 &
  HF_PID=$!
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -qtA -d $DB -f $BASE/h_receipt.sql" >"$BASE/h_receipt.out" 2>&1 &
  HR_PID=$!
  wait "$HF_PID"; HF_RC=$?
  wait "$HR_PID"; HR_RC=$?

  H_SUCC=0
  [ "$HF_RC" -eq 0 ] && H_SUCC=$((H_SUCC + 1))
  [ "$HR_RC" -eq 0 ] && H_SUCC=$((H_SUCC + 1))
  if [ "$H_SUCC" -ne 1 ]; then
    fail "H iteration $H_ITER: expected exactly one RPC to succeed (fee_rc=$HF_RC receipt_rc=$HR_RC)"
    sed 's/^/       fee: /' "$BASE/h_fee.out"
    sed 's/^/       receipt: /' "$BASE/h_receipt.out"
  else
    H_FEE=$(runFP "select course_value::int from public.enrollments where id='$E5'")
    H_PAID=$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E5' and rv.cancelled_at is null")
    if [ "$H_FEE" = "50" ] && [ "$H_PAID" = "0" ] && [ "$HF_RC" -eq 0 ]; then
      pass "H iteration $H_ITER: fee won; receipt rejected, final fee=50 collected=0"
    elif [ "$H_FEE" = "300" ] && [ "$H_PAID" = "100" ] && [ "$HR_RC" -eq 0 ]; then
      pass "H iteration $H_ITER: receipt won; fee rejected, final fee=300 collected=100"
    else
      fail "H iteration $H_ITER: unexpected final state fee=$H_FEE collected=$H_PAID"
      sed 's/^/       fee: /' "$BASE/h_fee.out"
      sed 's/^/       receipt: /' "$BASE/h_receipt.out"
    fi
  fi

  # Clean only this dedicated probe data before the next iteration. Replication
  # mode is used here solely because the harness is resetting disposable test data;
  # production business rules are still exercised by both racing RPCs above.
  runFILE hclean "set session_replication_role = replica; delete from public.receipt_allocations where enrollment_id='$E5'; delete from public.receipt_vouchers where student_id='$S5'; update public.enrollments set course_value=300 where id='$E5'; set session_replication_role = origin;" || true
done

eq "H E5 final fee restored to 300" "$(runFP "select course_value::int from public.enrollments where id='$E5'")" "300"
eq "H E5 final collected restored to 0" "$(runFP "select coalesce(sum(ra.amount),0)::int from public.receipt_allocations ra join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id where ra.enrollment_id='$E5' and rv.cancelled_at is null")" "0"

echo
echo "== P: firewall regression (identity + snapshot + non-RPC course_value) =="
runFILE p1 "update public.enrollments set student_id='$S2' where id='$E1';"
expect_err p1 "ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE" "P student_id edit blocked"
runFILE p2 "update public.enrollments set course_name='آخر' where id='$E1';"
expect_err p2 "ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE" "P course_name edit blocked"
runFILE p3 "update public.enrollments set course_value=1 where id='$E1';"
expect_err p3 "ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE" "P course_value edit WITHOUT RPC blocked (as table owner)"
runFILE p4 "insert into public.enrollments (id, student_id, course_id, course_name, course_value) values (gen_random_uuid(), '$S1', '$C1', 'دورة الرياضيات', 999);"
expect_err p4 "ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH" "P insert with course_value≠base_fee blocked"

echo
echo "== N: restore round-trip accepts fee-diverged enrollment (last, destructive) =="
cat > "$BASE/restore.sql" <<'SQL'
set request.jwt.claim.sub = 'OWNER_UUID';
select public.restore_center_data($$
{
  "courses": [{"id":"C1_UUID","name":"دورة الرياضيات","base_fee":300}],
  "students": [{"id":"S1_UUID","name":"طالب أ","id_number":"1","phone":"","notes":""}],
  "enrollments": [{"id":"E1_UUID","student_id":"S1_UUID","course_id":"C1_UUID","course_name":"دورة الرياضيات","course_value":250}],
  "fee_obligations": [],
  "receipt_vouchers": [{"id":"RV1_UUID","voucher_number":1,"voucher_date":"2026-02-01","student_id":"S1_UUID","student_name_snapshot":"طالب أ","course_name":"دورة الرياضيات","course_value":250,"amount_received":100,"payer_name":"طالب أ","notes":"","allocation_mode":true}],
  "receipt_allocations": [{"id":"RA1_UUID","receipt_voucher_id":"RV1_UUID","allocation_type":"course","enrollment_id":"E1_UUID","amount":100}],
  "payment_vouchers": []
}
$$::jsonb, true);
SQL
sed -i "s/OWNER_UUID/$OWNER/g; s/C1_UUID/$C1/g; s/S1_UUID/$S1/g; s/E1_UUID/$E1/g; s/RV1_UUID/11111111-1111-1111-1111-111111111111/g; s/RA1_UUID/22222222-2222-2222-2222-222222222222/g" "$BASE/restore.sql"
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/restore.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -qtA -d $DB -f $BASE/restore.sql" >"$BASE/restore.out" 2>&1
RESTORE_RC=$?
if [ "$RESTORE_RC" = "0" ] && grep -q '"enrollments"' "$BASE/restore.out"; then pass "N restore SUCCEEDED with fee-diverged enrollment"; else fail "N restore did not succeed"; sed 's/^/       /' "$BASE/restore.out"; fi
eq "N restored E1.course_value = 250" "$(runFP "select course_value::int from public.enrollments where id='$E1'")" "250"
eq "N restored enrollment count = 1"  "$(runFP "select count(*)::int from public.enrollments")" "1"

run "$PGBIN/pg_ctl -D $DATADIR -w stop" >/dev/null 2>&1
rm -rf "$BASE"
echo
if [ "$FAILED" = "0" ]; then echo "=============== ALL ADR-0078 FEE ASSERTIONS PASSED ==============="; else echo "=============== SOME ASSERTIONS FAILED ==============="; exit 1; fi
