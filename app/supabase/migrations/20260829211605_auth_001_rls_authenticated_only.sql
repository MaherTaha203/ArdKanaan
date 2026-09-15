-- AUTH-001 — secure the project: authenticated-only access, immutable vouchers.

-- Views respect the caller's RLS (also fixes the security_definer_view lint).
alter view public.student_statement_lines set (security_invoker = true);
alter view public.financial_movements set (security_invoker = true);

-- Harden the trigger function's search_path.
alter function public.set_updated_at() set search_path = '';

-- RLS on (already auto-enabled; explicit for clarity/idempotence).
alter table public.students enable row level security;
alter table public.receipt_vouchers enable row level security;
alter table public.payment_vouchers enable row level security;

-- Least privilege: nothing for anon; authenticated gets read + append only.
revoke all on public.students from anon, authenticated;
revoke all on public.receipt_vouchers from anon, authenticated;
revoke all on public.payment_vouchers from anon, authenticated;
revoke all on public.student_statement_lines from anon, authenticated;
revoke all on public.financial_movements from anon, authenticated;

grant select, insert on public.students to authenticated;
grant select, insert on public.receipt_vouchers to authenticated;
grant select, insert on public.payment_vouchers to authenticated;
grant select on public.student_statement_lines to authenticated;
grant select on public.financial_movements to authenticated;

-- RLS policies: authenticated may read all and append; no update/delete policy
-- (vouchers are corrected by a new voucher, never edited or deleted).
drop policy if exists students_auth_select on public.students;
create policy students_auth_select on public.students for select to authenticated using (true);
drop policy if exists students_auth_insert on public.students;
create policy students_auth_insert on public.students for insert to authenticated with check (true);

drop policy if exists receipts_auth_select on public.receipt_vouchers;
create policy receipts_auth_select on public.receipt_vouchers for select to authenticated using (true);
drop policy if exists receipts_auth_insert on public.receipt_vouchers;
create policy receipts_auth_insert on public.receipt_vouchers for insert to authenticated with check (true);

drop policy if exists payments_auth_select on public.payment_vouchers;
create policy payments_auth_select on public.payment_vouchers for select to authenticated using (true);
drop policy if exists payments_auth_insert on public.payment_vouchers;
create policy payments_auth_insert on public.payment_vouchers for insert to authenticated with check (true);