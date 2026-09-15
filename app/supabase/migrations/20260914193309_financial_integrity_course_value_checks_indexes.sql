alter table public.enrollments add constraint enrollments_course_value_nonnegative check (course_value >= 0);
alter table public.receipt_vouchers add constraint receipt_vouchers_course_value_nonnegative check (course_value >= 0);
create index if not exists enrollments_student_id_idx on public.enrollments(student_id);
create index if not exists enrollments_course_id_idx on public.enrollments(course_id);
create index if not exists receipt_vouchers_student_id_idx on public.receipt_vouchers(student_id);
create index if not exists receipt_vouchers_voucher_date_idx on public.receipt_vouchers(voucher_date);
create index if not exists payment_vouchers_voucher_date_idx on public.payment_vouchers(voucher_date);