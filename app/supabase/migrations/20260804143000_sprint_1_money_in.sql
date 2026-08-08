create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create table if not exists public.receipt_vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_number bigint generated always as identity unique,
  voucher_date date not null,
  student_id uuid not null references public.students(id) on delete restrict,
  student_name_snapshot text not null,
  course_name text not null,
  course_value numeric(12, 2) not null,
  amount_received numeric(12, 2) not null,
  payer_name text not null,
  notes text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint receipt_vouchers_course_value_non_negative check (course_value >= 0),
  constraint receipt_vouchers_amount_received_positive check (amount_received > 0)
);

create or replace view public.student_statement_lines as
select
  rv.id,
  rv.voucher_number,
  rv.voucher_date,
  rv.student_id,
  rv.student_name_snapshot as student_name,
  rv.course_name,
  rv.course_value,
  rv.amount_received,
  rv.notes,
  rv.payer_name,
  rv.created_at,
  rv.course_value - sum(rv.amount_received) over (
    partition by rv.student_id, rv.course_name
    order by rv.voucher_date, rv.voucher_number
    rows between unbounded preceding and current row
  ) as remaining_balance
from public.receipt_vouchers rv;