#!/usr/bin/env bash
set -euo pipefail

PGBIN="${PGBIN:-/usr/bin}"
PG_RUNAS="${PG_RUNAS:-}"
USER="${USER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/migrations"
BASE="${TMPDIR:-/tmp}/pgstudent_lifecycle_$$"
DATADIR="$BASE/data"; SOCK="$BASE/sock"; LOG="$BASE/pg.log"; DB=student_lifecycle
OWNER='00000000-0000-0000-0000-0000000000aa'
NON_OWNER='00000000-0000-0000-0000-0000000000bb'
STUDENT='00000000-0000-0000-0000-0000000a2001'

if [ -n "$PG_RUNAS" ]; then run(){ su "$PG_RUNAS" -c "$1"; }; else run(){ bash -c "$1"; }; fi
PU="${PG_RUNAS:-$USER}"
PSQL="$PGBIN/psql -h $SOCK -U $PU -X -q -d $DB"
query(){ run "$PSQL -qtA -c \"$1\"" | tr -d '[:space:]'; }
cleanup(){ run "$PGBIN/pg_ctl -D $DATADIR -w stop" >/dev/null 2>&1 || true; rm -rf "$BASE"; }
trap cleanup EXIT

rm -rf "$BASE"; mkdir -p "$DATADIR" "$SOCK"
[ -n "$PG_RUNAS" ] && chown -R "$PG_RUNAS" "$BASE"
run "$PGBIN/initdb -D $DATADIR -U $PU --auth=trust -E UTF8" >/dev/null 2>&1
run "$PGBIN/pg_ctl -D $DATADIR -l $LOG -o '-c unix_socket_directories=$SOCK -c listen_addresses=\"\"' -w start" >/dev/null

cat > "$BASE/roles.sql" <<'SQL'
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
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
create or replace function auth.uid() returns uuid language sql stable as \$fn\$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
\$fn\$;
create or replace function auth.jwt() returns jsonb language sql stable as \$fn\$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
\$fn\$;
grant usage on schema auth to anon, authenticated, service_role;
create or replace function public.rls_auto_enable() returns void language plpgsql as \$fn\$
begin end
\$fn\$;
insert into auth.users (id,email) values
  ('$OWNER','owner@test.local'),
  ('$NON_OWNER','nonowner@test.local')
on conflict do nothing;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/stubs.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/stubs.sql'"

while IFS= read -r -d '' f; do
  run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$f'"
done < <(find "$MIG" -maxdepth 1 -type f -name '*.sql' -print0 | sort -z)

cat > "$BASE/seed.sql" <<SQL
insert into public.owner_identity (id) values ('$OWNER') on conflict do nothing;
set session_replication_role = replica;
insert into public.students (id,name,status)
values ('$STUDENT','طالب دورة الحياة','active');
set session_replication_role = origin;
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/seed.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/seed.sql'"

assert(){ [ "$1" = "$2" ] || { echo "FAIL: $3 expected=$2 actual=$1"; exit 1; }; echo "PASS: $3 = $1"; }

assert "$(query "select p.prosecdef::int from pg_proc p where p.oid='public.complete_student(uuid,text)'::regprocedure")" "1" "complete_student SECURITY DEFINER"
assert "$(query "select p.prosecdef::int from pg_proc p where p.oid='public.reactivate_student(uuid)'::regprocedure")" "1" "reactivate_student SECURITY DEFINER"
assert "$(query "select case when has_function_privilege('anon','public.complete_student(uuid,text)','execute') then 1 else 0 end")" "0" "complete_student anon EXECUTE revoked"
assert "$(query "select case when has_function_privilege('authenticated','public.complete_student(uuid,text)','execute') then 1 else 0 end")" "1" "complete_student authenticated EXECUTE"
assert "$(query "select case when has_function_privilege('anon','public.reactivate_student(uuid)','execute') then 1 else 0 end")" "0" "reactivate_student anon EXECUTE revoked"
assert "$(query "select case when has_function_privilege('authenticated','public.reactivate_student(uuid)','execute') then 1 else 0 end")" "1" "reactivate_student authenticated EXECUTE"
assert "$(query "select case when array_to_string(coalesce(p.proconfig,'{}'),'|') like '%search_path=%' then 1 else 0 end from pg_proc p where p.oid='public.complete_student(uuid,text)'::regprocedure")" "1" "complete_student explicit search_path"

cat > "$BASE/non_owner.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '$NON_OWNER';
select public.complete_student('$STUDENT'::uuid,'unauthorized');
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/non_owner.sql"
if run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/non_owner.sql'" >"$BASE/non_owner.out" 2>&1; then
  echo 'FAIL: non-owner complete accepted'; exit 1
fi
grep -q 'OWNER_ONLY' "$BASE/non_owner.out" || { echo 'FAIL: wrong non-owner error'; cat "$BASE/non_owner.out"; exit 1; }
echo 'PASS: non-owner complete rejected by RPC guard'
assert "$(query "select status from public.students where id='$STUDENT'")" "active" "non-owner cannot change student"

cat > "$BASE/owner.sql" <<SQL
set role authenticated;
set request.jwt.claim.sub = '$OWNER';
select public.complete_student('$STUDENT'::uuid,'completed by owner');
select public.reactivate_student('$STUDENT'::uuid);
SQL
[ -n "$PG_RUNAS" ] && chown "$PG_RUNAS" "$BASE/owner.sql"
run "$PGBIN/psql -h $SOCK -U $PU -v ON_ERROR_STOP=1 -X -q -d $DB -f '$BASE/owner.sql'" >/dev/null
assert "$(query "select status from public.students where id='$STUDENT'")" "active" "owner lifecycle transitions succeed"

echo '=============== STUDENT LIFECYCLE ACCESS SUITE PASSED ==============='
