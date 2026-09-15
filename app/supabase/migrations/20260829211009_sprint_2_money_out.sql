create extension if not exists pgcrypto;

create table if not exists public.payment_vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_number bigint generated always as identity unique,
  voucher_date date not null,
  expense_type text not null,
  amount numeric(12, 2) not null,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  constraint payment_vouchers_amount_positive check (amount > 0)
);